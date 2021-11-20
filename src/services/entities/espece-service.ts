import { Classe, Espece as EspeceEntity, Prisma } from "@prisma/client";
import { EspecesPaginatedResult, EspeceWithCounts, FindParams, MutationUpsertEspeceArgs, QueryPaginatedEspecesArgs, SearchDonneeCriteria } from "../../model/graphql";
import { Espece as EspeceObj } from "../../model/types/espece.model";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_CODE, TABLE_ESPECE } from "../../utils/constants";
import { buildSearchDonneeCriteria } from "./donnee-service";
import { getPrismaPagination } from "./entities-utils";
import { insertMultipleEntities } from "./entity-service";

const DB_SAVE_MAPPING_ESPECE = {
  ...createKeyValueMapWithSameName("code"),
  classe_id: "classeId",
  nom_francais: "nomFrancais",
  nom_latin: "nomLatin"
}

export const findEspece = async (id: number): Promise<EspeceEntity | null> => {
  return prisma.espece.findUnique({
    where: {
      id
    },
  });
};

export const findEspeceOfDonneeId = async (donneeId: number): Promise<EspeceEntity | null> => {
  return prisma.donnee.findUnique({
    where: {
      id: donneeId
    },
  }).espece();
};

export const findEspeces = async (options: {
  params?: FindParams,
  classeId?: number
}): Promise<EspeceEntity[]> => {

  const { params, classeId } = options ?? {};
  const { q, max } = params ?? {};

  const classeIdClause = classeId ? {
    classeId: {
      equals: classeId
    }
  } : {};

  const matchingWithCode = await prisma.espece.findMany({
    orderBy: {
      code: "asc"
    },
    where: {
      AND: [{
        code: {
          startsWith: q || undefined
        }
      },
        classeIdClause
      ]
    },
    take: max || undefined
  });

  const libelleClause = q ? {
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
  } : {}

  const matchingWithLibelle = await prisma.espece.findMany({
    orderBy: {
      code: "asc"
    },
    where: {
      AND: [
        libelleClause,
        classeIdClause
      ]
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
  const matchingEntries = [...matchingWithCode, ...matchingWithLibelle]
    .filter((element, index, self) =>
      index === self.findIndex((eltArray) => (
        eltArray.id === element.id
      ))
    );

  return max ? matchingEntries.slice(0, max) : matchingEntries;
};

const getFilterClause = (q: string | null | undefined): Prisma.EspeceWhereInput => {
  return (q != null && q.length) ? {
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
  } : {};
}

export const findAllEspecesWithClasses = async (): Promise<(EspeceEntity & { classe: Classe })[]> => {
  return prisma.espece.findMany({
    ...queryParametersToFindAllEntities(COLUMN_CODE),
    include: {
      classe: true
    }
  });
};

export const findAllEspeces = async (options?: Prisma.EspeceFindManyArgs): Promise<(EspeceEntity & { nbDonnees: number })[]> => {
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
    }
  });
};

export const findPaginatedEspeces = async (
  options: QueryPaginatedEspecesArgs = {},
  includeCounts = true,
  searchCriteria: SearchDonneeCriteria = undefined
): Promise<EspecesPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.EspeceOrderByWithRelationInput>;
  switch (orderByField) {
    case "id":
    case "code":
    case "nomFrancais":
    case "nomLatin":
      orderBy = {
        [orderByField]: sortOrder
      }
      break;
    case "nomClasse":
      orderBy = {
        classe: {
          libelle: sortOrder
        }
      }
      break;
    case "nbDonnees": {
      orderBy = sortOrder && {
        donnee: {
          _count: sortOrder // Note: this may not be working perfectly with donnee search criteria: _count will return the full number of donnees, let's consider this as acceptable for now
        }
      }
    }
      break;
    default:
      orderBy = {}
  }

  const builtSearchCriteria = buildSearchDonneeCriteria(searchCriteria);
  const { especeId, espece, ...restSearchDonneeCriteria } = builtSearchCriteria ?? {};

  let especesResult: EspeceWithCounts[];

  const especeFilterClause: Prisma.EspeceWhereInput = {
    AND: [
      getFilterClause(searchParams?.q),
      builtSearchCriteria ? {
        id: especeId,
        ...espece,
        donnee: {
          some: {
            ...restSearchDonneeCriteria
          }
        }
      } : undefined
    ]
  };

  if (orderByField === "nbDonnees" && builtSearchCriteria) {
    // As the orderBy donnee _count will not work properly because it will compare with ALL donnees and not only the matching one, we need to do differently

    // Mapping between especes_id and their count sorted by their own number of donnees
    const donneesByMatchingEspece = await prisma.donnee.groupBy({
      by: ['especeId'],
      where: {
        especeId,
        espece: {
          AND: [
            espece,
            getFilterClause(searchParams?.q)
          ]
        },
        ...restSearchDonneeCriteria
      },
      orderBy: {
        _count: {
          especeId: sortOrder
        }
      },
      _count: true,
      ...getPrismaPagination(searchParams)
    })

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
        ...espece,
        nbDonnees: _count
      };
    })

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
    })

    // As we can also filter by donnees but want the filtered count, the _count cannot be calculated properly from the previous findMany => it would return the full count
    if (includeCounts) {
      const donneesByMatchingEspece = await prisma.donnee.groupBy({
        by: ['especeId'],
        where: {
          AND: [
            {
              especeId: {
                in: especesDb.map(espece => espece?.id) // /!\ The IN clause could break if not paginated enough
              }
            },
            builtSearchCriteria ? {
              espece,
              ...restSearchDonneeCriteria
            } : undefined
          ]
        },
        _count: true
      })

      especesResult = especesDb.map((espece) => {
        return {
          ...espece,
          ...(includeCounts ? { nbDonnees: donneesByMatchingEspece.find(({ especeId }) => especeId === espece.id)?._count } : {})
        }
      })

    } else {
      especesResult = especesDb;
    }

  }

  const count = await prisma.espece.count({
    where: especeFilterClause
  })

  return {
    result: especesResult,
    count
  }
};

export const upsertEspece = async (
  args: MutationUpsertEspeceArgs
): Promise<EspeceEntity> => {
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

export const deleteEspece = async (id: number): Promise<EspeceEntity> => {
  return prisma.espece.delete({
    where: {
      id
    }
  });
}

export const insertEspeces = (
  especes: EspeceObj[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_ESPECE, especes, DB_SAVE_MAPPING_ESPECE);
};