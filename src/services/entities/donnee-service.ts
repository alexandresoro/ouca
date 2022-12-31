import { type Donnee as DonneeEntity } from "@prisma/client";
import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import {
  type DonneeNavigationData,
  type InputDonnee,
  type MutationUpsertDonneeArgs,
  type PaginatedSearchDonneesResultResultArgs,
  type SearchDonneeCriteria,
} from "../../graphql/generated/graphql-types";
import { type Age } from "../../repositories/age/age-repository-types";
import { type Comportement } from "../../repositories/comportement/comportement-repository-types";
import { type DonneeComportementRepository } from "../../repositories/donnee-comportement/donnee-comportement-repository";
import { type DonneeMilieuRepository } from "../../repositories/donnee-milieu/donnee-milieu-repository";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type Donnee } from "../../repositories/donnee/donnee-repository-types";
import { type EstimationNombre } from "../../repositories/estimation-nombre/estimation-nombre-repository-types";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository";
import { type Milieu } from "../../repositories/milieu/milieu-repository-types";
import { type Sexe } from "../../repositories/sexe/sexe-repository-types";
import prisma from "../../sql/prisma";
import { type LoggedUser } from "../../types/User";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { reshapeInputDonneeUpsertData } from "./donnee-service-reshape";
import { getSqlPagination } from "./entities-utils";

type DonneeServiceDependencies = {
  logger: Logger;
  slonik: DatabasePool;
  inventaireRepository: InventaireRepository;
  donneeRepository: DonneeRepository;
  donneeComportementRepository: DonneeComportementRepository;
  donneeMilieuRepository: DonneeMilieuRepository;
};

export const buildDonneeService = ({
  slonik,
  inventaireRepository,
  donneeRepository,
  donneeComportementRepository,
  donneeMilieuRepository,
}: DonneeServiceDependencies) => {
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

  const upsertDonnee = async (args: MutationUpsertDonneeArgs, loggedUser: LoggedUser | null): Promise<Donnee> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    // Check if an exact same donnee already exists or not
    const existingDonnee = await findExistingDonnee(data);

    if (existingDonnee && existingDonnee.id !== id) {
      // The donnee already exists so we return an error
      throw new OucaError("OUCA0004", {
        code: "OUCA0004",
        message: `Cette donnée existe déjà (ID = ${existingDonnee.id}).`,
      });
    } else {
      const { comportementsIds, milieuxIds } = data;

      if (id) {
        const updatedDonnee = await slonik.transaction(async (transactionConnection) => {
          const updatedDonnee = await donneeRepository.updateDonnee(
            id,
            reshapeInputDonneeUpsertData(data),
            transactionConnection
          );

          await donneeComportementRepository.deleteComportementsOfDonneeId(id, transactionConnection);

          if (comportementsIds?.length) {
            await donneeComportementRepository.insertDonneeWithComportements(
              id,
              comportementsIds,
              transactionConnection
            );
          }

          await donneeMilieuRepository.deleteMilieuxOfDonneeId(id, transactionConnection);

          if (milieuxIds?.length) {
            await donneeMilieuRepository.insertDonneeWithMilieux(id, milieuxIds, transactionConnection);
          }

          return updatedDonnee;
        });

        return updatedDonnee;
      } else {
        return createDonnee(data);
      }
    }
  };

  const createDonnee = async (donnee: InputDonnee): Promise<Donnee> => {
    const { comportementsIds, milieuxIds } = donnee;

    const createdDonnee = await slonik.transaction(async (transactionConnection) => {
      const createdDonnee = await donneeRepository.createDonnee(
        reshapeInputDonneeUpsertData(donnee),
        transactionConnection
      );

      if (comportementsIds?.length) {
        await donneeComportementRepository.insertDonneeWithComportements(
          createdDonnee.id,
          comportementsIds,
          transactionConnection
        );
      }

      if (milieuxIds?.length) {
        await donneeMilieuRepository.insertDonneeWithMilieux(createdDonnee.id, milieuxIds, transactionConnection);
      }

      return createdDonnee;
    });

    return createdDonnee;
  };

  const deleteDonnee = async (id: number, loggedUser: LoggedUser | null): Promise<Donnee> => {
    validateAuthorization(loggedUser);

    const deletedDonnee = await slonik.transaction(async (transactionConnection) => {
      // First get the corresponding inventaire
      const inventaire = await inventaireRepository.findInventaireByDonneeId(id, transactionConnection);

      if (loggedUser.role !== "admin" && inventaire?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }

      // Delete the actual donnee
      const deletedDonnee = await donneeRepository.deleteDonneeById(id, transactionConnection);

      if (!inventaire) {
        return deletedDonnee;
      }

      // Check how many donnees the inventaire has after the deletion
      const nbDonneesOfInventaire = await donneeRepository.getCountByInventaireId(inventaire.id, transactionConnection);

      if (nbDonneesOfInventaire === 0) {
        // If the inventaire has no more donnees then we remove the inventaire
        await inventaireRepository.deleteInventaireById(inventaire.id, transactionConnection);
      }

      return deletedDonnee;
    });

    return deletedDonnee;
  };

  return {
    findDonnee,
    findAllDonnees,
    findPaginatedDonnees,
    getDonneesCount,
    findLastDonneeId,
    findNextRegroupement,
    upsertDonnee,
    createDonnee,
    deleteDonnee,
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

const upsertDonnee = async (args: MutationUpsertDonneeArgs): Promise<DonneeWithRelations> => {
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

const createDonnee = async (donnee: InputDonnee): Promise<DonneeWithRelations> => {
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
