import { type Donnee as DonneeEntity } from "@prisma/client";
import { type Logger } from "pino";
import {
  type DonneeNavigationData,
  type InputDonnee,
  type MutationUpsertDonneeArgs,
  type PaginatedSearchDonneesResultResultArgs,
  type SearchDonneeCriteria,
} from "../../graphql/generated/graphql-types";
import { type Age } from "../../repositories/age/age-repository-types";
import { type Comportement } from "../../repositories/comportement/comportement-repository-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type Donnee } from "../../repositories/donnee/donnee-repository-types";
import { type EstimationNombre } from "../../repositories/estimation-nombre/estimation-nombre-repository-types";
import { type Milieu } from "../../repositories/milieu/milieu-repository-types";
import { type Sexe } from "../../repositories/sexe/sexe-repository-types";
import prisma from "../../sql/prisma";
import { type LoggedUser } from "../../types/User";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination } from "./entities-utils";

type DonneeServiceDependencies = {
  logger: Logger;
  donneeRepository: DonneeRepository;
};

export const buildDonneeService = ({ donneeRepository }: DonneeServiceDependencies) => {
  const findDonnee = async (id: number, loggedUser: LoggedUser | null): Promise<Donnee | null> => {
    validateAuthorization(loggedUser);

    return donneeRepository.findDonneeById(id);
  };

  // Be careful when calling it, it will retrieve a lot of data!
  const findAllDonnees = async (): Promise<Donnee[]> => {
    const donnees = await donneeRepository.findDonnees();

    return [...donnees];
  };

  const findPaginatedDonnees = async (
    loggedUser: LoggedUser | null,
    options: PaginatedSearchDonneesResultResultArgs = {}
  ): Promise<Donnee[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, searchCriteria, orderBy: orderByField, sortOrder } = options;

    const donnees = await donneeRepository.findDonnees({
      searchCriteria,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...donnees];
  };

  const getDonneesCount = async (
    loggedUser: LoggedUser | null,
    searchCriteria?: SearchDonneeCriteria | null
  ): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCount(searchCriteria);
  };

  const findLastDonneeId = async (loggedUser: LoggedUser | null): Promise<number | null> => {
    validateAuthorization(loggedUser);

    const latestDonneeId = await donneeRepository.findLatestDonneeId();

    return latestDonneeId;
  };

  const findNextRegroupement = async (loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    const latestRegroupement = await donneeRepository.findLatestRegroupement();
    return (latestRegroupement ?? 0) + 1;
  };

  return {
    findDonnee,
    findAllDonnees,
    findPaginatedDonnees,
    getDonneesCount,
    findLastDonneeId,
    findNextRegroupement,
  };
};

export type DonneeService = ReturnType<typeof buildDonneeService>;

type DonneeWithRelations = DonneeEntity & {
  age: Age;
  sexe: Sexe;
  comportements: Comportement[];
  milieux: Milieu[];
  estimationNombre: EstimationNombre;
};

type DonneeRelatedTablesFields = {
  donnee_comportement: {
    comportement: Comportement;
  }[];
  donnee_milieu: {
    milieu: Milieu;
  }[];
};

const COMMON_DONNEE_INCLUDE = {
  age: true,
  sexe: true,
  estimationDistance: true,
  estimationNombre: true,
  donnee_comportement: {
    select: {
      comportement: true,
    },
  },
  donnee_milieu: {
    select: {
      milieu: true,
    },
  },
};

const normalizeDonnee = <T extends DonneeRelatedTablesFields>(
  donnee: T
): Omit<T, "donnee_comportement" | "donnee_milieu"> & {
  comportements: Comportement[];
  milieux: Milieu[];
} => {
  const { donnee_comportement, donnee_milieu, ...restDonnee } = donnee;
  const comportementsArray = donnee_comportement.map((donnee_comportement) => {
    return donnee_comportement?.comportement;
  });
  const milieuxArray = donnee_milieu.map((donnee_milieu) => {
    return donnee_milieu?.milieu;
  });

  return {
    ...restDonnee,
    comportements: comportementsArray,
    milieux: milieuxArray,
  };
};

export const findDonneeNavigationData = async (donneeId: number | undefined): Promise<DonneeNavigationData> => {
  const previousDonnee = await prisma.donnee.findFirst({
    select: {
      id: true,
    },
    where: {
      id: {
        lt: donneeId,
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  const nextDonnee = await prisma.donnee.findFirst({
    select: {
      id: true,
    },
    where: {
      id: {
        gt: donneeId,
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  const index = await prisma.donnee.count({
    where: {
      id: {
        lte: donneeId,
      },
    },
  });

  return {
    index,
    previousDonneeId: previousDonnee?.id,
    nextDonneeId: nextDonnee?.id,
  };
};

export const findExistingDonnee = async (donnee: InputDonnee): Promise<DonneeEntity | null> => {
  const donneesCandidates = await prisma.donnee.findMany({
    where: {
      inventaireId: donnee.inventaireId,
      especeId: donnee.especeId,
      sexeId: donnee.sexeId,
      ageId: donnee.ageId,
      estimationNombreId: donnee.estimationNombreId,
      nombre: donnee?.nombre ?? null,
      estimationDistanceId: donnee?.estimationDistanceId ?? null,
      distance: donnee?.distance ?? null,
      regroupement: donnee?.regroupement ?? null,
      commentaire: donnee?.commentaire ?? null,
      ...(donnee.comportementsIds != null
        ? {
            donnee_comportement: {
              every: {
                comportement_id: {
                  in: donnee.comportementsIds,
                },
              },
            },
          }
        : {}),
      ...(donnee.milieuxIds != null
        ? {
            donnee_milieu: {
              every: {
                milieu_id: {
                  in: donnee.milieuxIds,
                },
              },
            },
          }
        : {}),
    },
    include: {
      donnee_comportement: true,
      donnee_milieu: true,
    },
  });

  // At this point the candidates are the ones that match all parameters and for which each comportement+milieu is in the required list
  // However, we did not check yet that this candidates have exactly the requested comportements/milieux as they can have additional ones

  return (
    donneesCandidates?.filter((donneeEntity) => {
      const matcherComportementsLength = donnee?.comportementsIds?.length ?? 0;
      const matcherMilieuxLength = donnee?.milieuxIds?.length ?? 0;

      const areComportementsSameLength = donneeEntity.donnee_comportement?.length === matcherComportementsLength;
      const areMilieuxSameLength = donneeEntity.donnee_milieu?.length === matcherMilieuxLength;

      return areComportementsSameLength && areMilieuxSameLength;
    })?.[0] ?? null
  );
};

export const upsertDonnee = async (args: MutationUpsertDonneeArgs): Promise<DonneeWithRelations> => {
  const { id, data } = args;

  // Check if an exact same donnee already exists or not
  const existingDonnee = await findExistingDonnee(data);

  if (existingDonnee && existingDonnee.id !== id) {
    // The donnee already exists so we return an error
    return Promise.reject(`Cette donnée existe déjà (ID = ${existingDonnee.id}).`);
  } else {
    const { comportementsIds, milieuxIds, ...restData } = data;

    const comportementMap =
      comportementsIds?.map((comportementId) => {
        return {
          comportement_id: comportementId,
        };
      }) ?? [];

    const milieuMap =
      milieuxIds?.map((milieuId) => {
        return {
          milieu_id: milieuId,
        };
      }) ?? [];

    if (id) {
      return prisma.donnee
        .update({
          where: { id },
          include: COMMON_DONNEE_INCLUDE,
          data: {
            ...restData,
            donnee_comportement: {
              deleteMany: {
                donnee_id: id,
              },
              create: comportementMap,
            },
            donnee_milieu: {
              deleteMany: {
                donnee_id: id,
              },
              create: milieuMap,
            },
          },
        })
        .then(normalizeDonnee);
    } else {
      return createDonnee(data);
    }
  }
};

export const createDonnee = async (donnee: InputDonnee): Promise<DonneeWithRelations> => {
  const { comportementsIds, milieuxIds, ...restData } = donnee;

  const comportementMap =
    comportementsIds?.map((comportementId) => {
      return {
        comportement_id: comportementId,
      };
    }) ?? [];

  const milieuMap =
    milieuxIds?.map((milieuId) => {
      return {
        milieu_id: milieuId,
      };
    }) ?? [];

  return prisma.donnee
    .create({
      data: {
        ...restData,
        date_creation: new Date(),
        donnee_comportement: {
          create: comportementMap,
        },
        donnee_milieu: {
          create: milieuMap,
        },
      },
      include: COMMON_DONNEE_INCLUDE,
    })
    .then(normalizeDonnee);
};

export const deleteDonnee = async (donneeId: number): Promise<DonneeEntity> => {
  // First get the corresponding inventaire_id
  const inventaire = await prisma.donnee
    .findUnique({
      where: {
        id: donneeId,
      },
    })
    .inventaire();

  // Delete the actual donnee
  const deletedDonnee = await prisma.donnee.delete({
    where: {
      id: donneeId,
    },
  });

  // Check how many donnees the inventaire has after the deletion
  const nbDonneesOfInventaire = await prisma.donnee.count({
    where: {
      inventaireId: inventaire?.id,
    },
  });

  if (nbDonneesOfInventaire === 0) {
    // If the inventaire has no more donnees then we remove the inventaire
    await prisma.inventaire.delete({
      where: {
        id: inventaire?.id,
      },
    });
  }
  return deletedDonnee;
};
