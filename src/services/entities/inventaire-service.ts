import { CoordinatesSystem, Inventaire as InventaireEntity, Meteo, Observateur } from "@prisma/client";
import { format, parse } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { areSameCoordinates } from "../../model/coordinates-system/coordinates-helper";
import { CoordinatesSystemType, InputInventaire, MutationUpsertInventaireArgs, UpsertInventaireFailureReason } from "../../model/graphql";
import { Coordinates } from "../../model/types/coordinates.object";
import { Inventaire } from "../../model/types/inventaire.object";
import { InventaireCompleteWithIds, InventaireDb } from "../../objects/db/inventaire-db.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { buildInventaireDbFromInventaire, buildInventaireFromInventaireDb } from "../../sql/entities-mapping/inventaire-mapping";
import prisma from "../../sql/prisma";
import { queryToFindCoordinatesByInventaireId, queryToFindInventaireIdById, queryToFindInventairesIdsByAllAttributes, queryToGetAllInventairesWithIds } from "../../sql/sql-queries-inventaire";
import { queryToFindMeteosByInventaireId } from "../../sql/sql-queries-meteo";
import { queryToFindAssociesByInventaireId } from "../../sql/sql-queries-observateur";
import { queryToDeleteAnEntityByAttribute, queryToFindOneById, queryToSaveListOfEntities } from "../../sql/sql-queries-utils";
import { DATE_PATTERN, DATE_WITH_TIME_PATTERN, INVENTAIRE_ID, TABLE_INVENTAIRE, TABLE_INVENTAIRE_ASSOCIE, TABLE_INVENTAIRE_METEO } from "../../utils/constants";
import { mapAssociesIds, mapMeteosIds } from "../../utils/mapping-utils";
import { areArraysContainingSameValues } from "../../utils/utils";
import { deleteEntityById, insertMultipleEntitiesAndReturnIdsNoCheck, persistEntityNoCheck } from "./entity-service";

export type InventaireWithRelations = Omit<InventaireEntity, 'date' | 'latitude' | 'longitude' | 'altitude' | 'coordinates_system'> & {
  observateur: Observateur
  customizedCoordinates?: {
    altitude: number,
    latitude: number,
    longitude: number,
    system: CoordinatesSystem
  }
  date: string // Formatted as yyyy-MM-dd
  associes: Observateur[]
  meteos: Meteo[]
};

const COMMON_INVENTAIRE_INCLUDE = {
  observateur: true,
  inventaire_associe: {
    select: {
      observateur: true
    }
  },
  inventaire_meteo: {
    select: {
      meteo: true
    }
  }
}

type InventaireRelatedTablesFields = {
  inventaire_associe: {
    observateur: Observateur
  }[]
  inventaire_meteo: {
    meteo: Meteo
  }[]
}

type InventaireResolvedFields = {
  observateur: Observateur
}

export const normalizeInventaire = <
  T extends InventaireRelatedTablesFields
>(inventaire: T): Omit<T, 'inventaire_associe' | 'inventaire_meteo'> & {
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

const normalizeInventaireComplete = <
  T extends InventaireEntity & InventaireRelatedTablesFields & InventaireResolvedFields
>(inventaire: T): InventaireWithRelations => {

  if (inventaire == null) {
    return null;
  }

  const { altitude, latitude, longitude, coordinates_system, date, ...restInventaire } = inventaire;

  const customizedCoordinates = (coordinates_system != null && altitude != null && latitude != null && longitude != null)
    ? {
      customizedCoordinates: {
        altitude,
        latitude: latitude.toNumber(),
        longitude: longitude.toNumber(),
        system: coordinates_system
      }
    }
    : {};

  const inventaireWithoutAssociesMeteos = normalizeInventaire(restInventaire);

  return {
    ...inventaireWithoutAssociesMeteos,
    ...customizedCoordinates,
    date: format(date, DATE_PATTERN),
  }
}

export const findInventaire = async (
  id: number
): Promise<InventaireWithRelations> => {
  return prisma.inventaire.findUnique({
    include: COMMON_INVENTAIRE_INCLUDE,
    where: {
      id
    }
  }).then(normalizeInventaireComplete);
};

export const findInventaireOfDonneeId = async (donneeId: number): Promise<InventaireEntity | null> => {
  return prisma.donnee.findUnique({
    where: {
      id: donneeId
    },
  }).inventaire();
};


const deleteAssociesAndMeteosByInventaireId = async (
  inventaireId: number
): Promise<void> => {
  if (inventaireId) {
    await Promise.all([
      queryToDeleteAnEntityByAttribute(
        TABLE_INVENTAIRE_ASSOCIE,
        INVENTAIRE_ID,
        inventaireId
      ),
      queryToDeleteAnEntityByAttribute(
        TABLE_INVENTAIRE_METEO,
        INVENTAIRE_ID,
        inventaireId
      )
    ]);
  }
};

const saveInventaireMeteos = async (
  inventaireId: number,
  meteosIds: number[]
): Promise<void> => {
  if (meteosIds.length > 0 && inventaireId) {
    await queryToSaveListOfEntities(
      TABLE_INVENTAIRE_METEO,
      [[inventaireId, meteosIds]]
    );
  }
};

const saveInventaireAssocies = async (
  inventaireId: number,
  associesIds: number[]
): Promise<void> => {
  if (associesIds.length > 0 && inventaireId) {
    await queryToSaveListOfEntities(
      TABLE_INVENTAIRE_ASSOCIE,
      [[inventaireId, associesIds]]
    );
  }
};

const findCoordinatesByInventaireId = async (
  id: number
): Promise<Coordinates> => {
  const coordinatesDb = await queryToFindCoordinatesByInventaireId(id);
  return coordinatesDb.longitude != null ? coordinatesDb : null;
};

export const findAssociesIdsByInventaireId = async (
  inventaireId: number
): Promise<number[]> => {
  const associesDb = await queryToFindAssociesByInventaireId(inventaireId);
  return mapAssociesIds(associesDb);
};

export const findMeteosIdsByInventaireId = async (
  inventaireId: number
): Promise<number[]> => {
  const meteosDb = await queryToFindMeteosByInventaireId(inventaireId);
  return mapMeteosIds(meteosDb);
};

export const findExistingInventaireId = async (
  inventaire: Inventaire
): Promise<number> => {
  const inventaireIds = await queryToFindInventairesIdsByAllAttributes(
    inventaire
  );

  for (const inventaireId of inventaireIds) {
    const id = inventaireId.id;
    // Compare the observateurs associes, the meteos and the coordinates
    const [associesIds, meteosIds, coordinates] = await Promise.all([
      findAssociesIdsByInventaireId(id),
      findMeteosIdsByInventaireId(id),
      findCoordinatesByInventaireId(id)
    ]);

    if (
      id !== inventaire.id &&
      areSameCoordinates(coordinates, inventaire.coordinates) &&
      areArraysContainingSameValues(associesIds, inventaire.associesIds) &&
      areArraysContainingSameValues(meteosIds, inventaire.meteosIds)
    ) {
      return id;
    }
  }

  return null;
};

export const findExistingInventaire = async (
  inventaire: InputInventaire
): Promise<InventaireEntity | null> => {

  const inventaireCandidates = await prisma.inventaire.findMany({
    where: {
      observateurId: inventaire.observateurId,
      date: zonedTimeToUtc(parse(inventaire.date, DATE_PATTERN, new Date()), 'UTC'),
      heure: inventaire.heure ?? null,
      altitude: inventaire.altitude ?? null,
      latitude: inventaire.latitude ?? null,
      longitude: inventaire.longitude ?? null,
      temperature: inventaire.temperature ?? null,
      ...(inventaire.associesIds != null ? {
        inventaire_associe: {
          every: {
            observateur_id: {
              in: inventaire.associesIds
            }
          },
        }
      } : {}),
      ...(inventaire.meteosIds != null ? {
        inventaire_meteo: {
          every: {
            meteo_id: {
              in: inventaire.meteosIds
            }
          },
        }
      } : {})
    },
    include: {
      inventaire_associe: true,
      inventaire_meteo: true
    }
  });

  // At this point the candidates are the ones that match all parameters and for which each associe+meteo is in the required list
  // However, we did not check yet that this candidates have exactly the requested associes/meteos as they can have additional ones

  return inventaireCandidates?.filter((inventaireEntity) => {
    const matcherAssociesLength = inventaire?.associesIds?.length ?? 0;
    const matcherMeteosLength = inventaire?.meteosIds?.length ?? 0;

    const areAssociesSameLength = (inventaireEntity.inventaire_associe?.length === matcherAssociesLength);
    const areMeteosSameLength = (inventaireEntity.inventaire_meteo?.length === matcherMeteosLength);

    return areAssociesSameLength && areMeteosSameLength;
  })?.[0] ?? null;
};

export const deleteInventaireById = async (
  id: number
): Promise<SqlSaveResponse> => {
  return await deleteEntityById(TABLE_INVENTAIRE, id);
};

export const findInventaireIdById = async (id: number): Promise<number> => {
  const ids = await queryToFindInventaireIdById(id);
  return ids && ids[0]?.id ? ids[0].id : null;
};

export const findInventaireById = async (
  inventaireId: number
): Promise<Inventaire> => {
  const [inventaireDb, associesIds, meteosIds] = await Promise.all([
    queryToFindOneById<InventaireDb>(TABLE_INVENTAIRE, inventaireId),
    findAssociesIdsByInventaireId(inventaireId),
    findMeteosIdsByInventaireId(inventaireId)
  ]);

  if (!inventaireDb) {
    return null;
  }

  return buildInventaireFromInventaireDb(
    inventaireDb,
    associesIds,
    meteosIds
  );
};

export const findAllInventairesWithIds = async (): Promise<InventaireCompleteWithIds[]> => {
  return queryToGetAllInventairesWithIds();
}

const getCoordinatesToPersist = async (
  inventaire: Inventaire
): Promise<Coordinates> => {
  const newCoordinates = inventaire.coordinates;

  let coordinatesToPersist = newCoordinates;

  if (inventaire.id) {
    // We check if the coordinates of the lieudit are the same as the one stored in database
    const oldInventaire = await findInventaireById(inventaire.id);

    if (areSameCoordinates(oldInventaire?.coordinates, newCoordinates)) {
      coordinatesToPersist = oldInventaire.coordinates;
    }
  }

  return coordinatesToPersist;
};

export const upsertInventaire = async (
  args: MutationUpsertInventaireArgs
): Promise<InventaireWithRelations> => {
  const { id, data, migrateDonneesIfMatchesExistingInventaire = false } = args;

  // Check if an exact same inventaire already exists or not
  const existingInventaire = await findExistingInventaire(data);

  if (existingInventaire) {
    // The inventaire we wish to upsert has already an existing equivalent
    // So now it depends on what we wished to do initially

    if (id && !migrateDonneesIfMatchesExistingInventaire) {
      // This is the tricky case
      // We had an existing inventaire A that we expected to update
      // Meanwhile we found that the new values correspond to another already inventaire B
      // So we should not update inventaire A but we should provide as feedback that we did not update it
      // because it is already corresponding to B.
      // With this information, it is up to the caller to react accordingly 
      // (e.g. ask all donnees from inventaire B to be moved to A),
      // but this is not up to this upsert method to take this initiave
      const upsertInventaireFailureReason: UpsertInventaireFailureReason = {
        inventaireExpectedToBeUpdated: id,
        correspondingInventaireFound: existingInventaire.id
      }
      return Promise.reject(upsertInventaireFailureReason);
    }

    if (id) {
      // In that case, the user explicitely requested that the donnees of inventaire A 
      // should now be linked to inventaire B if matches

      // We update the inventaire ID for the donnees and we delete the duplicated inventaire
      await prisma.donnee.updateMany({
        where: {
          inventaireId: id
        },
        data: {
          inventaireId: existingInventaire?.id
        }
      });
      await prisma.inventaire.delete({
        where: {
          id
        }
      })
    }


    // We wished to create an inventaire but we already found one,
    // so we won't create anything and simply return the existing one
    return prisma.inventaire.findUnique({
      where: {
        id: existingInventaire.id
      },
      include: COMMON_INVENTAIRE_INCLUDE
    }).then(normalizeInventaireComplete);

  } else {
    // The inventaire we wish to upsert does not have an equivalent existing one
    // In that case, we proceed as a classic upsert

    const { associesIds, meteosIds, date, ...restData } = data;

    const associesMap = associesIds?.map((associeId) => {
      return {
        observateur_id: associeId
      }
    }) ?? [];

    const meteosMap = meteosIds?.map((meteoId) => {
      return {
        meteo_id: meteoId
      }
    }) ?? [];

    if (id) {
      // Update an existing inventaire
      return prisma.inventaire.update({
        where: { id },
        include: COMMON_INVENTAIRE_INCLUDE,
        data: {
          ...restData,
          coordinates_system: (restData?.altitude != null && restData?.latitude != null && restData?.longitude != null) ? CoordinatesSystemType.Gps : null,
          date: zonedTimeToUtc(parse(date, DATE_PATTERN, new Date()), 'UTC'),
          inventaire_associe: {
            deleteMany: {
              inventaire_id: id
            },
            create: associesMap
          },
          inventaire_meteo: {
            deleteMany: {
              inventaire_id: id
            },
            create: meteosMap
          }
        }
      }).then(normalizeInventaireComplete);

    } else {
      // Create a new inventaire
      return prisma.inventaire.create({
        data: {
          ...restData,
          coordinates_system: (restData?.altitude != null && restData?.latitude != null && restData?.longitude != null) ? CoordinatesSystemType.Gps : null,
          date: zonedTimeToUtc(parse(date, DATE_PATTERN, new Date()), 'UTC'),
          date_creation: new Date(),
          inventaire_associe: {
            create: associesMap
          },
          inventaire_meteo: {
            create: meteosMap
          }
        },
        include: COMMON_INVENTAIRE_INCLUDE
      }).then(normalizeInventaireComplete);
    }

  }
};

export const persistInventaire = async (
  inventaire: Inventaire
): Promise<SqlSaveResponse> => {
  const coordinates = inventaire.coordinates
    ? await getCoordinatesToPersist(inventaire)
    : null;
  const inventaireDb = buildInventaireDbFromInventaire(inventaire, coordinates);

  // Delete the current associes and meteos to insert later the updated ones
  await deleteAssociesAndMeteosByInventaireId(inventaire.id);

  // Save the inventaire
  const inventaireResult = await persistEntityNoCheck(TABLE_INVENTAIRE, inventaireDb);

  // Get the inventaire ID
  // If it is an update we take the existing ID else we take the inserted ID
  const inventaireId: number = inventaire.id
    ? inventaire.id
    : inventaireResult.insertId;

  // Save the observateurs associes and the meteos
  await saveInventaireAssocies(inventaireId, inventaire.associesIds);
  await saveInventaireMeteos(inventaireId, inventaire.meteosIds);

  return inventaireResult;
};

export const insertInventaires = async (
  inventaires: InventaireCompleteWithIds[]
): Promise<{ id: number }[]> => {

  const inventairesWithCreationTime = inventaires.map((inventaire) => {
    const { id, meteos_ids, associes_ids, ...inventaireOthers } = inventaire;

    return {
      ...inventaireOthers,
      date_creation: format(new Date(), DATE_WITH_TIME_PATTERN)
    }
  });

  // Insert all donnees, and retrieve their insertion id, to be able to map with meteos and associes
  const insertedIds = await insertMultipleEntitiesAndReturnIdsNoCheck(TABLE_INVENTAIRE, inventairesWithCreationTime);

  const meteosMapping = inventaires.map<[number, number[]]>((inventaire, index) => {
    return inventaire.meteos_ids.size ? [insertedIds[index].id, [...inventaire.meteos_ids]] : null;
  }).filter(mapping => mapping);

  const associesMapping = inventaires.map<[number, number[]]>((inventaire, index) => {
    return inventaire.associes_ids.size ? [insertedIds[index].id, [...inventaire.associes_ids]] : null;
  }).filter(mapping => mapping);

  if (meteosMapping.length) {
    await queryToSaveListOfEntities(
      TABLE_INVENTAIRE_METEO,
      meteosMapping
    );
  }

  if (associesMapping.length) {
    await queryToSaveListOfEntities(
      TABLE_INVENTAIRE_ASSOCIE,
      associesMapping
    );
  }

  return insertedIds;
};