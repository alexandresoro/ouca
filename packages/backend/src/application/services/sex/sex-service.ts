import { type SexCreateInput, type SexFailureReason } from "@domain/sex/sex.js";
import { type AccessFailureReason } from "@domain/shared/failure-reason.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type SexRepository } from "@interfaces/sex-repository-interface.js";
import { type Sex } from "@ou-ca/common/api/entities/sex";
import { type SexesSearchParams, type UpsertSexInput } from "@ou-ca/common/api/sex";
import { type Result, err, ok } from "neverthrow";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../../../services/entities/entities-utils.js";

type SexServiceDependencies = {
  sexRepository: SexRepository;
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

    const sex = await sexRepository.findSexById(id);
    return ok(enrichEntityWithEditableStatus(sex, loggedUser));
  };

  const findSexOfEntryId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Result<Sex | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const sex = await sexRepository.findSexByEntryId(entryId ? Number.parseInt(entryId) : undefined);
    return ok(enrichEntityWithEditableStatus(sex, loggedUser));
  };

  const getEntriesCountBySex = async (
    id: string,
    loggedUser: LoggedUser | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountBySexeId(Number.parseInt(id)));
  };

  const findAllSexes = async (): Promise<Sex[]> => {
    const sexes = await sexRepository.findSexes({
      orderBy: "libelle",
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

    const createdSexResult = await sexRepository.createSex({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdSexResult.map((createdSex) => {
      return enrichEntityWithEditableStatus(createdSex, loggedUser);
    });
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
      const existingData = await sexRepository.findSexById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedSexResult = await sexRepository.updateSex(id, input);

    return updatedSexResult.map((updatedSex) => {
      return enrichEntityWithEditableStatus(updatedSex, loggedUser);
    });
  };

  const deleteSex = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<Sex | null, SexFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await sexRepository.findSexById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedSex = await sexRepository.deleteSexById(id);
    return ok(deletedSex ? enrichEntityWithEditableStatus(deletedSex, loggedUser) : null);
  };

  const createSexes = async (
    sexes: Omit<SexCreateInput, "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly Sex[]> => {
    const createdSexes = await sexRepository.createSexes(
      sexes.map((sexe) => {
        return { ...sexe, ownerId: loggedUser.id };
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
