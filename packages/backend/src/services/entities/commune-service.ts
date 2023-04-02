import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type MutationUpsertCommuneArgs, type QueryCommunesArgs } from "../../graphql/generated/graphql-types.js";
import {
  type Commune,
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
import { getSqlPagination } from "./entities-utils.js";

type CommuneServiceDependencies = {
  logger: Logger;
  communeRepository: CommuneRepository;
  lieuditRepository: LieuditRepository;
  donneeRepository: DonneeRepository;
};

type CommunesSearchParams = {
  q?: string | null;
  departmentId?: number | null;
};

export const buildCommuneService = ({
  communeRepository,
  lieuditRepository,
  donneeRepository,
}: CommuneServiceDependencies) => {
  const findCommune = async (id: number, loggedUser: LoggedUser | null): Promise<Commune | null> => {
    validateAuthorization(loggedUser);

    return communeRepository.findCommuneById(id);
  };

  const getDonneesCountByCommune = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByCommuneId(id);
  };

  const getLieuxDitsCountByCommune = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return lieuditRepository.getCountByCommuneId(id);
  };

  const findCommuneOfLieuDitId = async (
    lieuditId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Commune | null> => {
    validateAuthorization(loggedUser);

    return communeRepository.findCommuneByLieuDitId(lieuditId);
  };

  const findAllCommunes = async (): Promise<Commune[]> => {
    const communes = await communeRepository.findCommunes({
      orderBy: COLUMN_NOM,
    });

    return [...communes];
  };

  const findPaginatedCommunes = async (
    loggedUser: LoggedUser | null,
    options: QueryCommunesArgs = {}
  ): Promise<Commune[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, departmentId, orderBy: orderByField, sortOrder } = options;

    const communes = await communeRepository.findCommunes({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      departmentId,
      orderBy: orderByField,
      sortOrder,
    });

    return [...communes];
  };

  const findAllCommunesWithDepartements = async (): Promise<CommuneWithDepartementCode[]> => {
    const communesWithDepartements = await communeRepository.findAllCommunesWithDepartementCode();
    return [...communesWithDepartements];
  };

  const getCommunesCount = async (
    loggedUser: LoggedUser | null,
    { q, departmentId }: CommunesSearchParams
  ): Promise<number> => {
    validateAuthorization(loggedUser);

    return communeRepository.getCount(q, departmentId);
  };

  const upsertCommune = async (args: MutationUpsertCommuneArgs, loggedUser: LoggedUser | null): Promise<Commune> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedCommune: Commune;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser?.role !== "admin") {
        const existingData = await communeRepository.findCommuneById(id);

        if (existingData?.ownerId !== loggedUser?.id) {
          throw new OucaError("OUCA0001");
        }
      }

      try {
        upsertedCommune = await communeRepository.updateCommune(id, reshapeInputCommuneUpsertData(data));
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      try {
        upsertedCommune = await communeRepository.createCommune({
          ...reshapeInputCommuneUpsertData(data),
          owner_id: loggedUser.id,
        });
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    }

    return upsertedCommune;
  };

  const deleteCommune = async (id: number, loggedUser: LoggedUser | null): Promise<Commune> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await communeRepository.findCommuneById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return communeRepository.deleteCommuneById(id);
  };

  const createCommunes = async (
    communes: Omit<CommuneCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Commune[]> => {
    return communeRepository.createCommunes(
      communes.map((commune) => {
        return { ...commune, owner_id: loggedUser.id };
      })
    );
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
    upsertCommune,
    deleteCommune,
    createCommunes,
  };
};

export type CommuneService = ReturnType<typeof buildCommuneService>;
