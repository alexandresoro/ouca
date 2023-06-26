import { type LocalitiesSearchParams, type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type Locality } from "@ou-ca/common/entities/locality";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import {
  type LieuditCreateInput,
  type LieuditWithCommuneAndDepartementCode,
} from "../../repositories/lieudit/lieudit-repository-types.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_NOM } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { getSqlPagination } from "./entities-utils.js";
import { reshapeInputLieuditUpsertData, reshapeLocalityRepositoryToApi } from "./lieu-dit-service-reshape.js";

type LieuditServiceDependencies = {
  logger: Logger;
  lieuditRepository: LieuditRepository;
  donneeRepository: DonneeRepository;
};

export const buildLieuditService = ({ lieuditRepository, donneeRepository }: LieuditServiceDependencies) => {
  const findLieuDit = async (id: number, loggedUser: LoggedUser | null): Promise<Locality | null> => {
    validateAuthorization(loggedUser);

    const locality = await lieuditRepository.findLieuditById(id);
    return reshapeLocalityRepositoryToApi(locality, loggedUser);
  };

  const getDonneesCountByLieuDit = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByLieuditId(parseInt(id));
  };

  const findLieuDitOfInventaireId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Locality | null> => {
    validateAuthorization(loggedUser);

    const locality = await lieuditRepository.findLieuditByInventaireId(inventaireId);
    return reshapeLocalityRepositoryToApi(locality, loggedUser);
  };

  const findAllLieuxDits = async (): Promise<Locality[]> => {
    const lieuxDits = await lieuditRepository.findLieuxdits({
      orderBy: COLUMN_NOM,
    });

    const enrichedLocalities = lieuxDits.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality, null);
    });

    return [...enrichedLocalities];
  };

  const findPaginatedLieuxDits = async (
    loggedUser: LoggedUser | null,
    options: LocalitiesSearchParams
  ): Promise<Locality[]> => {
    validateAuthorization(loggedUser);

    const { q, townId, orderBy: orderByField, sortOrder, ...pagination } = options;

    const lieuxDits = await lieuditRepository.findLieuxdits({
      q,
      ...getSqlPagination(pagination),
      townId: townId ? parseInt(townId) : undefined,
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedLocalities = lieuxDits.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality, loggedUser);
    });

    return [...enrichedLocalities];
  };

  const findAllLieuxDitsWithCommuneAndDepartement = async (): Promise<LieuditWithCommuneAndDepartementCode[]> => {
    const lieuxditsWithCommuneAndDepartementCode =
      await lieuditRepository.findAllLieuxDitsWithCommuneAndDepartementCode();
    return [...lieuxditsWithCommuneAndDepartementCode];
  };

  const getLieuxDitsCount = async (
    loggedUser: LoggedUser | null,
    { q, townId }: Pick<LocalitiesSearchParams, "q" | "townId">
  ): Promise<number> => {
    validateAuthorization(loggedUser);

    return lieuditRepository.getCount(q, townId ? parseInt(townId) : undefined);
  };

  const createLieuDit = async (input: UpsertLocalityInput, loggedUser: LoggedUser | null): Promise<Locality> => {
    validateAuthorization(loggedUser);

    try {
      const createdLocality = await lieuditRepository.createLieudit({
        ...reshapeInputLieuditUpsertData(input),
        owner_id: loggedUser.id,
      });

      return reshapeLocalityRepositoryToApi(createdLocality, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateLieuDit = async (
    id: number,
    input: UpsertLocalityInput,
    loggedUser: LoggedUser | null
  ): Promise<Locality> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await lieuditRepository.findLieuditById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const updatedLocality = await lieuditRepository.updateLieudit(id, reshapeInputLieuditUpsertData(input));

      return reshapeLocalityRepositoryToApi(updatedLocality, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteLieuDit = async (id: number, loggedUser: LoggedUser | null): Promise<Locality> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await lieuditRepository.findLieuditById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedLocality = await lieuditRepository.deleteLieuditById(id);
    return reshapeLocalityRepositoryToApi(deletedLocality, loggedUser);
  };

  const createLieuxDits = async (
    lieuxdits: Omit<LieuditCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Locality[]> => {
    const createdLocalities = await lieuditRepository.createLieuxdits(
      lieuxdits.map((lieudit) => {
        return { ...lieudit, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedLocalities = createdLocalities.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality, loggedUser);
    });

    return enrichedCreatedLocalities;
  };

  return {
    findLieuDit,
    getDonneesCountByLieuDit,
    findLieuDitOfInventaireId,
    findAllLieuxDits,
    findAllLieuxDitsWithCommuneAndDepartement,
    findPaginatedLieuxDits,
    getLieuxDitsCount,
    createLieuDit,
    updateLieuDit,
    deleteLieuDit,
    createLieuxDits,
  };
};

export type LieuditService = ReturnType<typeof buildLieuditService>;
