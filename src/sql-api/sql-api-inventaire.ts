import * as _ from "lodash";
import moment from "moment";
import { CoordinatesSystemType } from "ouca-common/coordinates-system/coordinates-system.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  getQueryToFindAssociesIdsByInventaireId,
  getQueryToFindInventaireIdByAllAttributes,
  getQueryToFindInventaireIdById,
  getQueryToFindMeteosIdsByInventaireId
} from "../sql/sql-queries-inventaire";
import {
  DB_SAVE_MAPPING,
  getDeleteEntityByAttributeQuery,
  getDeleteEntityByIdQuery,
  getSaveEntityQuery,
  getSaveListOfEntitesQueries
} from "../sql/sql-queries-utils";
import {
  TABLE_INVENTAIRE,
  TABLE_INVENTAIRE_ASSOCIE,
  TABLE_INVENTAIRE_METEO
} from "../utils/constants";
import {
  areArraysContainingSameValues,
  getArrayFromObjects
} from "../utils/utils";
import { SqlConnection } from "./sql-connection";
export const persistInventaire = async (
  inventaire: Inventaire
): Promise<SqlSaveResponse> => {
  const { date, customizedAltitude, ...otherParams } = inventaire;

  if (inventaire.id) {
    // It is an update
    // We delete the current associes and meteos to insert later the updated ones
    await SqlConnection.query(
      getDeleteEntityByAttributeQuery(
        TABLE_INVENTAIRE_ASSOCIE,
        "inventaire_id",
        inventaire.id
      ) +
        getDeleteEntityByAttributeQuery(
          TABLE_INVENTAIRE_METEO,
          "inventaire_id",
          inventaire.id
        )
    );
  }

  const coordinates =
    inventaire.coordinates[
      _.first(_.keys(inventaire.coordinates) as CoordinatesSystemType[])
    ];

  // Save the inventaire
  const inventaireResult: SqlSaveResponse = await SqlConnection.query(
    getSaveEntityQuery(
      TABLE_INVENTAIRE,
      {
        date: moment.utc(date).format("YYYY-MM-DD"),
        dateCreation: moment().format("YYYY-MM-DD HH:mm:ss"),
        altitude: customizedAltitude,
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
        coordinatesSystem: coordinates.system,
        ...otherParams
      },
      DB_SAVE_MAPPING.inventaire
    )
  );

  // Get the inventaire ID
  // If it is an update we take the existing ID else we take the inserted ID
  const inventaireId: number = inventaire.id
    ? inventaire.id
    : inventaireResult.insertId;

  // Save the observateurs associes
  if (inventaire.associesIds.length > 0) {
    await SqlConnection.query(
      getSaveListOfEntitesQueries(
        TABLE_INVENTAIRE_ASSOCIE,
        inventaireId,
        inventaire.associesIds
      )
    );
  }

  // Save the meteos
  if (inventaire.meteosIds.length > 0) {
    await SqlConnection.query(
      getSaveListOfEntitesQueries(
        TABLE_INVENTAIRE_METEO,
        inventaireId,
        inventaire.meteosIds
      )
    );
  }

  return inventaireResult;
};

export const getExistingInventaireId = async (
  inventaire: Inventaire
): Promise<number | null> => {
  const response = await SqlConnection.query(
    getQueryToFindInventaireIdByAllAttributes(inventaire)
  );

  const eligibleInventaireIds: number[] = getArrayFromObjects(response, "id");

  for (const id of eligibleInventaireIds) {
    // Compare the observateurs associes and the meteos
    const response = await SqlConnection.query(
      getQueryToFindAssociesIdsByInventaireId(id) +
        getQueryToFindMeteosIdsByInventaireId(id)
    );

    const associesIds: number[] = getArrayFromObjects(
      response[0],
      "observateur_id"
    );
    const meteosIds: number[] = getArrayFromObjects(response[1], "meteo_id");

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
