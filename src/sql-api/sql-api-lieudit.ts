import {
  getCoordinates,
  getOriginCoordinates
} from "ouca-common/coordinates-system";
import { Coordinates } from "ouca-common/coordinates.object";
import { Lieudit } from "ouca-common/lieudit.model";
import {
  buildLieuditDbFromLieudit,
  buildLieuditFromLieuditDb
} from "../mapping/lieudit-mapping";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { SqlConnection } from "../sql-api/sql-connection";
import { getQueryToFindLieuditByCommuneIdAndNom } from "../sql/sql-queries-lieudit";
import {
  DB_SAVE_MAPPING,
  getQueryToFindOneById
} from "../sql/sql-queries-utils";
import { TABLE_LIEUDIT } from "../utils/constants";
import { saveDbEntity } from "./sql-api-common";

export const findLieuditById = async (lieuditId: number): Promise<Lieudit> => {
  const results = await SqlConnection.query(
    getQueryToFindOneById(TABLE_LIEUDIT, lieuditId)
  );

  let lieudit: Lieudit = null;

  if (results && results[0] && results[0].id) {
    lieudit = buildLieuditFromLieuditDb(results[0]);
  }

  return lieudit;
};

export const getLieuditByCommuneIdAndNom = async (
  communeId: number,
  nom: string
): Promise<Lieudit> => {
  const results = await SqlConnection.query(
    getQueryToFindLieuditByCommuneIdAndNom(communeId, nom)
  );

  let lieudit: Lieudit = null;

  if (results && results[0] && results[0].id) {
    lieudit = buildLieuditFromLieuditDb(results[0]);
  }

  return lieudit;
};

const getLieuditCommuneId = (lieudit: Lieudit): number => {
  return lieudit?.communeId ? lieudit.communeId : null;
};

const getCoordinatesToPersist = async (
  lieudit: Lieudit
): Promise<Coordinates> => {
  const newCoordinates = getOriginCoordinates(lieudit);

  let coordinatesToPersist = newCoordinates;

  if (lieudit.id) {
    // We check if the coordinates of the lieudit are the same as the one stored in database
    const oldLieudit = await findLieuditById(lieudit.id);
    const oldCoordinates = getCoordinates(oldLieudit, newCoordinates.system);

    if (
      newCoordinates.longitude === oldCoordinates.longitude &&
      newCoordinates.latitude === oldCoordinates.latitude
    ) {
      coordinatesToPersist = getOriginCoordinates(oldLieudit);
    }
  }

  return coordinatesToPersist;
};

export const persistLieudit = async (
  lieudit: Lieudit
): Promise<SqlSaveResponse> => {
  lieudit.communeId = getLieuditCommuneId(lieudit);
  const coordinates = await getCoordinatesToPersist(lieudit);

  const lieuditDb = buildLieuditDbFromLieudit(lieudit, coordinates);

  return saveDbEntity(lieuditDb, TABLE_LIEUDIT, DB_SAVE_MAPPING.lieudit);
};
