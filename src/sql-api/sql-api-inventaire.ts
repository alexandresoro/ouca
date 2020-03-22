import { format } from "date-fns";
import { getOriginCoordinates } from "ouca-common/coordinates-system";
import { Inventaire } from "ouca-common/inventaire.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  getQueryToFindAssociesIdsByInventaireId,
  getQueryToFindInventaireIdByAllAttributes,
  getQueryToFindInventaireIdById,
  getQueryToFindMeteosIdsByInventaireId
} from "../sql/sql-queries-inventaire";
import { getQueryToFindMetosByInventaireId } from "../sql/sql-queries-meteo";
import { getQueryToFindAssociesByInventaireId } from "../sql/sql-queries-observateur";
import {
  DB_SAVE_MAPPING,
  getDeleteEntityByAttributeQuery,
  getDeleteEntityByIdQuery,
  getQueryToFindOneById,
  getSaveEntityQuery,
  getSaveListOfEntitesQueries
} from "../sql/sql-queries-utils";
import {
  DATE_PATTERN,
  DATE_WITH_TIME_PATTERN,
  ID,
  INVENTAIRE_ID,
  METEO_ID,
  OBSERVATEUR_ID,
  TABLE_INVENTAIRE,
  TABLE_INVENTAIRE_ASSOCIE,
  TABLE_INVENTAIRE_METEO
} from "../utils/constants";
import { interpretDateTimestampAsLocalTimeZoneDate } from "../utils/date";
import {
  mapAssociesIds,
  mapInventaire,
  mapMeteosIds
} from "../utils/mapping-utils";
import {
  areArraysContainingSameValues,
  getArrayFromObjects
} from "../utils/utils";
import { SqlConnection } from "./sql-connection";

const deleteAssociesAndMeteosByInventaireId = async (
  inventaireId: number
): Promise<void> => {
  if (inventaireId) {
    await SqlConnection.query(
      getDeleteEntityByAttributeQuery(
        TABLE_INVENTAIRE_ASSOCIE,
        INVENTAIRE_ID,
        inventaireId
      ) +
        getDeleteEntityByAttributeQuery(
          TABLE_INVENTAIRE_METEO,
          INVENTAIRE_ID,
          inventaireId
        )
    );
  }
};

const saveInventaireMeteos = async (
  inventaireId: number,
  meteosIds: number[]
): Promise<void> => {
  if (meteosIds.length > 0) {
    await SqlConnection.query(
      getSaveListOfEntitesQueries(
        TABLE_INVENTAIRE_METEO,
        inventaireId,
        meteosIds
      )
    );
  }
};

const saveInventaireAssocies = async (
  inventaireId: number,
  associesIds: number[]
): Promise<void> => {
  if (associesIds.length > 0) {
    await SqlConnection.query(
      getSaveListOfEntitesQueries(
        TABLE_INVENTAIRE_ASSOCIE,
        inventaireId,
        associesIds
      )
    );
  }
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
    // Coordinates are customized
    const coordinates = getOriginCoordinates(inventaire); // TO DO

    if (coordinates) {
      altitude = customizedAltitude;
      longitude = coordinates.longitude;
      latitude = coordinates.latitude;
      coordinatesSystem = coordinates.system;
    } else {
      console.error("Cannot get coordinates of inventaire", inventaire);
      return null;
    }
  }

  // Save the inventaire
  const inventaireResult: SqlSaveResponse = await SqlConnection.query(
    getSaveEntityQuery(
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
    )
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

export const getExistingInventaireId = async (
  inventaire: Inventaire
): Promise<number | null> => {
  const response = await SqlConnection.query(
    getQueryToFindInventaireIdByAllAttributes(inventaire)
  );

  const eligibleInventaireIds: number[] = getArrayFromObjects(response, ID);

  for (const id of eligibleInventaireIds) {
    // Compare the observateurs associes and the meteos
    const response = await SqlConnection.query(
      getQueryToFindAssociesIdsByInventaireId(id) +
        getQueryToFindMeteosIdsByInventaireId(id)
    );

    const associesIds: number[] = getArrayFromObjects(
      response[0],
      OBSERVATEUR_ID
    );
    const meteosIds: number[] = getArrayFromObjects(response[1], METEO_ID);

    if (
      id !== inventaire.id &&
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
  return await SqlConnection.query(
    getDeleteEntityByIdQuery(TABLE_INVENTAIRE, id)
  );
};

export const findInventaireIdById = async (id: number): Promise<number> => {
  const response = await SqlConnection.query(
    getQueryToFindInventaireIdById(id)
  );
  return response[0] ? response[0].id : null;
};

export const findInventaireById = async (
  inventaireId: number
): Promise<Inventaire> => {
  const results = await SqlConnection.query(
    getQueryToFindOneById(TABLE_INVENTAIRE, inventaireId) +
      getQueryToFindAssociesByInventaireId(inventaireId) +
      getQueryToFindMetosByInventaireId(inventaireId)
  );

  const inventaire: Inventaire = mapInventaire(results[0][0]);
  inventaire.associesIds = mapAssociesIds(results[1]);
  inventaire.meteosIds = mapMeteosIds(results[2]);

  return inventaire;
};
