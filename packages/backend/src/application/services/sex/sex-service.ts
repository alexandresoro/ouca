import { type SexFailureReason } from "@domain/sex/sex.js";
import { type AccessFailureReason } from "@domain/shared/failure-reason.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type Sex } from "@ou-ca/common/api/entities/sex";
import { type SexesSearchParams, type UpsertSexInput } from "@ou-ca/common/api/sex";
import { err, ok, type Result } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type SexeCreateInput } from "../../../repositories/sexe/sexe-repository-types.js";
import { type SexeRepository } from "../../../repositories/sexe/sexe-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../../../services/entities/entities-utils.js";
import { COLUMN_LIBELLE } from "../../../utils/constants.js";

type SexServiceDependencies = {
  sexRepository: SexeRepository;
  entryRepository: DonneeRepository;
};

export const buildSexService = ({ sexRepository, entryRepository }: SexServiceDependencies) => {
  const findSex = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<Sex | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const sex = await sexRepository.findSexeById(id);
    return ok(enrichEntityWithEditableStatus(sex, loggedUser));
  };

  const findSexOfEntryId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Result<Sex | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const sex = await sexRepository.findSexeByDonneeId(donneeId ? parseInt(donneeId) : undefined);
    return ok(enrichEntityWithEditableStatus(sex, loggedUser));
  };

  const getEntriesCountBySex = async (
    id: string,
    loggedUser: LoggedUser | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountBySexeId(parseInt(id)));
  };

  const findAllSexes = async (): Promise<Sex[]> => {
    const sexes = await sexRepository.findSexes({
      orderBy: COLUMN_LIBELLE,
    });

    const enrichedSexes = sexes.map((sex) => {
      return enrichEntityWithEditableStatus(sex, null);
    });

    return [...enrichedSexes];
  };

  const findPaginatedSexes = async (
    loggedUser: LoggedUser | null,
    options: SexesSearchParams
  ): Promise<Result<Sex[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const sexes = await sexRepository.findSexes({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedSexes = sexes.map((sex) => {
      return enrichEntityWithEditableStatus(sex, loggedUser);
    });

    return ok([...enrichedSexes]);
  };

  const getSexesCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await sexRepository.getCount(q));
  };

  const createSex = async (
    input: UpsertSexInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<Sex, SexFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    try {
      const createdSex = await sexRepository.createSexe({
        ...input,
        owner_id: loggedUser.id,
      });

      return ok(enrichEntityWithEditableStatus(createdSex, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const updateSex = async (
    id: number,
    input: UpsertSexInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<Sex, SexFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await sexRepository.findSexeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    try {
      const updatedSex = await sexRepository.updateSexe(id, input);

      return ok(enrichEntityWithEditableStatus(updatedSex, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const deleteSex = async (id: number, loggedUser: LoggedUser | null): Promise<Result<Sex, SexFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await sexRepository.findSexeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedSex = await sexRepository.deleteSexeById(id);
    return ok(enrichEntityWithEditableStatus(deletedSex, loggedUser));
  };

  const createSexes = async (
    sexes: Omit<SexeCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly Sex[]> => {
    const createdSexes = await sexRepository.createSexes(
      sexes.map((sexe) => {
        return { ...sexe, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedSexes = createdSexes.map((sex) => {
      return enrichEntityWithEditableStatus(sex, loggedUser);
    });

    return enrichedCreatedSexes;
  };

  return {
    findSex,
    findSexOfEntryId,
    getEntriesCountBySex,
    findAllSexes,
    findPaginatedSexes,
    getSexesCount,
    createSex,
    updateSex,
    deleteSex,
    createSexes,
  };
};

export type SexService = ReturnType<typeof buildSexService>;
