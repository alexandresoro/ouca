import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type Town } from "@ou-ca/common/api/entities/town";
import { type TownsSearchParams, type UpsertTownInput } from "@ou-ca/common/api/town";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { validateAuthorization } from "../../../application/services/authorization/authorization-utils.js";
import {
  type CommuneCreateInput,
  type CommuneWithDepartementCode,
} from "../../../repositories/commune/commune-repository-types.js";
import { type CommuneRepository } from "../../../repositories/commune/commune-repository.js";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type LieuditRepository } from "../../../repositories/lieudit/lieudit-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../entities-utils.js";
import { reshapeInputTownUpsertData } from "./town-service-reshape.js";

type TownServiceDependencies = {
  townRepository: CommuneRepository;
  localityRepository: LieuditRepository;
  entryRepository: DonneeRepository;
};

export const buildTownService = ({ townRepository, localityRepository, entryRepository }: TownServiceDependencies) => {
  const findCommune = async (id: number, loggedUser: LoggedUser | null): Promise<Town | null> => {
    validateAuthorization(loggedUser);

    const town = await townRepository.findCommuneById(id);
    return enrichEntityWithEditableStatus(town, loggedUser);
  };

  const getDonneesCountByCommune = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return entryRepository.getCountByCommuneId(parseInt(id));
  };

  const getLieuxDitsCountByCommune = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return localityRepository.getCountByCommuneId(parseInt(id));
  };

  const findCommuneOfLieuDitId = async (
    lieuditId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Town | null> => {
    validateAuthorization(loggedUser);

    const town = await townRepository.findCommuneByLieuDitId(lieuditId ? parseInt(lieuditId) : undefined);
    return enrichEntityWithEditableStatus(town, loggedUser);
  };

  const findAllCommunes = async (): Promise<Town[]> => {
    const communes = await townRepository.findCommunes({
      orderBy: "nom",
    });

    const enrichedTowns = communes.map((town) => {
      return enrichEntityWithEditableStatus(town, null);
    });

    return [...enrichedTowns];
  };

  const findPaginatedCommunes = async (loggedUser: LoggedUser | null, options: TownsSearchParams): Promise<Town[]> => {
    validateAuthorization(loggedUser);

    const { q, departmentId, orderBy: orderByField, sortOrder, ...pagination } = options;

    const communes = await townRepository.findCommunes({
      q,
      ...getSqlPagination(pagination),
      departmentId: departmentId ? parseInt(departmentId) : undefined,
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedTowns = communes.map((town) => {
      return enrichEntityWithEditableStatus(town, loggedUser);
    });

    return [...enrichedTowns];
  };

  const findAllCommunesWithDepartements = async (): Promise<CommuneWithDepartementCode[]> => {
    const communesWithDepartements = await townRepository.findAllCommunesWithDepartementCode();
    return [...communesWithDepartements];
  };

  const getCommunesCount = async (
    loggedUser: LoggedUser | null,
    { q, departmentId }: Pick<TownsSearchParams, "q" | "departmentId">
  ): Promise<number> => {
    validateAuthorization(loggedUser);

    return townRepository.getCount(q, departmentId ? parseInt(departmentId) : undefined);
  };

  const createCommune = async (input: UpsertTownInput, loggedUser: LoggedUser | null): Promise<Town> => {
    validateAuthorization(loggedUser);

    try {
      const createdCommune = await townRepository.createCommune({
        ...reshapeInputTownUpsertData(input),
        owner_id: loggedUser.id,
      });

      return enrichEntityWithEditableStatus(createdCommune, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateCommune = async (id: number, input: UpsertTownInput, loggedUser: LoggedUser | null): Promise<Town> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await townRepository.findCommuneById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedCommune = await townRepository.updateCommune(id, reshapeInputTownUpsertData(input));

      return enrichEntityWithEditableStatus(updatedCommune, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteCommune = async (id: number, loggedUser: LoggedUser | null): Promise<Town> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await townRepository.findCommuneById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedCommune = await townRepository.deleteCommuneById(id);
    return enrichEntityWithEditableStatus(deletedCommune, loggedUser);
  };

  const createCommunes = async (
    communes: Omit<CommuneCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Town[]> => {
    const createdTowns = await townRepository.createCommunes(
      communes.map((commune) => {
        return { ...commune, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedTowns = createdTowns.map((town) => {
      return enrichEntityWithEditableStatus(town, loggedUser);
    });

    return enrichedCreatedTowns;
  };

  return {
    findCommune,
    getDonneesCountByCommune,
    getLieuxDitsCountByCommune,
    findCommuneOfLieuDitId,
    findAllCommunes,
    findAllCommunesWithDepartements,
    findPaginatedCommunes,
    getCommunesCount,
    createCommune,
    updateCommune,
    deleteCommune,
    createCommunes,
  };
};

export type TownService = ReturnType<typeof buildTownService>;
