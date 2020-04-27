import { format } from "date-fns";
import * as _ from "lodash";
import {
  areSameCoordinates,
  getCoordinates
} from "ouca-common/coordinates-system";
import { Coordinates } from "ouca-common/coordinates.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { buildInventaireFromInventaireDb } from "../mapping/inventaire-mapping";
import { InventaireDb } from "../objects/db/inventaire-db.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  queryToFindCoordinatesByInventaireId,
  queryToFindInventaireIdByAllAttributes,
  queryToFindInventaireIdById
} from "../sql/sql-queries-inventaire";
import { queryToFindMetosByInventaireId } from "../sql/sql-queries-meteo";
import { queryToFindAssociesByInventaireId } from "../sql/sql-queries-observateur";
import {
  DB_SAVE_MAPPING,
  queriesToSaveListOfEntities,
  queryToDeleteAnEntityByAttribute,
  queryToFindOneById
} from "../sql/sql-queries-utils";
import {
  DATE_PATTERN,
  DATE_WITH_TIME_PATTERN,
  INVENTAIRE_ID,
  TABLE_INVENTAIRE,
  TABLE_INVENTAIRE_ASSOCIE,
  TABLE_INVENTAIRE_METEO
} from "../utils/constants";
import { interpretDateTimestampAsLocalTimeZoneDate } from "../utils/date";
import { mapAssociesIds, mapMeteosIds } from "../utils/mapping-utils";
import { areArraysContainingSameValues } from "../utils/utils";
import { deleteEntityById, persistEntity } from "./sql-api-common";

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
    await queriesToSaveListOfEntities(
      TABLE_INVENTAIRE_METEO,
      inventaireId,
      meteosIds
    );
  }
};

const saveInventaireAssocies = async (
  inventaireId: number,
  associesIds: number[]
): Promise<void> => {
  if (associesIds.length > 0 && inventaireId) {
    await queriesToSaveListOfEntities(
      TABLE_INVENTAIRE_ASSOCIE,
      inventaireId,
      associesIds
    );
  }
};

const findCoordinatesByInventaireId = async (
  id: number
): Promise<Coordinates> => {
  const coordinatesDb = await queryToFindCoordinatesByInventaireId(id);
  return coordinatesDb &&
    coordinatesDb[0] &&
    !_.isNil(coordinatesDb[0].longitude)
    ? {
        ...coordinatesDb[0],
        isTransformed: false
      }
    : null;
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
  const meteosDb = await queryToFindMetosByInventaireId(inventaireId);
  return mapMeteosIds(meteosDb);
};

export const findExistingInventaireId = async (
  inventaire: Inventaire
): Promise<number> => {
  const inventaireIds = await queryToFindInventaireIdByAllAttributes(
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
  const [inventairesDb, associesIds, meteosIds] = await Promise.all([
    queryToFindOneById<InventaireDb>(TABLE_INVENTAIRE, inventaireId),
    findAssociesIdsByInventaireId(inventaireId),
    findMeteosIdsByInventaireId(inventaireId)
  ]);

  if (!inventairesDb && !inventairesDb[0]?.id) {
    return null;
  }

  return buildInventaireFromInventaireDb(
    inventairesDb[0],
    associesIds,
    meteosIds
  );
};

const getCoordinatesToPersist = async (
  inventaire: Inventaire
): Promise<Coordinates> => {
  const newCoordinates = inventaire.coordinates;

  let coordinatesToPersist = newCoordinates;

  if (inventaire.id) {
    // We check if the coordinates of the lieudit are the same as the one stored in database
    const oldInventaire = await findInventaireById(inventaire.id);

    if (oldInventaire?.coordinates) {
      const oldCoordinates = getCoordinates(
        oldInventaire,
        newCoordinates.system
      );

      if (
        newCoordinates.longitude === oldCoordinates.longitude &&
        newCoordinates.latitude === oldCoordinates.latitude
      ) {
        coordinatesToPersist = oldInventaire.coordinates;
      }
    }
  }

  return coordinatesToPersist;
};

export const persistInventaire = async (
  inventaire: Inventaire
): Promise<SqlSaveResponse> => {
  const { date, customizedAltitude, ...otherInventaireAttributes } = inventaire;

  // Delete the current associes and meteos to insert later the updated ones
  await deleteAssociesAndMeteosByInventaireId(inventaire.id);

  // Get the customized coordinates if any
  // By default we consider that coordinates are not customized
  let altitude: number = null;
  let longitude: number = null;
  let latitude: number = null;
  let coordinatesSystem = null;

  // Then we check if coordinates were customized
  if (inventaire.coordinates) {
    altitude = customizedAltitude;
    const coordinates = await getCoordinatesToPersist(inventaire);
    longitude = coordinates.longitude;
    latitude = coordinates.latitude;
    coordinatesSystem = coordinates.system;
  }

  // Save the inventaire
  const inventaireResult = await persistEntity(
    TABLE_INVENTAIRE,
    {
      date: format(
        interpretDateTimestampAsLocalTimeZoneDate(date),
        DATE_PATTERN
      ),
      dateCreation: format(new Date(), DATE_WITH_TIME_PATTERN),
      altitude,
      longitude,
      latitude,
      coordinatesSystem,
      ...otherInventaireAttributes
    },
    DB_SAVE_MAPPING.inventaire
  );

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
