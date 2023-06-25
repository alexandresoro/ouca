import { type TownsSearchParams, type UpsertTownInput } from "@ou-ca/common/api/town";
import { type Town } from "@ou-ca/common/entities/town";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  type CommuneCreateInput,
  type CommuneWithDepartementCode,
} from "../../repositories/commune/commune-repository-types.js";
import { type CommuneRepository } from "../../repositories/commune/commune-repository.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_NOM } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { reshapeInputCommuneUpsertData } from "./commune-service-reshape.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";

type CommuneServiceDependencies = {
  logger: Logger;
  communeRepository: CommuneRepository;
  lieuditRepository: LieuditRepository;
  donneeRepository: DonneeRepository;
};

export const buildCommuneService = ({
  communeRepository,
  lieuditRepository,
  donneeRepository,
}: CommuneServiceDependencies) => {
  const findCommune = async (id: number, loggedUser: LoggedUser | null): Promise<Town | null> => {
    validateAuthorization(loggedUser);

    const town = await communeRepository.findCommuneById(id);
    return enrichEntityWithEditableStatus(town, loggedUser);
  };

  const getDonneesCountByCommune = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByCommuneId(parseInt(id));
  };

  const getLieuxDitsCountByCommune = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return lieuditRepository.getCountByCommuneId(parseInt(id));
  };

  const findCommuneOfLieuDitId = async (
    lieuditId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Town | null> => {
    validateAuthorization(loggedUser);

    const town = await communeRepository.findCommuneByLieuDitId(lieuditId);
    return enrichEntityWithEditableStatus(town, loggedUser);
  };

  const findAllCommunes = async (): Promise<Town[]> => {
    const communes = await communeRepository.findCommunes({
      orderBy: COLUMN_NOM,
    });

    const enrichedTowns = communes.map((town) => {
      return enrichEntityWithEditableStatus(town, null);
    });

    return [...enrichedTowns];
  };

  const findPaginatedCommunes = async (loggedUser: LoggedUser | null, options: TownsSearchParams): Promise<Town[]> => {
    validateAuthorization(loggedUser);

    const { q, departmentId, orderBy: orderByField, sortOrder, ...pagination } = options;

    const communes = await communeRepository.findCommunes({
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
    const communesWithDepartements = await communeRepository.findAllCommunesWithDepartementCode();
    return [...communesWithDepartements];
  };

  const getCommunesCount = async (
    loggedUser: LoggedUser | null,
    { q, departmentId }: Pick<TownsSearchParams, "q" | "departmentId">
  ): Promise<number> => {
    validateAuthorization(loggedUser);

    return communeRepository.getCount(q, departmentId ? parseInt(departmentId) : undefined);
  };

  const createCommune = async (input: UpsertTownInput, loggedUser: LoggedUser | null): Promise<Town> => {
    validateAuthorization(loggedUser);

    try {
      const createdCommune = await communeRepository.createCommune({
        ...reshapeInputCommuneUpsertData(input),
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
      const existingData = await communeRepository.findCommuneById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedCommune = await communeRepository.updateCommune(id, reshapeInputCommuneUpsertData(input));

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
      const existingData = await communeRepository.findCommuneById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedCommune = await communeRepository.deleteCommuneById(id);
    return enrichEntityWithEditableStatus(deletedCommune, loggedUser);
  };

  const createCommunes = async (
    communes: Omit<CommuneCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Town[]> => {
    const createdTowns = await communeRepository.createCommunes(
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

export type CommuneService = ReturnType<typeof buildCommuneService>;
