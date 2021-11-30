import { Classe, Prisma } from "@prisma/client";
import { ClassesPaginatedResult, ClasseWithCounts, FindParams, MutationUpsertClasseArgs, QueryPaginatedClassesArgs } from "../../model/graphql";
import prisma from "../../sql/prisma";
import { COLUMN_LIBELLE } from "../../utils/constants";
import counterReducer from "../../utils/counterReducer";
import { getEntiteAvecLibelleFilterClause, getPrismaPagination, getSqlPagination, getSqlSorting, queryParametersToFindAllEntities } from "./entities-utils";

export const findClasseOfEspeceId = async (especeId: number): Promise<Classe | null> => {
  return prisma.espece.findUnique({
    where: {
      id: especeId
    },
  }).classe();
};

export const findClasse = async (id: number): Promise<Classe | null> => {
  return prisma.classe.findUnique({
    where: {
      id
    },
  });
};

export const findClasses = async (params?: FindParams): Promise<Classe[]> => {

  const { q, max } = params ?? {};

  return prisma.classe.findMany({
    orderBy: {
      libelle: "asc"
    },
    where: {
      libelle: {
        startsWith: q || undefined
      }
    },
    take: max || undefined
  });
};

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

export const findPaginatedClasses = async (
  options: QueryPaginatedClassesArgs = {},
  includeCounts = true
): Promise<ClassesPaginatedResult> => {

  const { searchParams, orderBy: orderByField, sortOrder } = options;

  const isNbDonneesNeeded = includeCounts || (orderByField === "nbDonnees");

  let classes: ClasseWithCounts[];

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

    classes = await prisma.$queryRaw<(Classe & { nbEspeces: number, nbDonnees: number })[]>`${donneesPerClasseIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`;

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

export const upsertClasse = async (
  args: MutationUpsertClasseArgs
): Promise<Classe> => {
  const { id, data } = args;
  if (id) {
    return prisma.classe.update({
      where: { id },
      data
    });

  } else {
    return prisma.classe.create({ data });
  }
};

export const deleteClasse = async (id: number): Promise<Classe> => {
  return prisma.classe.delete({
    where: {
      id
    }
  });
}

export const createClasses = async (
  classes: Omit<Classe, 'id'>[]
): Promise<Prisma.BatchPayload> => {
  return prisma.classe.createMany({
    data: classes
  });
};