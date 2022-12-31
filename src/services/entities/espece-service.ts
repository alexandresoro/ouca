import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  type FindParams,
  type MutationUpsertEspeceArgs,
  type QueryEspecesArgs,
  type SearchDonneeCriteria,
} from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type EspeceRepository } from "../../repositories/espece/espece-repository";
import {
  type Espece,
  type EspeceCreateInput,
  type EspeceWithClasseLibelle,
} from "../../repositories/espece/espece-repository-types";
import prisma from "../../sql/prisma";
import { type LoggedUser } from "../../types/User";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination, queryParametersToFindAllEntities } from "./entities-utils";
import { reshapeInputEspeceUpsertData } from "./espece-service-reshape";

type EspeceServiceDependencies = {
  logger: Logger;
  especeRepository: EspeceRepository;
  donneeRepository: DonneeRepository;
};

export const buildEspeceService = ({ especeRepository, donneeRepository }: EspeceServiceDependencies) => {
  const findEspece = async (id: number, loggedUser: LoggedUser | null): Promise<Espece | null> => {
    validateAuthorization(loggedUser);

    return especeRepository.findEspeceById(id);
  };

  const getDonneesCountByEspece = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByEspeceId(id);
  };

  const findEspeceOfDonneeId = async (
    donneeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Espece | null> => {
    validateAuthorization(loggedUser);

    return especeRepository.findEspeceByDonneeId(donneeId);
  };

  const findAllEspeces = async (): Promise<Espece[]> => {
    const especes = await especeRepository.findEspeces({
      orderBy: COLUMN_CODE,
    });

    return [...especes];
  };

  const findAllEspecesWithClasses = async (): Promise<EspeceWithClasseLibelle[]> => {
    const especesWithClasses = await especeRepository.findAllEspecesWithClasseLibelle();
    return [...especesWithClasses];
  };

  const findPaginatedEspeces = async (
    loggedUser: LoggedUser | null,
    options: QueryEspecesArgs = {}
  ): Promise<Espece[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, searchCriteria, orderBy: orderByField, sortOrder } = options;

    const especes = await especeRepository.findEspeces({
      q: searchParams?.q,
      searchCriteria: searchCriteria && Object.keys(searchCriteria).length ? searchCriteria : undefined,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...especes];
  };

  const getEspecesCount = async (
    loggedUser: LoggedUser | null,
    {
      q,
      searchCriteria,
    }: {
      q?: string | null;
      searchCriteria?: SearchDonneeCriteria | null;
    } = {}
  ): Promise<number> => {
    validateAuthorization(loggedUser);

    return especeRepository.getCount({
      q,
      searchCriteria: searchCriteria && Object.keys(searchCriteria).length ? searchCriteria : undefined,
    });
  };

  const upsertEspece = async (args: MutationUpsertEspeceArgs, loggedUser: LoggedUser | null): Promise<Espece> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedEspece: Espece;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser?.role !== "admin") {
        const existingData = await especeRepository.findEspeceById(id);

        if (existingData?.ownerId !== loggedUser?.id) {
          throw new OucaError("OUCA0001");
        }
      }

      try {
        upsertedEspece = await especeRepository.updateEspece(id, reshapeInputEspeceUpsertData(data));
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      try {
        upsertedEspece = await especeRepository.createEspece({
          ...reshapeInputEspeceUpsertData(data),
          owner_id: loggedUser?.id,
        });
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    }

    return upsertedEspece;
  };

  const deleteEspece = async (id: number, loggedUser: LoggedUser | null): Promise<Espece> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await especeRepository.findEspeceById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return especeRepository.deleteEspeceById(id);
  };

  const createEspeces = async (
    especes: Omit<EspeceCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Espece[]> => {
    return especeRepository.createEspeces(
      especes.map((espece) => {
        return { ...espece, owner_id: loggedUser.id };
      })
    );
  };

  return {
    findEspece,
    getDonneesCountByEspece,
    findEspeceOfDonneeId,
    findAllEspeces,
    findAllEspecesWithClasses,
    findPaginatedEspeces,
    getEspecesCount,
    upsertEspece,
    deleteEspece,
    createEspeces,
  };
};

export type EspeceService = ReturnType<typeof buildEspeceService>;

const findEspeces = async (
  loggedUser: LoggedUser | null,
  options: {
    params?: FindParams | null;
    classeId?: number | null;
  } = {}
): Promise<Espece[]> => {
  validateAuthorization(loggedUser);

  const { params, classeId } = options;
  const { q, max } = params ?? {};

  const classeIdClause = classeId
    ? {
        classeId: {
          equals: classeId,
        },
      }
    : {};

  const matchingWithCode = await prisma.espece.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      AND: [
        {
          code: {
            startsWith: q || undefined,
          },
        },
        classeIdClause,
      ],
    },
    take: max || undefined,
  });

  const libelleClause = q
    ? {
        OR: [
          {
            nomFrancais: {
              contains: q,
            },
          },
          {
            nomLatin: {
              contains: q,
            },
          },
        ],
      }
    : {};

  const matchingWithLibelle = await prisma.espece.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      AND: [libelleClause, classeIdClause],
    },
    take: max || undefined,
  });

  // Concatenate arrays and remove elements that could be present in several indexes, to keep a unique reference
  // This is done like this to be consistent with what was done previously on UI side:
  // code had a weight of 10, nom_francais and nom_latin had a weight of 1, so we don't "return first" the elements that appear multiple time
  // The only difference with what was done before is that we used to sort them by adding up their priority:
  // e.g. if the code and nom francais was matching, it was 11, then it was sorted before one for which only the code was matching for instance
  // we could do the same here, but it's mostly pointless as the ones that are matching by code will be before, which was the main purpose of this thing initially
  // And even so, it would never match 100%, as we could limit the matches per code/libelle, meaning that one entry may not be returned even though it would match because of this LIMIT
  // We could be smarter, but I believe that this is enough for now
  const matchingEntries = [...matchingWithCode, ...matchingWithLibelle].filter(
    (element, index, self) => index === self.findIndex((eltArray) => eltArray.id === element.id)
  );

  return max ? matchingEntries.slice(0, max) : matchingEntries;
};
