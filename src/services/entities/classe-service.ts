import { Classe, DatabaseRole, Prisma } from "@prisma/client";
import { FindParams, MutationUpsertClasseArgs, QueryPaginatedClassesArgs } from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import {
  getEntiteAvecLibelleFilterClause,
  getPrismaPagination,
  getSqlPagination,
  getSqlSorting,
  isEntityReadOnly,
  queryParametersToFindAllEntities,
  ReadonlyStatus,
  transformQueryRawResultsBigIntsToNumbers,
} from "./entities-utils";

export const findClasseOfEspeceId = async (
  especeId: number | undefined,
  loggedUser: LoggedUser | null = null
): Promise<(Classe & ReadonlyStatus) | null> => {
  const classeEntity = await prisma.espece
    .findUnique({
      where: {
        id: especeId,
      },
    })
    .classe();

  if (!classeEntity) {
    return null;
  }

  return {
    ...classeEntity,
    readonly: isEntityReadOnly(classeEntity, loggedUser),
  };
};

export const findClasse = async (
  id: number,
  loggedUser: LoggedUser | null
): Promise<(Classe & ReadonlyStatus) | null> => {
  validateAuthorization(loggedUser);

  const classeEntity = await prisma.classe.findUnique({
    where: {
      id,
    },
  });

  if (!classeEntity) {
    return null;
  }

  return {
    ...classeEntity,
    readonly: isEntityReadOnly(classeEntity, loggedUser),
  };
};

export const findClasses = async (
  params?: FindParams | null,
  loggedUser: LoggedUser | null = null
): Promise<(Classe & ReadonlyStatus)[]> => {
  const { q, max } = params ?? {};

  const classeEntities = await prisma.classe.findMany({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: q || undefined,
      },
    },
    take: max || undefined,
  });

  return classeEntities?.map((classe) => {
    return {
      ...classe,
      readonly: isEntityReadOnly(classe, loggedUser),
    };
  });
};

export const findPaginatedClasses = async (
  options: Partial<QueryPaginatedClassesArgs> = {},
  loggedUser: LoggedUser | null = null
): Promise<Classe[]> => {
  const { searchParams, orderBy: orderByField, sortOrder, includeCounts } = options;

  const isNbDonneesNeeded = includeCounts || orderByField === "nbDonnees";

  let classeEntities: (Classe & { nbEspeces?: number; nbDonnees?: number })[];

  if (isNbDonneesNeeded) {
    const queryExpression = searchParams?.q ? `%${searchParams.q}%` : null;
    const filterRequest = queryExpression
      ? Prisma.sql`
    WHERE
      libelle LIKE ${queryExpression}
    `
      : Prisma.empty;

    const donneesPerClasseIdRequest = Prisma.sql`
    SELECT 
      c.*, c.owner_id as ownerId, count(DISTINCT e.id) as nbEspeces, count(d.id) as nbDonnees
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
    `;

    classeEntities = await prisma.$queryRaw<
      (Classe & { nbEspeces: bigint; nbDonnees: bigint })[]
    >`${donneesPerClasseIdRequest} ${getSqlSorting(options)} ${getSqlPagination(searchParams)}`.then(
      transformQueryRawResultsBigIntsToNumbers
    );
  } else {
    let orderBy: Prisma.Enumerable<Prisma.ClasseOrderByWithRelationInput> | undefined = undefined;
    if (sortOrder) {
      switch (orderByField) {
        case "id":
        case "libelle":
          orderBy = {
            [orderByField]: sortOrder,
          };
          break;
        case "nbEspeces":
          orderBy = {
            espece: {
              _count: sortOrder,
            },
          };
          break;
        default:
          orderBy = {};
      }
    }

    classeEntities = await prisma.classe.findMany({
      ...getPrismaPagination(searchParams),
      orderBy,
      where: getEntiteAvecLibelleFilterClause(searchParams?.q),
    });
  }

  return classeEntities?.map((classe) => {
    return {
      ...classe,
      readonly: isEntityReadOnly(classe, loggedUser),
    };
  });
};

export const getClassesCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
  validateAuthorization(loggedUser);

  return prisma.classe.count({
    where: getEntiteAvecLibelleFilterClause(q),
  });
};

export const upsertClasse = async (
  args: MutationUpsertClasseArgs,
  loggedUser: LoggedUser
): Promise<Classe & ReadonlyStatus> => {
  const { id, data } = args;

  let upsertedClasse: Classe;

  if (id) {
    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== DatabaseRole.admin) {
      const existingData = await prisma.classe.findFirst({
        where: { id },
      });

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing class
    try {
      upsertedClasse = await prisma.classe.update({
        where: { id },
        data,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  } else {
    // Create a new class
    try {
      upsertedClasse = await prisma.classe.create({
        data: {
          ...data,
          ownerId: loggedUser.id,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  }

  return {
    ...upsertedClasse,
    readonly: false,
  };
};

export const deleteClasse = async (id: number, loggedUser: LoggedUser | null): Promise<Classe> => {
  validateAuthorization(loggedUser);

  // Check that the user is allowed to modify the existing data
  if (loggedUser?.role !== DatabaseRole.admin) {
    const existingData = await prisma.classe.findFirst({
      where: { id },
    });

    if (existingData?.ownerId !== loggedUser?.id) {
      throw new OucaError("OUCA0001");
    }
  }
  return prisma.classe.delete({
    where: {
      id,
    },
  });
};

export const createClasses = async (
  classes: Omit<Prisma.ClasseCreateManyInput, "ownerId">[],
  loggedUser: LoggedUser
): Promise<Prisma.BatchPayload> => {
  return prisma.classe.createMany({
    data: classes.map((classe) => {
      return { ...classe, ownerId: loggedUser.id };
    }),
  });
};
