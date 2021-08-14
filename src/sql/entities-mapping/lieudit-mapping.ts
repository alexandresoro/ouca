import { Decimal } from "@prisma/client/runtime";
import { Lieudit } from "../../model/types/lieudit.model";
import { LieuditDb } from "../../objects/db/lieudit-db.object";

export const buildLieuditFromLieuditDb = (lieuditDb: LieuditDb): Lieudit => {
  return {
    id: lieuditDb.id,
    communeId: lieuditDb.commune_id,
    nom: lieuditDb.nom,
    altitude: lieuditDb.altitude,
    coordinates: {
      longitude: lieuditDb.longitude.toNumber(),
      latitude: lieuditDb.latitude.toNumber(),
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
    lieuditDb.longitude = new Decimal(lieudit.coordinates.longitude);
    lieuditDb.latitude = new Decimal(lieudit.coordinates.latitude);
    lieuditDb.coordinates_system = lieudit.coordinates.system;
  }

  return lieuditDb;
};
