import { type Donnee as DonneeEntity, type Inventaire, type Lieudit, type Prisma } from "@prisma/client";
import { type Logger } from "pino";
import {
  SortOrder,
  type DonneeNavigationData,
  type InputDonnee,
  type MutationUpsertDonneeArgs,
  type PaginatedSearchDonneesResultResultArgs,
  type SearchDonneeCriteria,
} from "../../graphql/generated/graphql-types";
import { type Age } from "../../repositories/age/age-repository-types";
import { type Classe } from "../../repositories/classe/classe-repository-types";
import { type Commune } from "../../repositories/commune/commune-repository-types";
import { type Comportement } from "../../repositories/comportement/comportement-repository-types";
import { type Departement } from "../../repositories/departement/departement-repository-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type Espece } from "../../repositories/espece/espece-repository-types";
import { type EstimationDistance } from "../../repositories/estimation-distance/estimation-distance-repository-types";
import { type EstimationNombre } from "../../repositories/estimation-nombre/estimation-nombre-repository-types";
import { type Meteo } from "../../repositories/meteo/meteo-repository-types";
import { type Milieu } from "../../repositories/milieu/milieu-repository-types";
import { type Observateur } from "../../repositories/observateur/observateur-repository-types";
import { type Sexe } from "../../repositories/sexe/sexe-repository-types";
import prisma from "../../sql/prisma";
import { type LoggedUser } from "../../types/User";
import { validateAuthorization } from "./authorization-utils";
import { buildSearchDonneeCriteria } from "./donnee-utils";
import { getPrismaPagination } from "./entities-utils";
import { normalizeInventaire } from "./inventaire-service";

type DonneeServiceDependencies = {
  logger: Logger;
  donneeRepository: DonneeRepository;
};

export const buildDonneeService = ({ logger, donneeRepository }: DonneeServiceDependencies) => {
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
    findLastDonneeId,
    findNextRegroupement,
  };
};

export type DonneeService = ReturnType<typeof buildDonneeService>;

export type DonneeWithRelations = DonneeEntity & {
  age: Age;
  sexe: Sexe;
  comportements: Comportement[];
  milieux: Milieu[];
  estimationNombre: EstimationNombre;
};

export type FullDonnee = DonneeWithRelations & {
  inventaire: Inventaire & {
    observateur: Observateur;
    associes: Observateur[];
    lieuDit: Lieudit & {
      commune: Commune & {
        departement: Departement;
      };
    };
    meteos: Meteo[];
  };
  espece: Espece & { classe: Classe | null };
  estimationDistance: EstimationDistance | null;
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

export const findDonnee = async (id: number | undefined): Promise<DonneeWithRelations | null> => {
  return prisma.donnee
    .findUnique({
      include: COMMON_DONNEE_INCLUDE,
      where: {
        id,
      },
    })
    .then((donnee) => (donnee ? normalizeDonnee(donnee) : null));
};

export const findDonneesByCriteria = async (
  searchCriteria: SearchDonneeCriteria | null = null
): Promise<FullDonnee[]> => {
  const donnees = await prisma.donnee
    .findMany({
      include: {
        ...COMMON_DONNEE_INCLUDE,
        inventaire: {
          include: {
            observateur: true,
            inventaire_associe: {
              select: {
                observateur: true,
              },
            },
            lieuDit: {
              include: {
                commune: {
                  include: {
                    departement: true,
                  },
                },
              },
            },
            inventaire_meteo: {
              select: {
                meteo: true,
              },
            },
          },
        },
        espece: {
          include: {
            classe: true,
          },
        },
      },
      orderBy: {
        id: SortOrder.Asc,
      },
      where: buildSearchDonneeCriteria(searchCriteria),
    })
    .then((donnees) => {
      return donnees.map((donnee) => {
        const { inventaire, ...restDonnee } = donnee;
        const normalizedInventaire = normalizeInventaire(inventaire);
        return {
          ...normalizeDonnee(restDonnee),
          inventaire: normalizedInventaire,
        };
      });
    });

  return donnees;
};

export const findPaginatedDonneesByCriteria = async (
  options: PaginatedSearchDonneesResultResultArgs = {}
): Promise<DonneeWithRelations[]> => {
  const { searchParams, searchCriteria, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.DonneeOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "nombre":
        orderBy = {
          [orderByField]: sortOrder,
        };
        break;
      case "codeEspece":
        orderBy = {
          espece: {
            code: sortOrder,
          },
        };

        break;
      case "nomFrancais":
        orderBy = {
          espece: {
            nomFrancais: sortOrder,
          },
        };
        break;
      case "sexe":
        orderBy = {
          sexe: {
            libelle: sortOrder,
          },
        };
        break;
      case "age":
        orderBy = {
          age: {
            libelle: sortOrder,
          },
        };
        break;
      case "departement":
        orderBy = {
          inventaire: {
            lieuDit: {
              commune: {
                departement: {
                  code: sortOrder,
                },
              },
            },
          },
        };
        break;
      case "codeCommune":
        orderBy = {
          inventaire: {
            lieuDit: {
              commune: {
                code: sortOrder,
              },
            },
          },
        };
        break;
      case "nomCommune":
        orderBy = {
          inventaire: {
            lieuDit: {
              commune: {
                nom: sortOrder,
              },
            },
          },
        };
        break;
      case "lieuDit":
        orderBy = {
          inventaire: {
            lieuDit: {
              nom: sortOrder,
            },
          },
        };
        break;
      case "date":
      case "heure":
      case "duree":
        orderBy = {
          inventaire: {
            [orderByField]: sortOrder,
          },
        };
        break;
      case "observateur":
        {
          orderBy = {
            inventaire: {
              observateur: {
                libelle: sortOrder,
              },
            },
          };
        }
        break;
      default:
        orderBy = {
          id: SortOrder.Desc,
        };
    }
  }

  return prisma.donnee
    .findMany({
      ...getPrismaPagination(searchParams),
      include: COMMON_DONNEE_INCLUDE,
      orderBy,
      where: buildSearchDonneeCriteria(searchCriteria),
    })
    .then((donnees) => {
      return donnees.map(normalizeDonnee);
    });
};

export const getNbDonneesByCriteria = async (searchCriteria?: SearchDonneeCriteria | null): Promise<number> => {
  return prisma.donnee.count({
    where: buildSearchDonneeCriteria(searchCriteria),
  });
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

export const findAllDonnees = async (): Promise<DonneeWithRelations[]> => {
  return prisma.donnee
    .findMany({
      include: COMMON_DONNEE_INCLUDE,
    })
    .then((donnees) => {
      return donnees.map(normalizeDonnee);
    });
};
