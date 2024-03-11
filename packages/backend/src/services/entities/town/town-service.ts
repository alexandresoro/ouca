import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { TownFailureReason } from "@domain/town/town.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Town } from "@ou-ca/common/api/entities/town";
import type { TownsSearchParams, UpsertTownInput } from "@ou-ca/common/api/town";
import { type Result, err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import type {
  CommuneCreateInput,
  CommuneWithDepartementCode,
} from "../../../repositories/commune/commune-repository-types.js";
import type { CommuneRepository } from "../../../repositories/commune/commune-repository.js";
import type { DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import type { LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";
import { reshapeInputTownUpsertData } from "./town-service-reshape.js";

type TownServiceDependencies = {
  townRepository: CommuneRepository;
  localityRepository: LieuditRepository;
  entryRepository: DonneeRepository;
};

export const buildTownService = ({ townRepository, localityRepository, entryRepository }: TownServiceDependencies) => {
  const findTown = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Town | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }
    const town = await townRepository.findCommuneById(id);
    return ok(enrichEntityWithEditableStatus(town, loggedUser));
  };

  const getEntriesCountByTown = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByCommuneId(Number.parseInt(id)));
  };

  const getLocalitiesCountByTown = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await localityRepository.getCountByCommuneId(Number.parseInt(id)));
  };

  const findTownOfLocalityId = async (
    lieuditId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Town | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const town = await townRepository.findCommuneByLieuDitId(lieuditId ? Number.parseInt(lieuditId) : undefined);
    return ok(enrichEntityWithEditableStatus(town, loggedUser));
  };

  const findAllTowns = async (): Promise<Town[]> => {
    const towns = await townRepository.findCommunes({
      orderBy: "nom",
    });

    const enrichedTowns = towns.map((town) => {
      return enrichEntityWithEditableStatus(town, null);
    });

    return [...enrichedTowns];
  };

  const findPaginatedTowns = async (
    loggedUser: LoggedUser | null,
    options: TownsSearchParams,
  ): Promise<Result<Town[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, departmentId, orderBy: orderByField, sortOrder, ...pagination } = options;

    const towns = await townRepository.findCommunes({
      q,
      ...getSqlPagination(pagination),
      departmentId: departmentId ? Number.parseInt(departmentId) : undefined,
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedTowns = towns.map((town) => {
      return enrichEntityWithEditableStatus(town, loggedUser);
    });

    return ok([...enrichedTowns]);
  };

  const findAllTownsWithDepartments = async (): Promise<CommuneWithDepartementCode[]> => {
    const townsWithDepartments = await townRepository.findAllCommunesWithDepartementCode();
    return [...townsWithDepartments];
  };

  const getTownsCount = async (
    loggedUser: LoggedUser | null,
    { q, departmentId }: Pick<TownsSearchParams, "q" | "departmentId">,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await townRepository.getCount(q, departmentId ? Number.parseInt(departmentId) : undefined));
  };

  const createTown = async (
    input: UpsertTownInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Town, TownFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    try {
      const createdTown = await townRepository.createCommune({
        ...reshapeInputTownUpsertData(input),
        owner_id: loggedUser.id,
      });

      return ok(enrichEntityWithEditableStatus(createdTown, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const updateTown = async (
    id: number,
    input: UpsertTownInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Town, TownFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await townRepository.findCommuneById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    try {
      const updatedTown = await townRepository.updateCommune(id, reshapeInputTownUpsertData(input));

      return ok(enrichEntityWithEditableStatus(updatedTown, loggedUser));
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        return err("alreadyExists");
      }
      throw e;
    }
  };

  const deleteTown = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Town | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await townRepository.findCommuneById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedTown = await townRepository.deleteCommuneById(id);
    return ok(enrichEntityWithEditableStatus(deletedTown, loggedUser));
  };

  const createTowns = async (
    towns: Omit<CommuneCreateInput, "owner_id">[],
    loggedUser: LoggedUser,
  ): Promise<Town[]> => {
    const createdTowns = await townRepository.createCommunes(
      towns.map((town) => {
        return { ...town, owner_id: loggedUser.id };
      }),
    );

    const enrichedCreatedTowns = createdTowns.map((town) => {
      return enrichEntityWithEditableStatus(town, loggedUser);
    });

    return enrichedCreatedTowns;
  };

  return {
    findTown,
    getEntriesCountByTown,
    getLocalitiesCountByTown,
    findTownOfLocalityId,
    findAllTowns,
    findAllTownsWithDepartments,
    findPaginatedTowns,
    getTownsCount,
    createTown,
    updateTown,
    deleteTown,
    createTowns,
  };
};

export type TownService = ReturnType<typeof buildTownService>;
