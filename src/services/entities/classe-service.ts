import { Classe as ClasseEntity, Prisma } from "@prisma/client";
import { Classe, ClassesPaginatedResult, QueryClassesArgs } from "../../model/graphql";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { createKeyValueMapWithSameName, queryParametersToFindAllEntities } from "../../sql/sql-queries-utils";
import { COLUMN_LIBELLE, TABLE_CLASSE } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { getEntiteAvecLibelleFilterClause, getPrismaPagination, getSqlPagination, getSqlSorting } from "./entities-utils";
import { insertMultipleEntities, persistEntity } from "./entity-service";


const DB_SAVE_MAPPING_CLASSE = createKeyValueMapWithSameName("libelle");

export const findAllClasses = async (): Promise<Classe[]> => {
  const classes = await
    prisma.classe.findMany({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      include: {
        _count: {
          select: {
            espece: true
          }
        },
        espece: {
          select: {
            id: true,
            _count: {
              select: {
                donnee: true
              }
            }
          }
        }
      },
    });

  return classes.map((classe) => {
    const nbDonnees = classe?.espece?.map(espece => espece._count.donnee).reduce(counterReducer, 0) ?? 0;
    return {
      ...classe,
      nbEspeces: classe._count.espece,
      nbDonnees
    }
  });
};

export const findClasses = async (
  options: QueryClassesArgs = {},
  includeCounts = true
): Promise<ClassesPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  const isNbDonneesNeeded = includeCounts || (orderByField === "nbDonnees");

  let classes: Classe[];

  if (isNbDonneesNeeded) {

    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression ? Prisma.sql`
    WHERE
      libelle LIKE ${queryExpression}
    ` : Prisma.empty;

    const donneesPerClasseIdRequest = Prisma.sql`
    SELECT 
      c.*, count(DISTINCT e.id) as nbEspeces, count(d.id) as nbDonnees
    FROM 
      donnee d 
    RIGHT JOIN 
      espece e
    ON 
      d.espece_id = e.id 
    RIGHT JOIN
      classe c
    ON
      e.classe_id = c.id
    ${filterRequest}
    GROUP BY 
      c.id
    `

    classes = await prisma.$queryRaw<(ClasseEntity & { nbEspeces: number, nbDonnees: number })[]>`${donneesPerClasseIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

  } else {

    let orderBy: Prisma.Enumerable<Prisma.ClasseOrderByWithRelationInput>;
    switch (orderByField) {
      case "id":
      case "libelle":
        orderBy = {
          [orderByField]: sortOrder
        }
        break;
      case "nbEspeces":
        orderBy = sortOrder && {
          espece: {
            _count: sortOrder
          }
        }
        break;
      default:
        orderBy = {}
    }

    const classesRq = await prisma.classe.findMany({
      ...getPrismaPagination(searchParams),
      include: {
        _count: includeCounts && {
          select: {
            espece: true
          }
        }
      },
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q)
    })

    classes = classesRq.map((classe) => {
      return {
        ...classe,
        ...(includeCounts ? {
          nbEspeces: classe._count.espece,
        } : {})
      }
    })

  }

  const count = await prisma.classe.count({
    where: getEntiteAvecLibelleFilterClause(searchParams?.q)
  });

  return {
    result: classes,
    count
  }
};

export const persistClasse = async (
  classe: Classe
): Promise<SqlSaveResponse> => {
  return persistEntity(TABLE_CLASSE, classe, DB_SAVE_MAPPING_CLASSE);
};

export const insertClasses = async (
  classes: Classe[]
): Promise<SqlSaveResponse> => {
  return insertMultipleEntities(TABLE_CLASSE, classes, DB_SAVE_MAPPING_CLASSE);
};
