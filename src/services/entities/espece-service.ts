import { Prisma } from "@prisma/client";
import { Espece, EspecesPaginatedResult, EspeceWithClasse, FindParams, QueryPaginatedEspecesArgs } from "../../model/graphql";
import { Espece as EspeceObj } from "../../model/types/espece.model";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { buildEspeceFromEspeceDb } from "../../sql/entities-mapping/espece-mapping";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_CODE, TABLE_ESPECE } from "../../utils/constants";
import { getPrismaPagination } from "./entities-utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";

const DB_SAVE_MAPPING_ESPECE = {
  ...createKeyValueMapWithSameName("code"),
  classe_id: "classeId",
  nom_francais: "nomFrancais",
  nom_latin: "nomLatin"
}

export const findEspece = async (id: number): Promise<EspeceWithClasse | null> => {
  return prisma.espece.findUnique({
    include: {
      classe: true
    },
    where: {
      id
    },
  }).then(espece => {
    const { nom_francais, nom_latin, classe_id, ...others } = espece;
    return {
      ...others,
      classeId: classe_id,
      nomFrancais: nom_francais,
      nomLatin: nom_latin
    }
  });
};

export const findEspeces = async (params?: FindParams): Promise<Espece[]> => {

  const { q, max } = params ?? {};

  const matchingWithCode = await prisma.espece.findMany({
    orderBy: {
      code: "asc"
    },
    where: q ? {
      OR: [
        {
          code: {
            startsWith: q
          }
        }
      ]
    } : undefined,
    take: max || undefined
  });

  const matchingWithLibelle = await prisma.espece.findMany({
    orderBy: {
      code: "asc"
    },
    where: q ? {
      OR: [
        {
          nom_francais: {
            contains: q
          }
        },
        {
          nom_latin: {
            contains: q
          }
        }
      ]
    } : undefined,
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
    )
    .map(espece => {
      const { nom_francais, nom_latin, classe_id, ...others } = espece;
      return {
        ...others,
        classeId: classe_id,
        nomFrancais: nom_francais,
        nomLatin: nom_latin
      }
    })

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
        nom_francais: {
          contains: q
        }
      },
      {
        nom_latin: {
          contains: q
        }
      }
    ]
  } : {};
}

export const findAllEspeces = async (options?: Prisma.EspeceFindManyArgs): Promise<EspeceObj[]> => {
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
      ...buildEspeceFromEspeceDb(espece),
      nbDonnees: espece._count.donnee
    }
  });
};

export const findPaginatedEspeces = async (
  options: QueryPaginatedEspecesArgs = {},
  includeCounts = true
): Promise<EspecesPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.EspeceOrderByWithRelationInput>;
  switch (orderByField) {
    case "id":
    case "code":
      orderBy = {
        [orderByField]: sortOrder
      }
      break;
    case "nomFrancais":
      orderBy = {
        nom_francais: sortOrder
      }
      break;
    case "nomLatin":
      orderBy = {
        nom_latin: sortOrder
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
          _count: sortOrder
        }
      }
    }
      break;
    default:
      orderBy = {}
  }

  const [especesDb, count] = await prisma.$transaction([
    prisma.espece.findMany({
      ...getPrismaPagination(searchParams),
      include: {
        classe: {
          select: {
            id: true,
            libelle: true
          }
        },
        _count: includeCounts && {
          select: {
            donnee: true
          }
        },
      },
      orderBy,
      where: getFilterClause(searchParams?.q)
    }),
    prisma.espece.count({
      where: getFilterClause(searchParams?.q)
    })
  ])

  return {
    result: especesDb.map((espece) => {
      return {
        ...espece,
        classeId: espece.classe_id,
        nomFrancais: espece.nom_francais,
        nomLatin: espece.nom_latin,
        ...(includeCounts ? { nbDonnees: espece._count.donnee } : {})
      }
    }),
    count
  }
};

export const persistEspece = async (
  espece: EspeceObj
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_ESPECE, espece, DB_SAVE_MAPPING_ESPECE);
};

export const insertEspeces = (
  especes: EspeceObj[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_ESPECE, especes, DB_SAVE_MAPPING_ESPECE);
};