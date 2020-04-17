/* eslint-disable @typescript-eslint/camelcase */
import * as _ from "lodash";
import { Lieudit } from "ouca-common/lieudit.model";
import { LieuditDb } from "../objects/db/lieudit-db.object";

export const buildLieuditFromLieuditDb = (lieuditDb: LieuditDb): Lieudit => {
  return {
    id: lieuditDb.id,
    communeId: lieuditDb.commune_id,
    nom: lieuditDb.nom,
    altitude: lieuditDb.altitude,
    coordinates: {
      longitude: lieuditDb.longitude,
      latitude: lieuditDb.latitude,
      system: lieuditDb.coordinates_system,
      isTransformed: false
    }
  };
};

export const buildLieuxditsFromLieuxditsDb = (
  lieuxditsDb: LieuditDb[]
): Lieudit[] => {
  return _.map(lieuxditsDb, (lieuditDb) => {
    return buildLieuditFromLieuditDb(lieuditDb);
  });
};

export const buildLieuditDbFromLieudit = (lieudit: Lieudit): LieuditDb => {
  return {
    id: lieudit.id,
    commune_id: lieudit.communeId,
    nom: lieudit.nom,
    altitude: lieudit.altitude,
    longitude: lieudit.coordinates.longitude,
    latitude: lieudit.coordinates.latitude,
    coordinates_system: lieudit.coordinates.system
  };
};
