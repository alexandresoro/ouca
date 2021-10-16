import { CoordinatesSystem, Inventaire as InventaireEntity, Meteo, Observateur } from "@prisma/client";
import { format } from "date-fns";
import { areSameCoordinates } from "../../model/coordinates-system/coordinates-helper";
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
import { DATE_WITH_TIME_PATTERN, INVENTAIRE_ID, TABLE_INVENTAIRE, TABLE_INVENTAIRE_ASSOCIE, TABLE_INVENTAIRE_METEO } from "../../utils/constants";
import { mapAssociesIds, mapMeteosIds } from "../../utils/mapping-utils";
import { areArraysContainingSameValues } from "../../utils/utils";
import { deleteEntityById, insertMultipleEntitiesAndReturnIdsNoCheck, persistEntityNoCheck } from "./entity-service";

const DATE_PATTERN = "yyyy-MM-dd";

type InventaireWithRelations = Omit<InventaireEntity, 'date' | 'latitude' | 'longitude' | 'altitude' | 'coordinates_system'> & {
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

export const findInventaire = async (
  id: number
): Promise<InventaireWithRelations> => {
  return prisma.inventaire.findUnique({
    include: {
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
    },
    where: {
      id
    }
  }).then(inventaire => {
    if (inventaire == null) {
      return null;
    }

    const { inventaire_associe, inventaire_meteo, altitude, latitude, longitude, coordinates_system, date, ...restInventaire } = inventaire;

    const associesArray = inventaire_associe.map((inventaire_associe) => {
      return inventaire_associe?.observateur;
    });
    const meteosArray = inventaire_meteo.map((inventaire_meteo) => {
      return inventaire_meteo?.meteo;
    });

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
    return {
      ...restInventaire,
      ...customizedCoordinates,
      date: format(date, DATE_PATTERN),
      associes: associesArray,
      meteos: meteosArray
    }
  });
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