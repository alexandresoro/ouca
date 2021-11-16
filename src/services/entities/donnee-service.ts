import { Age, Classe, Commune, Comportement, Departement, Donnee as DonneeEntity, Espece, EstimationDistance, EstimationNombre, Inventaire as InventaireEntity, Lieudit, Meteo, Milieu, Observateur, Prisma, Sexe } from "@prisma/client";
import { format, parse } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { getCoordinates } from "../../model/coordinates-system/coordinates-helper";
import { CoordinatesSystemType } from "../../model/coordinates-system/coordinates-system.object";
import { DonneeNavigationData, QueryPaginatedSearchDonneesArgs, SearchDonneeCriteria, SortOrder } from "../../model/graphql";
import { DonneeWithNavigationData } from "../../model/types/donnee-with-navigation-data.object";
import { Donnee as DonneeObj } from "../../model/types/donnee.object";
import { DonneesFilter } from "../../model/types/donnees-filter.object";
import { FlatDonnee } from "../../model/types/flat-donnee.object";
import { Inventaire } from "../../model/types/inventaire.object";
import { NicheurCode, NICHEUR_VALUES } from "../../model/types/nicheur.model";
import { DonneeCompleteWithIds } from "../../objects/db/donnee-db.type";
import { FlatDonneeWithMinimalData } from "../../objects/flat-donnee-with-minimal-data.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import prisma from "../../sql/prisma";
import { queryToFindAllComportementsByDonneeId, queryToFindComportementsIdsByDonneeId } from "../../sql/sql-queries-comportement";
import { queryToCountDonneesByInventaireId, queryToCountSpecimensByAgeForAnEspeceId, queryToCountSpecimensBySexeForAnEspeceId, queryToFindAllDonnees, queryToFindDonneeById, queryToFindDonneeIdsByAllAttributes, queryToFindDonneeIndexById, queryToFindDonneesByCriterion, queryToFindNextDonneeIdByCurrentDonneeId, queryToFindPreviousDonneeIdByCurrentDonneeId, queryToGetAllDonneesWithIds, queryToUpdateDonneesInventaireId } from "../../sql/sql-queries-donnee";
import { queryToFindAllMeteosByDonneeId } from "../../sql/sql-queries-meteo";
import { queryToFindAllMilieuxByDonneeId, queryToFindMilieuxIdsByDonneeId } from "../../sql/sql-queries-milieu";
import { queryToFindAllAssociesByDonneeId } from "../../sql/sql-queries-observateur";
import { createKeyValueMapWithSameName, queryToDeleteAnEntityByAttribute, queryToSaveListOfEntities } from "../../sql/sql-queries-utils";
import { DATE_PATTERN, DATE_WITH_TIME_PATTERN, DONNEE_ID, ID, SEPARATOR_COMMA, TABLE_DONNEE, TABLE_DONNEE_COMPORTEMENT, TABLE_DONNEE_MILIEU } from "../../utils/constants";
import { mapComportementsIds, mapMilieuxIds } from "../../utils/mapping-utils";
import { areArraysContainingSameValues, getArrayFromObjects } from "../../utils/utils";
import { getPrismaPagination } from "./entities-utils";
import { deleteEntityById, insertMultipleEntitiesAndReturnIdsNoCheck, persistEntity } from "./entity-service";
import { deleteInventaireById, findAssociesIdsByInventaireId, findMeteosIdsByInventaireId } from "./inventaire-service";

export type DonneeWithRelations = DonneeEntity & {
  age: Age | null
  sexe: Sexe | null
  comportements: Comportement[]
  milieux: Milieu[]
};

export type FullDonnee = DonneeWithRelations & {
  inventaire: InventaireEntity & {
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

export const buildSearchDonneeCriteria = (searchCriteria: SearchDonneeCriteria): Prisma.DonneeWhereInput | undefined => {
  return (searchCriteria && Object.keys(searchCriteria).length) ? {
    id: searchCriteria?.id ?? undefined,
    inventaire: {
      observateur_id: {
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
      lieudit_id: {
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
    espece_id: {
      in: searchCriteria?.especes ?? undefined
    },
    espece: {
      classeId: {
        in: searchCriteria?.classes ?? undefined
      }
    },
    nombre: searchCriteria?.nombre ?? undefined,
    estimation_nombre_id: {
      in: searchCriteria?.estimationsNombre ?? undefined
    },
    sexe_id: {
      in: searchCriteria?.sexes ?? undefined
    },
    age_id: {
      in: searchCriteria?.ages ?? undefined
    },
    distance: searchCriteria?.distance ?? undefined,
    estimation_distance_id: {
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

const normalizeDonnee = <T extends {
  donnee_comportement: {
    comportement: Comportement
  }[]
  donnee_milieu: {
    milieu: Milieu
  }[]
}>(donnee: T): Omit<T, 'donnee_comportement' | 'donnee_milieu'> & {
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

const normalizeInventaire = <T extends {
  inventaire_associe: {
    observateur: Observateur
  }[]
  inventaire_meteo: {
    meteo: Meteo
  }[]
}>(inventaire: T): Omit<T, 'inventaire_associe' | 'inventaire_meteo'> & {
  associes: Observateur[]
  meteos: Meteo[]
} => {
  if (inventaire == null) {
    return null;
  }
  const { inventaire_associe, inventaire_meteo, ...restInventaire } = inventaire;
  const associesArray = inventaire_associe.map((inventaire_associe) => {
    return inventaire_associe?.observateur;
  });
  const meteosArray = inventaire_meteo.map((inventaire_meteo) => {
    return inventaire_meteo?.meteo;
  });

  return {
    ...restInventaire,
    associes: associesArray,
    meteos: meteosArray
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

const findComportementsIdsByDonneeId = async (
  donneeId: number
): Promise<number[]> => {
  const comportementsDb = await queryToFindComportementsIdsByDonneeId(donneeId);
  return mapComportementsIds(comportementsDb);
};

const findMilieuxIdsByDonneeId = async (
  donneeId: number
): Promise<number[]> => {
  const milieuxDb = await queryToFindMilieuxIdsByDonneeId(donneeId);
  return mapMilieuxIds(milieuxDb);
};

const countDonneesByInventaireId = async (
  inventaireId: number
): Promise<number> => {
  const numbers = await queryToCountDonneesByInventaireId(inventaireId);
  return numbers && numbers[0]?.nbDonnees ? numbers[0].nbDonnees : 0;
};

export const buildDonneeFromFlatDonneeWithMinimalData = async (
  flatDonnee: FlatDonneeWithMinimalData
): Promise<DonneeObj> => {
  if (flatDonnee?.id && flatDonnee?.inventaireId) {
    const [
      associesIds,
      meteosIds,
      comportementsIds,
      milieuxIds,
      nbDonnees
    ] = await Promise.all([
      findAssociesIdsByInventaireId(flatDonnee.inventaireId),
      findMeteosIdsByInventaireId(flatDonnee.inventaireId),
      findComportementsIdsByDonneeId(flatDonnee.id),
      findMilieuxIdsByDonneeId(flatDonnee.id),
      countDonneesByInventaireId(flatDonnee.inventaireId)
    ]);

    const inventaire: Inventaire = {
      id: flatDonnee.inventaireId,
      observateurId: flatDonnee.observateurId,
      associesIds,
      date: flatDonnee.date,
      heure: flatDonnee.heure,
      duree: flatDonnee.duree,
      lieuditId: flatDonnee.lieuditId,
      customizedAltitude: flatDonnee.altitude,
      coordinates: !(flatDonnee.longitude == null)
        ? {
          longitude: flatDonnee.longitude,
          latitude: flatDonnee.latitude,
          system: flatDonnee.coordinatesSystem
        }
        : null,
      temperature: flatDonnee.temperature,
      meteosIds,
      nbDonnees
    };

    const donnee: DonneeObj = {
      id: flatDonnee.id,
      inventaireId: flatDonnee.inventaireId,
      inventaire,
      especeId: flatDonnee.especeId,
      sexeId: flatDonnee.sexeId,
      ageId: flatDonnee.ageId,
      estimationNombreId: flatDonnee.estimationNombreId,
      nombre: flatDonnee.nombre,
      estimationDistanceId: flatDonnee.estimationDistanceId,
      distance: flatDonnee.distance,
      regroupement: flatDonnee.regroupement,
      comportementsIds,
      milieuxIds,
      commentaire: flatDonnee.commentaire
    };
    return donnee;
  } else {
    return null;
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

export const findLastDonneeId = async (): Promise<number> => {
  return prisma.donnee.findFirst({
    orderBy: {
      id: Prisma.SortOrder.desc
    }
  }).then(donnee => donnee.id).catch(() => Promise.resolve(null as number));
};

const updateCoordinates = (
  donnee: FlatDonnee,
  coordinatesSystemType: CoordinatesSystemType
): void => {
  const coordinates = getCoordinates(
    {
      coordinates: {
        longitude: (donnee.customizedLongitude == null)
          ? donnee.longitude
          : donnee.customizedLongitude,
        latitude: (donnee.customizedLatitude == null)
          ? donnee.latitude
          : donnee.customizedLatitude,
        system: (donnee.customizedCoordinatesSystem == null)
          ? donnee.coordinatesSystem
          : donnee.customizedCoordinatesSystem
      }
    },
    coordinatesSystemType
  );

  donnee.altitude = (donnee.customizedAltitude == null)
    ? donnee.altitude
    : donnee.customizedAltitude;
  donnee.customizedAltitude = null;

  donnee.longitude = coordinates.areInvalid ? null : coordinates.longitude;
  donnee.customizedLongitude = null;

  donnee.latitude = coordinates.areInvalid ? null : coordinates.latitude;
  donnee.customizedLatitude = null;

  donnee.coordinatesSystem = coordinates.system;
  donnee.customizedCoordinatesSystem = null;
};

const groupByDonneeId = <T extends { donneeId: number }>(table: T[]): Record<number, T[]> => {
  return table.reduce<Record<number, T[]>>(
    (acc, value) => {
      const donneeId = value.donneeId;
      (acc[donneeId] || (acc[donneeId] = [])).push(value);
      return acc;
    },
    {});
}

export const findDonneesByCustomizedFilters = async (
  filter: DonneesFilter
): Promise<FlatDonnee[]> => {
  const donnees: FlatDonnee[] = await queryToFindDonneesByCriterion(filter);

  const donneesIds: number[] = donnees.map((donnee) => {
    return donnee.id;
  });

  const [associes, meteos, comportements, milieux] = donneesIds.length
    ? await Promise.all([
      queryToFindAllAssociesByDonneeId(donneesIds),
      queryToFindAllMeteosByDonneeId(donneesIds),
      queryToFindAllComportementsByDonneeId(donneesIds),
      queryToFindAllMilieuxByDonneeId(donneesIds)
    ])
    : [[], [], [], []];

  const associesByDonnee = groupByDonneeId(associes);
  const meteosByDonnee = groupByDonneeId(meteos);
  const comportementsByDonnee = groupByDonneeId(comportements);
  const milieuxByDonnee = groupByDonneeId(milieux);

  donnees.forEach((donnee: FlatDonnee) => {
    // Transform the coordinates into the expected system
    updateCoordinates(donnee, filter.coordinatesSystemType);

    donnee.associes = associesByDonnee[donnee.id]?.map(
      (associe) => associe.libelle
    ).join(SEPARATOR_COMMA) ?? "";

    donnee.meteos = meteosByDonnee[donnee.id]?.map(
      (meteo) => meteo.libelle
    ).join(SEPARATOR_COMMA) ?? "";

    donnee.comportements = comportementsByDonnee[donnee.id]?.map(
      (comportement) => {
        return {
          code: comportement.code,
          libelle: comportement.libelle
        };
      }
    ) ?? [];

    donnee.milieux = milieuxByDonnee[donnee.id]?.map((milieu) => {
      return {
        code: milieu.code,
        libelle: milieu.libelle
      };
    }) ?? [];

    // Compute nicheur status for the Donnée (i.e. highest nicheur status of the comportements)
    // First we keep only the comportements having a nicheur status
    const nicheurStatuses: NicheurCode[] = comportementsByDonnee[donnee.id]?.filter(
      (comportement) => {
        return !!comportement.nicheur;
      }
    ).map(
      (comportement) => {
        return comportement.nicheur;
      }
    ) ?? [];

    // Then we keep the highest nicheur status
    const nicheurStatusCode = nicheurStatuses?.length && nicheurStatuses.reduce(
      (nicheurStatusOne, nicheurStatusTwo) => {
        return NICHEUR_VALUES[nicheurStatusOne].weight >= NICHEUR_VALUES[nicheurStatusTwo].weight ? nicheurStatusOne : nicheurStatusTwo
      }
    );

    donnee.nicheur = nicheurStatusCode
      ? NICHEUR_VALUES[nicheurStatusCode].name
      : null;
  });

  return donnees;
};

export const deleteDonneeById = async (
  donneeId: number,
  inventaireId: number
): Promise<SqlSaveResponse> => {
  if (donneeId) {
    // First delete the donnee
    const sqlResponse: SqlSaveResponse = await deleteEntityById(
      TABLE_DONNEE,
      donneeId
    );

    // Check how many donnees the inventaire has after the deletion
    const nbDonnees = await countDonneesByInventaireId(inventaireId);

    if (nbDonnees === 0) {
      // If the inventaire has no more donnees then we remove the inventaire
      await deleteInventaireById(inventaireId);
    }

    return sqlResponse;
  }
};

const findNextDonneeIdByCurrentDonneeId = async (
  currentDonneeId: number
): Promise<number> => {
  const ids = await queryToFindNextDonneeIdByCurrentDonneeId(currentDonneeId);
  return ids && ids[0]?.id ? ids[0].id : null;
};

const findPreviousDonneeIdByCurrentDonneeId = async (
  currentDonneeId: number
): Promise<number> => {
  const ids = await queryToFindPreviousDonneeIdByCurrentDonneeId(
    currentDonneeId
  );
  return ids && ids[0]?.id ? ids[0].id : null;
};

const findDonneeIndexById = async (id: number): Promise<number> => {
  const ids = await queryToFindDonneeIndexById(id);

  return ids && ids[0]?.nbDonnees ? ids[0].nbDonnees : null;
};

const findDonneeById = async (id: number): Promise<DonneeObj> => {
  const flatDonnees = await queryToFindDonneeById(id);
  if (!flatDonnees || !flatDonnees[0]?.id) {
    return null;
  }
  return await buildDonneeFromFlatDonneeWithMinimalData(flatDonnees[0]);
};

export const findAllFlatDonneesWithMinimalData = async (): Promise<
  FlatDonneeWithMinimalData[]
> => {
  return await queryToFindAllDonnees();
};

export const findAllDonneesWithIds = async (): Promise<DonneeCompleteWithIds[]> => {
  return queryToGetAllDonneesWithIds();
}

export const findDonneeByIdWithContext = async (
  donneeId: number
): Promise<DonneeWithNavigationData> => {
  const [
    donnee,
    previousDonneeId,
    nextDonneeId,
    donneeIndex
  ] = await Promise.all([
    findDonneeById(donneeId),
    findPreviousDonneeIdByCurrentDonneeId(donneeId),
    findNextDonneeIdByCurrentDonneeId(donneeId),
    findDonneeIndexById(donneeId)
  ]);

  return {
    ...donnee,
    previousDonneeId: previousDonneeId,
    nextDonneeId: nextDonneeId,
    indexDonnee: donneeIndex
  };
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

export const countSpecimensByAgeForEspeceId = async (
  id: number
): Promise<{ name: string; value: number }[]> => {
  return await queryToCountSpecimensByAgeForAnEspeceId(id);
};

export const countSpecimensBySexeForEspeceId = async (
  id: number
): Promise<{ name: string; value: number }[]> => {
  return await queryToCountSpecimensBySexeForAnEspeceId(id);
};
