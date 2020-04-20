import * as _ from "lodash";
import { getCoordinates } from "ouca-common/coordinates-system";
import { Coordinates } from "ouca-common/coordinates.object";
import { Lieudit } from "ouca-common/lieudit.model";
import {
  buildLieuditDbFromLieudit,
  buildLieuditFromLieuditDb,
  buildLieuxditsFromLieuxditsDb
} from "../mapping/lieudit-mapping";
import { LieuditDb } from "../objects/db/lieudit-db.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  queryToFindAllLieuxDits,
  queryToFindLieuditByCommuneIdAndNom,
  queryToFindNumberOfDonneesByLieuDitId
} from "../sql/sql-queries-lieudit";
import { DB_SAVE_MAPPING, queryToFindOneById } from "../sql/sql-queries-utils";
import { TABLE_LIEUDIT } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { saveDbEntity } from "./sql-api-common";

export const findAllLieuxDits = async (): Promise<Lieudit[]> => {
  const [lieuxditsDb, nbDonneesByLieudit] = await Promise.all([
    queryToFindAllLieuxDits(),
    queryToFindNumberOfDonneesByLieuDitId()
  ]);

  const lieuxdits: Lieudit[] = buildLieuxditsFromLieuxditsDb(lieuxditsDb);

  _.forEach(lieuxdits, (lieudit: Lieudit) => {
    lieudit.nbDonnees = getNbByEntityId(lieudit, nbDonneesByLieudit);
  });

  return lieuxdits;
};

export const findLieuditById = async (lieuditId: number): Promise<Lieudit> => {
  const lieuxDitsDb = await queryToFindOneById<LieuditDb>(
    TABLE_LIEUDIT,
    lieuditId
  );

  let lieuDit: Lieudit = null;

  if (lieuxDitsDb && lieuxDitsDb[0]?.id) {
    lieuDit = buildLieuditFromLieuditDb(lieuxDitsDb[0]);
  }

  return lieuDit;
};

export const getLieuditByCommuneIdAndNom = async (
  communeId: number,
  nom: string
): Promise<Lieudit> => {
  const lieuxDitsDb = await queryToFindLieuditByCommuneIdAndNom(communeId, nom);

  let lieudit: Lieudit = null;

  if (lieuxDitsDb && lieuxDitsDb[0]?.id) {
    lieudit = buildLieuditFromLieuditDb(lieuxDitsDb[0]);
  }

  return lieudit;
};

const getLieuditCommuneId = (lieudit: Lieudit): number => {
  return lieudit?.communeId ? lieudit.communeId : null;
};

const getCoordinatesToPersist = async (
  lieudit: Lieudit
): Promise<Coordinates> => {
  const newCoordinates = lieudit.coordinates;

  let coordinatesToPersist = newCoordinates;

  if (lieudit.id) {
    // We check if the coordinates of the lieudit are the same as the one stored in database
    const oldLieudit = await findLieuditById(lieudit.id);
    const oldCoordinates = getCoordinates(oldLieudit, newCoordinates.system);

    if (
      newCoordinates.longitude === oldCoordinates.longitude &&
      newCoordinates.latitude === oldCoordinates.latitude
    ) {
      coordinatesToPersist = oldLieudit.coordinates;
    }
  }

  return coordinatesToPersist;
};

export const persistLieudit = async (
  lieudit: Lieudit
): Promise<SqlSaveResponse> => {
  lieudit.communeId = getLieuditCommuneId(lieudit);
  lieudit.coordinates = await getCoordinatesToPersist(lieudit);

  const lieuditDb = buildLieuditDbFromLieudit(lieudit);

  return saveDbEntity(lieuditDb, TABLE_LIEUDIT, DB_SAVE_MAPPING.lieudit);
};
