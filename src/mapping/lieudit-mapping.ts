import { Lieudit } from "@ou-ca/ouca-model";
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
      system: lieuditDb.coordinates_system
    }
  };
};

export const buildLieuxditsFromLieuxditsDb = (
  lieuxditsDb: LieuditDb[]
): Lieudit[] => {
  return lieuxditsDb.map((lieuditDb) => {
    return buildLieuditFromLieuditDb(lieuditDb);
  });
};

export const buildLieuditDbFromLieudit = (lieudit: Lieudit): LieuditDb => {
  const lieuditDb: LieuditDb = {
    id: lieudit.id,
    commune_id: lieudit.communeId,
    nom: lieudit.nom,
    altitude: lieudit.altitude
  };

  if (Object.prototype.hasOwnProperty.call(lieudit, "coordinates")) {
    lieuditDb.longitude = lieudit.coordinates.longitude;
    lieuditDb.latitude = lieudit.coordinates.latitude;
    lieuditDb.coordinates_system = lieudit.coordinates.system;
  }

  return lieuditDb;
};
