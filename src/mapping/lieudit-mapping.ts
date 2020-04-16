import * as _ from "lodash";
import { Coordinates } from "ouca-common/coordinates.object";
import { Lieudit } from "ouca-common/lieudit.model";
import { LieuditDb } from "../objects/db/lieudit-db.object";
import { getOriginCoordinates } from "../utils/coordinates-utils";

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

export const buildLieuditDbFromLieudit = (
  lieudit: Lieudit,
  coordinates?: Coordinates
): LieuditDb => {
  coordinates = coordinates ? coordinates : getOriginCoordinates(lieudit);

  return {
    id: lieudit.id,
    commune_id: lieudit.communeId,
    nom: lieudit.nom,
    altitude: lieudit.altitude,
    longitude: coordinates.longitude,
    latitude: coordinates.latitude,
    coordinates_system: coordinates.system
  };
};
