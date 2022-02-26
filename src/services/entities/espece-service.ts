import { Classe, Espece, Prisma } from "@prisma/client";
import {
  EspecesPaginatedResult,
  EspeceWithCounts,
  FindParams,
  MutationUpsertEspeceArgs,
  QueryPaginatedEspecesArgs,
  SearchDonneeCriteria
} from "../../model/graphql";
import prisma from "../../sql/prisma";
import { COLUMN_CODE } from "../../utils/constants";
import { buildSearchDonneeCriteria } from "./donnee-service";
import { getPrismaPagination, queryParametersToFindAllEntities } from "./entities-utils";

export const findEspece = async (id: number | undefined): Promise<Espece | null> => {
  return prisma.espece.findUnique({
    where: {
      id
    }
  });
};

export const findEspeceOfDonneeId = async (donneeId: number | undefined): Promise<Espece | null> => {
  return prisma.donnee
    .findUnique({
      where: {
        id: donneeId
      }
    })
    .espece();
};

export const findEspeces = async (options: {
  params?: FindParams | null;
  classeId?: number | null;
}): Promise<Espece[]> => {
  const { params, classeId } = options ?? {};
  const { q, max } = params ?? {};

  const classeIdClause = classeId
    ? {
        classeId: {
          equals: classeId
        }
      }
    : {};

  const matchingWithCode = await prisma.espece.findMany({
    orderBy: {
      code: "asc"
    },
    where: {
      AND: [
        {
          code: {
            startsWith: q || undefined
          }
        },
        classeIdClause
      ]
    },
    take: max || undefined
  });

  const libelleClause = q
    ? {
        OR: [
          {
            nomFrancais: {
              contains: q
            }
          },
          {
            nomLatin: {
              contains: q
            }
          }
        ]
      }
    : {};

  const matchingWithLibelle = await prisma.espece.findMany({
    orderBy: {
      code: "asc"
    },
    where: {
      AND: [libelleClause, classeIdClause]
    },
    take: max || undefined
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
              contains: q
            }
          },
          {
            nomFrancais: {
              contains: q
            }
          },
          {
            nomLatin: {
              contains: q
            }
          }
        ]
      }
    : {};
};

export const findAllEspecesWithClasses = async (): Promise<(Espece & { classe: Classe | null })[]> => {
  return prisma.espece.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    include: {
      classe: true
    }
  });
};

export const findAllEspeces = async (
  options?: Omit<Prisma.EspeceFindManyArgs, "include">
): Promise<(Espece & { nbDonnees: number })[]> => {
  const especesDb = await prisma.espece.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    include: {
      _count: {
        select: {
          donnee: true
        }
      }
    },
    ...options
  });

  return especesDb.map((espece) => {
    return {
      ...espece,
      nbDonnees: espece._count.donnee
    };
  });
};

export const findPaginatedEspeces = async (
  options: Partial<QueryPaginatedEspecesArgs> = {},
  searchCriteria: SearchDonneeCriteria | null | undefined = undefined
): Promise<EspecesPaginatedResult> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  let orderBy: Prisma.Enumerable<Prisma.EspeceOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "code":
      case "nomFrancais":
      case "nomLatin":
        orderBy = {
          [orderByField]: sortOrder
        };
        break;
      case "nomClasse":
        orderBy = {
          classe: {
            libelle: sortOrder
          }
        };
        break;
      case "nbDonnees":
        {
          orderBy = {
            donnee: {
              _count: sortOrder // Note: this may not be working perfectly with donnee search criteria: _count will return the full number of donnees, let's consider this as acceptable for now
            }
          };
        }
        break;
      default:
        orderBy = {};
    }
  }

  const builtSearchCriteria = buildSearchDonneeCriteria(searchCriteria);
  const { especeId, espece, ...restSearchDonneeCriteria } = builtSearchCriteria ?? {};

  let especesResult: EspeceWithCounts[];

  const especeFilterClause: Prisma.EspeceWhereInput = {
    AND: [
      getFilterClause(searchParams?.q),
      builtSearchCriteria
        ? {
            id: especeId,
            ...espece,
            donnee: {
              some: {
                ...restSearchDonneeCriteria
              }
            }
          }
        : {}
    ]
  };

  if (orderByField === "nbDonnees" && builtSearchCriteria) {
    // As the orderBy donnee _count will not work properly because it will compare with ALL donnees and not only the matching one, we need to do differently

    // Mapping between especes_id and their count sorted by their own number of donnees
    const donneesByMatchingEspece = await prisma.donnee.groupBy({
      by: ["especeId"],
      where: {
        especeId,
        espece: {
          AND: [espece ?? {}, getFilterClause(searchParams?.q)]
        },
        ...restSearchDonneeCriteria
      },
      ...(sortOrder
        ? {
            orderBy: {
              _count: {
                especeId: sortOrder
              }
            }
          }
        : {}),
      _count: true,
      ...getPrismaPagination(searchParams)
    });

    // Once we have the proper especes_is, we can retrieve their corresponding data
    const especesRq = await prisma.espece.findMany({
      include: {
        classe: {
          select: {
            id: true,
            libelle: true
          }
        }
      },
      where: {
        id: {
          in: donneesByMatchingEspece.map(({ especeId }) => especeId) // /!\ The IN clause could break if not paginated enough
        }
      }
    });

    especesResult = donneesByMatchingEspece.map(({ especeId, _count }) => {
      const espece = especesRq?.find(({ id }) => id === especeId);
      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...espece!,
        nbDonnees: _count
      };
    });
  } else {
    const especesDb = await prisma.espece.findMany({
      ...getPrismaPagination(searchParams),
      include: {
        classe: {
          select: {
            id: true,
            libelle: true
          }
        }
      },
      orderBy,
      where: especeFilterClause
    });

    // As we can also filter by donnees but want the filtered count, the _count cannot be calculated properly from the previous findMany => it would return the full count
    if (includeCounts) {
      const donneesByMatchingEspece = await prisma.donnee.groupBy({
        by: ["especeId"],
        where: {
          AND: [
            {
              especeId: {
                in: especesDb.map((espece) => espece?.id) // /!\ The IN clause could break if not paginated enough
              }
            },
            builtSearchCriteria
              ? {
                  espece,
                  ...restSearchDonneeCriteria
                }
              : {}
          ]
        },
        _count: true
      });

      especesResult = especesDb.map((espece) => {
        return {
          ...espece,
          ...(includeCounts
            ? { nbDonnees: donneesByMatchingEspece.find(({ especeId }) => especeId === espece.id)?._count }
            : {})
        };
      });
    } else {
      especesResult = especesDb;
    }
  }

  const count = await prisma.espece.count({
    where: especeFilterClause
  });

  return {
    result: especesResult,
    count
  };
};

export const upsertEspece = async (args: MutationUpsertEspeceArgs): Promise<Espece> => {
  const { id, data } = args;
  if (id) {
    return prisma.espece.update({
      where: { id },
      data
    });
  } else {
    return prisma.espece.create({ data });
  }
};

export const deleteEspece = async (id: number): Promise<Espece> => {
  return prisma.espece.delete({
    where: {
      id
    }
  });
};

export const createEspeces = async (especes: Omit<Espece, "id">[]): Promise<Prisma.BatchPayload> => {
  return prisma.espece.createMany({
    data: especes
  });
};
