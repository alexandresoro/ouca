import { type Prisma } from "@prisma/client";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  type FindParams,
  type MutationUpsertEspeceArgs,
  type QueryEspecesArgs,
  type SearchDonneeCriteria,
} from "../../graphql/generated/graphql-types";
import { type ClasseRepository } from "../../repositories/classe/classe-repository";
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
import { buildSearchDonneeCriteria } from "./donnee-utils";
import { getPrismaPagination, getSqlPagination, queryParametersToFindAllEntities } from "./entities-utils";
import { reshapeInputEspeceUpsertData } from "./espece-service-reshape";

type EspeceServiceDependencies = {
  logger: Logger;
  classeRepository: ClasseRepository;
  especeRepository: EspeceRepository;
  donneeRepository: DonneeRepository;
};

export const buildEspeceService = ({
  classeRepository,
  especeRepository,
  donneeRepository,
}: EspeceServiceDependencies) => {
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
    findAllEspeces: findEspeces,
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

const getFilterClause = (q: string | null | undefined): Prisma.EspeceWhereInput => {
  return q != null && q.length
    ? {
        OR: [
          {
            code: {
              contains: q,
            },
          },
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
};

const getFilterClauseSearchDonnee = (
  searchCriteria: SearchDonneeCriteria | null | undefined = undefined
): Prisma.EspeceWhereInput => {
  if (!searchCriteria || !Object.entries(searchCriteria).length) {
    return {};
  }
  const { especeId, espece, ...restSearchDonneeCriteria } = buildSearchDonneeCriteria(searchCriteria) ?? {};

  return Object.entries(restSearchDonneeCriteria).length
    ? {
        id: especeId,
        ...espece,
        donnee: {
          some: {
            ...restSearchDonneeCriteria,
          },
        },
      }
    : {};
};

const findPaginatedEspeces = async (
  loggedUser: LoggedUser | null,
  options: Partial<QueryEspecesArgs> = {},
  searchCriteria: SearchDonneeCriteria | null | undefined = undefined
): Promise<Espece[]> => {
  validateAuthorization(loggedUser);

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.EspeceOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "code":
      case "nomFrancais":
      case "nomLatin":
        orderBy = {
          [orderByField]: sortOrder,
        };
        break;
      case "nomClasse":
        orderBy = {
          classe: {
            libelle: sortOrder,
          },
        };
        break;
      case "nbDonnees":
        {
          orderBy = {
            donnee: {
              _count: sortOrder, // Note: this may not be working perfectly with donnee search criteria: _count will return the full number of donnees, let's consider this as acceptable for now
            },
          };
        }
        break;
      default:
        orderBy = {};
    }
  }

  const builtSearchCriteria = buildSearchDonneeCriteria(searchCriteria);
  const { especeId, espece, ...restSearchDonneeCriteria } = builtSearchCriteria ?? {};

  const especeFilterClause: Prisma.EspeceWhereInput = {
    AND: [getFilterClause(searchParams?.q), getFilterClauseSearchDonnee(searchCriteria)],
  };

  let especesEntities: Espece[];

  if (orderByField === "nbDonnees" && builtSearchCriteria) {
    // As the orderBy donnee _count will not work properly because it will compare with ALL donnees and not only the matching one, we need to do differently

    // Mapping between especes_id and their count sorted by their own number of donnees
    const donneesByMatchingEspece = await prisma.donnee.groupBy({
      by: ["especeId"],
      where: {
        especeId,
        espece: {
          AND: [espece ?? {}, getFilterClause(searchParams?.q)],
        },
        ...restSearchDonneeCriteria,
      },
      ...(sortOrder
        ? {
            orderBy: {
              _count: {
                especeId: sortOrder,
              },
            },
          }
        : {}),
      _count: true,
      ...getPrismaPagination(searchParams),
    });

    // Once we have the proper especes_is, we can retrieve their corresponding data
    const especesRq = await prisma.espece.findMany({
      include: {
        classe: {
          select: {
            id: true,
            libelle: true,
          },
        },
      },
      where: {
        id: {
          in: donneesByMatchingEspece.map(({ especeId }) => especeId), // /!\ The IN clause could break if not paginated enough
        },
      },
    });

    especesEntities = donneesByMatchingEspece.map(({ especeId }) => {
      const espece = especesRq?.find(({ id }) => id === especeId);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return espece!;
    });
  } else {
    especesEntities = await prisma.espece.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: especeFilterClause,
    });
  }

  return especesEntities;
};
