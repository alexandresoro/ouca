import {
  Age,
  Classe,
  Commune,
  Comportement,
  Departement,
  Donnee as DonneeEntity,
  Espece,
  EstimationDistance,
  EstimationNombre,
  Inventaire,
  Lieudit,
  Meteo,
  Milieu,
  Observateur,
  Prisma,
  Sexe
} from "@prisma/client";
import {
  AgeWithSpecimensCount,
  DonneeNavigationData,
  InputDonnee,
  MutationUpsertDonneeArgs,
  QueryPaginatedSearchDonneesArgs,
  SearchDonneeCriteria,
  SexeWithSpecimensCount,
  SortOrder
} from "../../graphql/generated/graphql-types";
import prisma from "../../sql/prisma";
import { buildSearchDonneeCriteria } from "./donnee-utils";
import { getPrismaPagination } from "./entities-utils";
import { normalizeInventaire } from "./inventaire-service";

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
      comportement: true
    }
  },
  donnee_milieu: {
    select: {
      milieu: true
    }
  }
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
    milieux: milieuxArray
  };
};

export const findDonnee = async (id: number | undefined): Promise<DonneeWithRelations | null> => {
  return prisma.donnee
    .findUnique({
      include: COMMON_DONNEE_INCLUDE,
      where: {
        id
      }
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
                observateur: true
              }
            },
            lieuDit: {
              include: {
                commune: {
                  include: {
                    departement: true
                  }
                }
              }
            },
            inventaire_meteo: {
              select: {
                meteo: true
              }
            }
          }
        },
        espece: {
          include: {
            classe: true
          }
        }
      },
      orderBy: {
        id: SortOrder.Asc
      },
      where: buildSearchDonneeCriteria(searchCriteria)
    })
    .then((donnees) => {
      return donnees.map((donnee) => {
        const { inventaire, ...restDonnee } = donnee;
        const normalizedInventaire = normalizeInventaire(inventaire);
        return {
          ...normalizeDonnee(restDonnee),
          inventaire: normalizedInventaire
        };
      });
    });

  return donnees;
};

export const findPaginatedDonneesByCriteria = async (
  options: QueryPaginatedSearchDonneesArgs = {}
): Promise<{
  result: DonneeWithRelations[];
  count: number;
}> => {
  const { searchParams, searchCriteria, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.DonneeOrderByWithRelationInput> | undefined = undefined;
  if (sortOrder) {
    switch (orderByField) {
      case "id":
      case "nombre":
        orderBy = {
          [orderByField]: sortOrder
        };
        break;
      case "codeEspece":
        orderBy = {
          espece: {
            code: sortOrder
          }
        };

        break;
      case "nomFrancais":
        orderBy = {
          espece: {
            nomFrancais: sortOrder
          }
        };
        break;
      case "sexe":
        orderBy = {
          sexe: {
            libelle: sortOrder
          }
        };
        break;
      case "age":
        orderBy = {
          age: {
            libelle: sortOrder
          }
        };
        break;
      case "departement":
        orderBy = {
          inventaire: {
            lieuDit: {
              commune: {
                departement: {
                  code: sortOrder
                }
              }
            }
          }
        };
        break;
      case "codeCommune":
        orderBy = {
          inventaire: {
            lieuDit: {
              commune: {
                code: sortOrder
              }
            }
          }
        };
        break;
      case "nomCommune":
        orderBy = {
          inventaire: {
            lieuDit: {
              commune: {
                nom: sortOrder
              }
            }
          }
        };
        break;
      case "lieuDit":
        orderBy = {
          inventaire: {
            lieuDit: {
              nom: sortOrder
            }
          }
        };
        break;
      case "date":
      case "heure":
      case "duree":
        orderBy = {
          inventaire: {
            [orderByField]: sortOrder
          }
        };
        break;
      case "observateur":
        {
          orderBy = {
            inventaire: {
              observateur: {
                libelle: sortOrder
              }
            }
          };
        }
        break;
      default:
        orderBy = {
          id: SortOrder.Desc
        };
    }
  }

  const donnees = await prisma.donnee
    .findMany({
      ...getPrismaPagination(searchParams),
      include: COMMON_DONNEE_INCLUDE,
      orderBy,
      where: buildSearchDonneeCriteria(searchCriteria)
    })
    .then((donnees) => {
      return donnees.map(normalizeDonnee);
    });

  const count = await prisma.donnee.count({
    where: buildSearchDonneeCriteria(searchCriteria)
  });

  return {
    result: donnees,
    count
  };
};

export const findDonneeNavigationData = async (donneeId: number | undefined): Promise<DonneeNavigationData> => {
  const previousDonnee = await prisma.donnee.findFirst({
    select: {
      id: true
    },
    where: {
      id: {
        lt: donneeId
      }
    },
    orderBy: {
      id: "desc"
    }
  });

  const nextDonnee = await prisma.donnee.findFirst({
    select: {
      id: true
    },
    where: {
      id: {
        gt: donneeId
      }
    },
    orderBy: {
      id: "asc"
    }
  });

  const index = await prisma.donnee.count({
    where: {
      id: {
        lte: donneeId
      }
    }
  });

  return {
    index,
    previousDonneeId: previousDonnee?.id,
    nextDonneeId: nextDonnee?.id
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
                  in: donnee.comportementsIds
                }
              }
            }
          }
        : {}),
      ...(donnee.milieuxIds != null
        ? {
            donnee_milieu: {
              every: {
                milieu_id: {
                  in: donnee.milieuxIds
                }
              }
            }
          }
        : {})
    },
    include: {
      donnee_comportement: true,
      donnee_milieu: true
    }
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

export const findLastDonneeId = async (): Promise<number | null> => {
  return prisma.donnee
    .findFirst({
      orderBy: {
        id: Prisma.SortOrder.desc
      }
    })
    .then((donnee) => donnee?.id ?? null)
    .catch(() => Promise.resolve(null));
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
          comportement_id: comportementId
        };
      }) ?? [];

    const milieuMap =
      milieuxIds?.map((milieuId) => {
        return {
          milieu_id: milieuId
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
                donnee_id: id
              },
              create: comportementMap
            },
            donnee_milieu: {
              deleteMany: {
                donnee_id: id
              },
              create: milieuMap
            }
          }
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
        comportement_id: comportementId
      };
    }) ?? [];

  const milieuMap =
    milieuxIds?.map((milieuId) => {
      return {
        milieu_id: milieuId
      };
    }) ?? [];

  return prisma.donnee
    .create({
      data: {
        ...restData,
        date_creation: new Date(),
        donnee_comportement: {
          create: comportementMap
        },
        donnee_milieu: {
          create: milieuMap
        }
      },
      include: COMMON_DONNEE_INCLUDE
    })
    .then(normalizeDonnee);
};

export const deleteDonnee = async (donneeId: number): Promise<DonneeEntity> => {
  // First get the corresponding inventaire_id
  const inventaire = await prisma.donnee
    .findUnique({
      where: {
        id: donneeId
      }
    })
    .inventaire();

  // Delete the actual donnee
  const deletedDonnee = await prisma.donnee.delete({
    where: {
      id: donneeId
    }
  });

  // Check how many donnees the inventaire has after the deletion
  const nbDonneesOfInventaire = await prisma.donnee.count({
    where: {
      inventaireId: inventaire?.id
    }
  });

  if (nbDonneesOfInventaire === 0) {
    // If the inventaire has no more donnees then we remove the inventaire
    await prisma.inventaire.delete({
      where: {
        id: inventaire?.id
      }
    });
  }
  return deletedDonnee;
};

export const findAllDonnees = async (): Promise<DonneeWithRelations[]> => {
  return prisma.donnee
    .findMany({
      include: COMMON_DONNEE_INCLUDE
    })
    .then((donnees) => {
      return donnees.map(normalizeDonnee);
    });
};

export const findNextRegroupement = async (): Promise<number> => {
  const regroupementsAggr = await prisma.donnee.aggregate({
    _max: {
      regroupement: true
    }
  });
  const regroupementMax = regroupementsAggr?._max?.regroupement ?? 0;
  return regroupementMax + 1;
};

export const countSpecimensByAgeForEspeceId = async (especeId: number): Promise<AgeWithSpecimensCount[]> => {
  const agesOfEspece = await prisma.donnee.groupBy({
    by: ["ageId"],
    where: {
      especeId
    },
    _sum: {
      nombre: true
    }
  });

  const ages = await prisma.age.findMany({
    where: {
      id: {
        in: agesOfEspece.map((ageOfEspece) => ageOfEspece.ageId)
      }
    }
  });

  return ages.map((age) => {
    const nbSpecimens = agesOfEspece?.find((ageOfEspece) => ageOfEspece?.ageId === age.id)?._sum?.nombre ?? 0;
    return {
      ...age,
      nbSpecimens
    };
  });
};

export const countSpecimensBySexeForEspeceId = async (especeId: number): Promise<SexeWithSpecimensCount[]> => {
  const sexesOfEspece = await prisma.donnee.groupBy({
    by: ["sexeId"],
    where: {
      especeId
    },
    _sum: {
      nombre: true
    }
  });

  const sexes = await prisma.sexe.findMany({
    where: {
      id: {
        in: sexesOfEspece.map((sexeOfEspece) => sexeOfEspece.sexeId)
      }
    }
  });

  return sexes.map((sexe) => {
    const nbSpecimens = sexesOfEspece?.find((sexeOfEspece) => sexeOfEspece?.sexeId === sexe.id)?._sum?.nombre ?? 0;
    return {
      ...sexe,
      nbSpecimens
    };
  });
};
