import { Age, Classe, Commune, Comportement, Departement, Donnee as DonneeEntity, Espece, EstimationDistance, EstimationNombre, Inventaire, Lieudit, Meteo, Milieu, Observateur, Prisma, Sexe } from "@prisma/client";
import { format, parse } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { AgeWithSpecimensCount, DonneeNavigationData, InputDonnee, MutationUpsertDonneeArgs, QueryPaginatedSearchDonneesArgs, SearchDonneeCriteria, SexeWithSpecimensCount, SortOrder } from "../../model/graphql";
import { Donnee as DonneeObj } from "../../model/types/donnee.object";
import { DonneeCompleteWithIds } from "../../objects/db/donnee-db.type";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { queryToFindComportementsIdsByDonneeId } from "../../sql/sql-queries-comportement";
import { queryToFindDonneeIdsByAllAttributes, queryToGetAllDonneesWithIds, queryToUpdateDonneesInventaireId } from "../../sql/sql-queries-donnee";
import { queryToFindMilieuxIdsByDonneeId } from "../../sql/sql-queries-milieu";
import { createKeyValueMapWithSameName, queryToDeleteAnEntityByAttribute, queryToSaveListOfEntities } from "../../sql/sql-queries-utils";
import { DATE_PATTERN, DATE_WITH_TIME_PATTERN, DONNEE_ID, ID, TABLE_DONNEE, TABLE_DONNEE_COMPORTEMENT, TABLE_DONNEE_MILIEU } from "../../utils/constants";
import { areArraysContainingSameValues, getArrayFromObjects } from "../../utils/utils";
import { getPrismaPagination } from "./entities-utils";
import { insertMultipleEntitiesAndReturnIdsNoCheck, persistEntity } from "./entity-service";
import { normalizeInventaire } from "./inventaire-service";

export type DonneeWithRelations = DonneeEntity & {
  age: Age | null
  sexe: Sexe | null
  comportements: Comportement[]
  milieux: Milieu[]
};

export type FullDonnee = DonneeWithRelations & {
  inventaire: Inventaire & {
    observateur: Observateur
    associes: Observateur[]
    lieuDit: Lieudit & {
      commune: Commune & {
        departement: Departement
      }
    },
    meteos: Meteo[]
  }
  espece: Espece & { classe: Classe }
  estimationDistance: EstimationDistance
  estimationNombre: EstimationNombre
};

type DonneeRelatedTablesFields = {
  donnee_comportement: {
    comportement: Comportement
  }[]
  donnee_milieu: {
    milieu: Milieu
  }[]
}

export const buildSearchDonneeCriteria = (searchCriteria: SearchDonneeCriteria): Prisma.DonneeWhereInput | undefined => {
  return (searchCriteria && Object.keys(searchCriteria).length) ? {
    id: searchCriteria?.id ?? undefined,
    inventaire: {
      observateurId: {
        in: searchCriteria?.observateurs ?? undefined
      },
      ...(searchCriteria?.associes ? {
        inventaire_associe: {
          some: {
            observateur_id: {
              in: searchCriteria?.associes
            }
          }
        }
      } : {}),
      temperature: searchCriteria?.temperature ?? undefined,
      date: {
        gte: searchCriteria?.fromDate ? zonedTimeToUtc(parse(searchCriteria.fromDate, DATE_PATTERN, new Date()), 'UTC') : undefined,
        lte: searchCriteria?.toDate ? zonedTimeToUtc(parse(searchCriteria.toDate, DATE_PATTERN, new Date()), 'UTC') : undefined
      },
      heure: searchCriteria?.heure ?? undefined,
      duree: searchCriteria?.duree ?? undefined,
      lieuDitId: {
        in: searchCriteria?.lieuxdits ?? undefined
      },
      lieuDit: {
        communeId: {
          in: searchCriteria?.communes ?? undefined
        },
        commune: {
          departementId: {
            in: searchCriteria?.departements ?? undefined
          }
        }
      },
      ...(searchCriteria?.meteos ? {
        inventaire_meteo: {
          some: {
            meteo_id: {
              in: searchCriteria?.meteos
            }
          }
        }
      } : {}),
    },
    especeId: {
      in: searchCriteria?.especes ?? undefined
    },
    espece: {
      classeId: {
        in: searchCriteria?.classes ?? undefined
      }
    },
    nombre: searchCriteria?.nombre ?? undefined,
    estimationNombreId: {
      in: searchCriteria?.estimationsNombre ?? undefined
    },
    sexeId: {
      in: searchCriteria?.sexes ?? undefined
    },
    ageId: {
      in: searchCriteria?.ages ?? undefined
    },
    distance: searchCriteria?.distance ?? undefined,
    estimationDistanceId: {
      in: searchCriteria?.estimationsDistance ?? undefined
    },
    regroupement: searchCriteria?.regroupement ?? undefined,
    ...(searchCriteria?.comportements || searchCriteria?.nicheurs ?
      {
        donnee_comportement: {
          some: {
            ...(searchCriteria?.comportements ? {
              comportement_id: {
                in: searchCriteria?.comportements
              }
            } : {}),
            ...(searchCriteria?.nicheurs ? {
              comportement: {
                nicheur: {
                  in: searchCriteria?.nicheurs
                }
              }
            } : {})
          }
        }
      } : {}),
    ...(searchCriteria?.milieux ? {
      donnee_milieu: {
        some: {
          milieu_id: {
            in: searchCriteria?.milieux
          }
        }
      }
    } : {}),
    commentaire: {
      contains: searchCriteria?.commentaire ?? undefined
    }
  } : undefined
}

const DB_SAVE_MAPPING_DONNEE = {
  ...createKeyValueMapWithSameName([
    "nombre",
    "distance",
    "regroupement",
    "commentaire"
  ]),
  inventaire_id: "inventaireId",
  espece_id: "especeId",
  age_id: "ageId",
  sexe_id: "sexeId",
  estimation_nombre_id: "estimationNombreId",
  estimation_distance_id: "estimationDistanceId",
  date_creation: "dateCreation"
}

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
}

const normalizeDonnee = <T extends DonneeRelatedTablesFields>(donnee: T): Omit<T, 'donnee_comportement' | 'donnee_milieu'> & {
  comportements: Comportement[]
  milieux: Milieu[]
} => {
  if (donnee == null) {
    return null;
  }
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
  }
}

export const findDonnee = async (
  id: number
): Promise<DonneeWithRelations> => {
  return prisma.donnee.findUnique({
    include: COMMON_DONNEE_INCLUDE,
    where: {
      id
    }
  }).then(normalizeDonnee);
};

export const findDonneesByCriteria = async (
  searchCriteria: SearchDonneeCriteria = null,
): Promise<FullDonnee[]> => {

  const donnees = await prisma.donnee.findMany({
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
  }).then((donnees) => {
    return donnees.map((donnee) => {
      const { inventaire, ...restDonnee } = donnee;
      const normalizedInventaire = normalizeInventaire(inventaire);
      return {
        ...normalizeDonnee(restDonnee),
        inventaire: normalizedInventaire
      }
    });
  });

  return donnees;
};

export const findPaginatedDonneesByCriteria = async (
  options: QueryPaginatedSearchDonneesArgs = {},
): Promise<{
  result: DonneeWithRelations[]
  count: number
}> => {

  const { searchParams, searchCriteria, orderBy: orderByField, sortOrder } = options;

  let orderBy: Prisma.Enumerable<Prisma.DonneeOrderByWithRelationInput>;
  switch (orderByField) {
    case "id":
    case "nombre":
      orderBy = {
        [orderByField]: sortOrder
      }
      break;
    case "codeEspece":
      orderBy = {
        espece: {
          code: sortOrder
        }
      }
      break;
    case "nomFrancais":
      orderBy = {
        espece: {
          nomFrancais: sortOrder
        }
      }
      break;
    case "sexe":
      orderBy = {
        sexe: {
          libelle: sortOrder
        }
      }
      break;
    case "age":
      orderBy = {
        age: {
          libelle: sortOrder
        }
      }
      break;
    case "departement":
      orderBy = sortOrder && {
        inventaire: {
          lieuDit: {
            commune: {
              departement: {
                code: sortOrder
              }
            }
          }
        }
      }
      break;
    case "codeCommune":
      orderBy = sortOrder && {
        inventaire: {
          lieuDit: {
            commune: {
              code: sortOrder
            }
          }
        }
      }
      break;
    case "nomCommune":
      orderBy = sortOrder && {
        inventaire: {
          lieuDit: {
            commune: {
              nom: sortOrder
            }
          }
        }
      }
      break;
    case "lieuDit":
      orderBy = sortOrder && {
        inventaire: {
          lieuDit: {
            nom: sortOrder
          }
        }
      }
      break;
    case "date":
    case "heure":
    case "duree":
      orderBy = sortOrder && {
        inventaire: {
          [orderByField]: sortOrder
        }
      }
      break;
    case "observateur": {
      orderBy = sortOrder && {
        inventaire: {
          observateur: {
            libelle: sortOrder
          }
        }
      }
    }
      break;
    default:
      orderBy = {
        id: SortOrder.Desc
      }
  }

  const donnees = await prisma.donnee.findMany({
    ...getPrismaPagination(searchParams),
    include: COMMON_DONNEE_INCLUDE,
    orderBy,
    where: buildSearchDonneeCriteria(searchCriteria)

  }).then((donnees) => {
    return donnees.map(normalizeDonnee);
  });

  const count = await prisma.donnee.count({
    where: buildSearchDonneeCriteria(searchCriteria)
  });

  return {
    result: donnees,
    count
  }

};

export const findDonneeNavigationData = async (
  donneeId: number
): Promise<DonneeNavigationData> => {
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
      id: 'desc'
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
      id: 'asc'
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
  }
};

export const persistDonnee = async (
  donneeToSave: DonneeObj
): Promise<SqlSaveResponse> => {
  if (donneeToSave.id) {
    // It is an update: we delete the current comportements
    // and milieux to insert later the updated ones
    await Promise.all([
      queryToDeleteAnEntityByAttribute(
        TABLE_DONNEE_COMPORTEMENT,
        DONNEE_ID,
        donneeToSave.id
      ),
      queryToDeleteAnEntityByAttribute(
        TABLE_DONNEE_MILIEU,
        DONNEE_ID,
        donneeToSave.id
      )
    ]);
  }

  const saveDonneeResponse: SqlSaveResponse = await persistEntity(
    TABLE_DONNEE,
    {
      ...donneeToSave,
      dateCreation: format(new Date(), DATE_WITH_TIME_PATTERN)
    },
    DB_SAVE_MAPPING_DONNEE
  );

  // If it is an update we take the existing ID else we take the inserted ID
  const savedDonneeId: number = donneeToSave.id
    ? donneeToSave.id
    : saveDonneeResponse.insertId;

  // Save the comportements
  if (donneeToSave.comportementsIds.length) {
    await queryToSaveListOfEntities(
      TABLE_DONNEE_COMPORTEMENT,
      [[savedDonneeId, donneeToSave.comportementsIds]]
    );
  }

  // Save the milieux
  if (donneeToSave.milieuxIds.length) {
    await queryToSaveListOfEntities(
      TABLE_DONNEE_MILIEU,
      [[savedDonneeId, donneeToSave.milieuxIds]]
    );
  }

  return {
    affectedRows: saveDonneeResponse.affectedRows,
    insertId: savedDonneeId,
    warningStatus: saveDonneeResponse.warningStatus
  };
};

export const updateInventaireIdForDonnees = async (
  oldInventaireId: number,
  newInventaireId: number
): Promise<SqlSaveResponse> => {
  return await queryToUpdateDonneesInventaireId(
    oldInventaireId,
    newInventaireId
  );
};

export const insertDonnees = async (
  donnees: DonneeCompleteWithIds[]
): Promise<{ id: number }[]> => {
  const donneesForTableInsertion = donnees.map((donnee) => {
    const { comportements_ids, milieux_ids, ...otherDonnee } = donnee
    return {
      ...otherDonnee,
      date_creation: format(new Date(), DATE_WITH_TIME_PATTERN)
    }
  })

  // Insert all donnees, and retrieve their insertion id, to be able to map with comportements + milieux
  const insertedIds = await insertMultipleEntitiesAndReturnIdsNoCheck(TABLE_DONNEE, donneesForTableInsertion);

  const comportementsMapping = donnees.map<[number, number[]]>((donnee, index) => {
    return donnee.comportements_ids.size ? [insertedIds[index].id, [...donnee.comportements_ids]] : null;
  }).filter(mapping => mapping);

  const milieuxMapping = donnees.map<[number, number[]]>((donnee, index) => {
    return donnee.milieux_ids.size ? [insertedIds[index].id, [...donnee.milieux_ids]] : null;
  }).filter(mapping => mapping);

  if (comportementsMapping.length) {
    await queryToSaveListOfEntities(
      TABLE_DONNEE_COMPORTEMENT,
      comportementsMapping
    );
  }

  if (milieuxMapping.length) {
    await queryToSaveListOfEntities(
      TABLE_DONNEE_MILIEU,
      milieuxMapping
    );
  }

  return insertedIds;
};


export const findExistingDonneeId = async (donnee: DonneeObj): Promise<number> => {
  const response = await queryToFindDonneeIdsByAllAttributes(donnee);

  const eligibleDonneeIds = getArrayFromObjects<{ id: number }, number>(
    response,
    ID
  );

  for (const id of eligibleDonneeIds) {
    // Compare the comportements and the milieux
    const [comportements, milieux] = await Promise.all([
      queryToFindComportementsIdsByDonneeId(id),
      queryToFindMilieuxIdsByDonneeId(id)
    ]);

    const comportementsIds = getArrayFromObjects(
      comportements,
      "comportementId"
    );
    const milieuxIds = getArrayFromObjects(milieux, "milieuId");

    if (
      id !== donnee.id &&
      areArraysContainingSameValues(
        comportementsIds,
        donnee.comportementsIds
      ) &&
      areArraysContainingSameValues(milieuxIds, donnee.milieuxIds)
    ) {
      return id;
    }
  }

  return null;
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
      ...(donnee.comportementsIds != null ? {
        donnee_comportement: {
          every: {
            comportement_id: {
              in: donnee.comportementsIds
            }
          },
        }
      } : {}),
      ...(donnee.milieuxIds != null ? {
        donnee_milieu: {
          every: {
            milieu_id: {
              in: donnee.milieuxIds
            }
          },
        }
      } : {})
    },
    include: {
      donnee_comportement: true,
      donnee_milieu: true
    }
  });

  // At this point the candidates are the ones that match all parameters and for which each comportement+milieu is in the required list
  // However, we did not check yet that this candidates have exactly the requested comportements/milieux as they can have additional ones


  return donneesCandidates?.filter((donneeEntity) => {
    const matcherComportementsLength = donnee?.comportementsIds?.length ?? 0;
    const matcherMilieuxLength = donnee?.milieuxIds?.length ?? 0;

    const areComportementsSameLength = (donneeEntity.donnee_comportement?.length === matcherComportementsLength);
    const areMilieuxSameLength = (donneeEntity.donnee_milieu?.length === matcherMilieuxLength);

    return areComportementsSameLength && areMilieuxSameLength;
  })?.[0] ?? null;
}

export const findLastDonneeId = async (): Promise<number> => {
  return prisma.donnee.findFirst({
    orderBy: {
      id: Prisma.SortOrder.desc
    }
  }).then(donnee => donnee.id).catch(() => Promise.resolve(null as number));
};

export const upsertDonnee = async (
  args: MutationUpsertDonneeArgs
): Promise<DonneeWithRelations> => {
  const { id, data } = args;

  // Check if an exact same donnee already exists or not
  const existingDonnee = await findExistingDonnee(data);

  if (existingDonnee && existingDonnee.id !== id) {
    // The donnee already exists so we return an error
    return Promise.reject(`Cette donnée existe déjà (ID = ${existingDonnee.id}).`)
  } else {
    const { comportementsIds, milieuxIds, ...restData } = data;

    const comportementMap = comportementsIds?.map((comportementId) => {
      return {
        comportement_id: comportementId
      }
    }) ?? [];

    const milieuMap = milieuxIds?.map((milieuId) => {
      return {
        milieu_id: milieuId
      }
    }) ?? [];

    if (id) {

      return prisma.donnee.update({
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
      }).then(normalizeDonnee);

    } else {
      return prisma.donnee.create({
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
      }).then(normalizeDonnee);
    }
  }
};

export const deleteDonnee = async (donneeId: number): Promise<DonneeEntity> => {
  // First get the corresponding inventaire_id
  const inventaire = await prisma.donnee.findUnique({
    where: {
      id: donneeId
    }
  }).inventaire();

  // Delete the actual donnee
  const deletedDonnee = await prisma.donnee.delete({
    where: {
      id: donneeId
    }
  })

  // Check how many donnees the inventaire has after the deletion
  const nbDonneesOfInventaire = await prisma.donnee.count({
    where: {
      inventaireId: inventaire?.id
    }
  })

  if (nbDonneesOfInventaire === 0) {
    // If the inventaire has no more donnees then we remove the inventaire
    await prisma.inventaire.delete({
      where: {
        id: inventaire?.id
      }
    })
  }
  return deletedDonnee;
};

export const findAllDonneesWithIds = async (): Promise<DonneeCompleteWithIds[]> => {
  return queryToGetAllDonneesWithIds();
}

export const findNextRegroupement = async (): Promise<number> => {
  const regroupementsAggr = await prisma.donnee.aggregate({
    _max: {
      regroupement: true
    }
  });
  const regroupementMax = regroupementsAggr?._max?.regroupement ?? 0;
  return regroupementMax + 1;
};

export const countSpecimensByAgeForEspeceId = async (
  especeId: number
): Promise<AgeWithSpecimensCount[]> => {
  const agesOfEspece = await prisma.donnee.groupBy({
    by: ['ageId'],
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
        in: agesOfEspece.map(ageOfEspece => ageOfEspece.ageId)
      }
    }
  })

  return ages.map((age) => {
    const nbSpecimens = agesOfEspece?.find(ageOfEspece => ageOfEspece?.ageId === age.id)?._sum?.nombre ?? 0
    return {
      ...age,
      nbSpecimens
    }
  })
};

export const countSpecimensBySexeForEspeceId = async (
  especeId: number
): Promise<SexeWithSpecimensCount[]> => {
  const sexesOfEspece = await prisma.donnee.groupBy({
    by: ['sexeId'],
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
        in: sexesOfEspece.map(sexeOfEspece => sexeOfEspece.sexeId)
      }
    }
  })

  return sexes.map((sexe) => {
    const nbSpecimens = sexesOfEspece?.find(sexeOfEspece => sexeOfEspece?.sexeId === sexe.id)?._sum?.nombre ?? 0
    return {
      ...sexe,
      nbSpecimens
    }
  })
};
