import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type MutationUpsertLieuDitArgs, type QueryLieuxDitsArgs } from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository";
import {
  type Lieudit,
  type LieuditCreateInput,
  type LieuditWithCommuneAndDepartementCode,
} from "../../repositories/lieudit/lieudit-repository-types";
import { type LoggedUser } from "../../types/User";
import { COLUMN_NOM } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination } from "./entities-utils";
import { reshapeInputLieuditUpsertData } from "./lieu-dit-service-reshape";

type LieuditServiceDependencies = {
  logger: Logger;
  lieuditRepository: LieuditRepository;
  donneeRepository: DonneeRepository;
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

    const { searchParams, orderBy: orderByField, sortOrder } = options;

    const lieuxDits = await lieuditRepository.findLieuxdits({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
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

  const getLieuxDitsCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return lieuditRepository.getCount(q);
  };

  const upsertLieuDit = async (args: MutationUpsertLieuDitArgs, loggedUser: LoggedUser | null): Promise<Lieudit> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedLieudit: Lieudit;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser?.role !== "admin") {
        const existingData = await lieuditRepository.findLieuditById(id);

        if (existingData?.ownerId !== loggedUser?.id) {
          throw new OucaError("OUCA0001");
        }
      }

      try {
        upsertedLieudit = await lieuditRepository.updateLieudit(id, reshapeInputLieuditUpsertData(data));
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      try {
        upsertedLieudit = await lieuditRepository.createLieudit({
          ...reshapeInputLieuditUpsertData(data),
          owner_id: loggedUser.id,
        });
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    }

    return upsertedLieudit;
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
    upsertLieuDit,
    deleteLieuDit,
    createLieuxDits,
  };
};

export type LieuditService = ReturnType<typeof buildLieuditService>;
