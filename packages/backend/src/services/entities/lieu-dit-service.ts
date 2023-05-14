import { type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type QueryLieuxDitsArgs } from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import {
  type Lieudit,
  type LieuditCreateInput,
  type LieuditWithCommuneAndDepartementCode,
} from "../../repositories/lieudit/lieudit-repository-types.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_NOM } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { getSqlPagination } from "./entities-utils.js";
import { reshapeInputLieuditUpsertData } from "./lieu-dit-service-reshape.js";

type LieuditServiceDependencies = {
  logger: Logger;
  lieuditRepository: LieuditRepository;
  donneeRepository: DonneeRepository;
};

type LieuxDitsSearchParams = {
  q?: string | null;
  townId?: number | null;
};

export const buildLieuditService = ({ lieuditRepository, donneeRepository }: LieuditServiceDependencies) => {
  const findLieuDit = async (id: number, loggedUser: LoggedUser | null): Promise<Lieudit | null> => {
    validateAuthorization(loggedUser);

    return lieuditRepository.findLieuditById(id);
  };

  const getDonneesCountByLieuDit = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByLieuditId(id);
  };

  const findLieuDitOfInventaireId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Lieudit | null> => {
    validateAuthorization(loggedUser);

    return lieuditRepository.findLieuditByInventaireId(inventaireId);
  };

  const findAllLieuxDits = async (): Promise<Lieudit[]> => {
    const lieuxDits = await lieuditRepository.findLieuxdits({
      orderBy: COLUMN_NOM,
    });

    return [...lieuxDits];
  };

  const findPaginatedLieuxDits = async (
    loggedUser: LoggedUser | null,
    options: QueryLieuxDitsArgs = {}
  ): Promise<Lieudit[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, townId, orderBy: orderByField, sortOrder } = options;

    const lieuxDits = await lieuditRepository.findLieuxdits({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      townId,
      orderBy: orderByField,
      sortOrder,
    });

    return [...lieuxDits];
  };

  const findAllLieuxDitsWithCommuneAndDepartement = async (): Promise<LieuditWithCommuneAndDepartementCode[]> => {
    const lieuxditsWithCommuneAndDepartementCode =
      await lieuditRepository.findAllLieuxDitsWithCommuneAndDepartementCode();
    return [...lieuxditsWithCommuneAndDepartementCode];
  };

  const getLieuxDitsCount = async (
    loggedUser: LoggedUser | null,
    { q, townId }: LieuxDitsSearchParams
  ): Promise<number> => {
    validateAuthorization(loggedUser);

    return lieuditRepository.getCount(q, townId);
  };

  const createLieuDit = async (input: UpsertLocalityInput, loggedUser: LoggedUser | null): Promise<Lieudit> => {
    validateAuthorization(loggedUser);

    try {
      const upsertedLieudit = await lieuditRepository.createLieudit({
        ...reshapeInputLieuditUpsertData(input),
        owner_id: loggedUser.id,
      });

      return upsertedLieudit;
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
  ): Promise<Lieudit> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await lieuditRepository.findLieuditById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const upsertedLieudit = await lieuditRepository.updateLieudit(id, reshapeInputLieuditUpsertData(input));

      return upsertedLieudit;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteLieuDit = async (id: number, loggedUser: LoggedUser | null): Promise<Lieudit> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await lieuditRepository.findLieuditById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return lieuditRepository.deleteLieuditById(id);
  };

  const createLieuxDits = async (
    lieuxdits: Omit<LieuditCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Lieudit[]> => {
    return lieuditRepository.createLieuxdits(
      lieuxdits.map((lieudit) => {
        return { ...lieudit, owner_id: loggedUser.id };
      })
    );
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
