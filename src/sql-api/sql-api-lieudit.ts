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
  queryToFindLieuDitByCommuneIdAndNom,
  queryToFindNumberOfDonneesByLieuDitId
} from "../sql/sql-queries-lieudit";
import { DB_SAVE_MAPPING, queryToFindOneById } from "../sql/sql-queries-utils";
import { TABLE_LIEUDIT } from "../utils/constants";
import { getNbByEntityId } from "../utils/utils";
import { saveDbEntity } from "./sql-api-common";

const getFirstLieuDit = (lieuxDitsDb: LieuditDb[]): Lieudit => {
  let lieuDit: Lieudit = null;
  if (lieuxDitsDb && lieuxDitsDb[0]?.id) {
    lieuDit = buildLieuditFromLieuditDb(lieuxDitsDb[0]);
  }
  return lieuDit;
};

export const findAllLieuxDits = async (): Promise<Lieudit[]> => {
  const [lieuxDitsDb, nbDonneesByLieuDit] = await Promise.all([
    queryToFindAllLieuxDits(),
    queryToFindNumberOfDonneesByLieuDitId()
  ]);

  const lieuxDits: Lieudit[] = buildLieuxditsFromLieuxditsDb(lieuxDitsDb);

  _.forEach(lieuxDits, (lieuDit: Lieudit) => {
    lieuDit.nbDonnees = getNbByEntityId(lieuDit, nbDonneesByLieuDit);
  });

  return lieuxDits;
};

export const findLieuDitById = async (lieuditId: number): Promise<Lieudit> => {
  const lieuxDitsDb = await queryToFindOneById<LieuditDb>(
    TABLE_LIEUDIT,
    lieuditId
  );
  return getFirstLieuDit(lieuxDitsDb);
};

export const findLieuDitByCommuneIdAndNom = async (
  communeId: number,
  nom: string
): Promise<Lieudit> => {
  const lieuxDitsDb = await queryToFindLieuDitByCommuneIdAndNom(communeId, nom);
  return getFirstLieuDit(lieuxDitsDb);
};

const getLieuDitCommuneId = (lieuDit: Lieudit): number => {
  return lieuDit?.communeId ? lieuDit.communeId : null;
};

const getCoordinatesToPersist = async (
  lieuDit: Lieudit
): Promise<Coordinates> => {
  const newCoordinates = lieuDit.coordinates;

  let coordinatesToPersist = newCoordinates;

  if (lieuDit.id) {
    // We check if the coordinates of the lieudit are the same as the one stored in database
    const oldLieuDit = await findLieuDitById(lieuDit.id);
    const oldCoordinates = getCoordinates(oldLieuDit, newCoordinates.system);

    if (
      newCoordinates.longitude === oldCoordinates.longitude &&
      newCoordinates.latitude === oldCoordinates.latitude
    ) {
      coordinatesToPersist = oldLieuDit.coordinates;
    }
  }

  return coordinatesToPersist;
};

export const persistLieuDit = async (
  lieuDit: Lieudit
): Promise<SqlSaveResponse> => {
  lieuDit.communeId = getLieuDitCommuneId(lieuDit);
  lieuDit.coordinates = await getCoordinatesToPersist(lieuDit);

  const lieuditDb = buildLieuditDbFromLieudit(lieuDit);

  return saveDbEntity(lieuditDb, TABLE_LIEUDIT, DB_SAVE_MAPPING.lieudit);
};
