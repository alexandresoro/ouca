import { Prisma } from "@prisma/client";
import { EspecesPaginatedResult, QueryEspecesArgs } from "../../model/graphql";
import { Espece } from "../../model/types/espece.model";
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

export const findAllEspeces = async (options?: Prisma.EspeceFindManyArgs): Promise<Espece[]> => {
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

export const findEspeces = async (
  options: QueryEspecesArgs = {},
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
  espece: Espece
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_ESPECE, espece, DB_SAVE_MAPPING_ESPECE);
};

export const insertEspeces = (
  especes: Espece[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_ESPECE, especes, DB_SAVE_MAPPING_ESPECE);
};