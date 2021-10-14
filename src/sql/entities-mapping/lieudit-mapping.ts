import { Lieudit as LieuditDb } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { Lieudit as LieuditObj } from "../../model/types/lieudit.model";

export const buildLieuditDbFromLieudit = (lieudit: LieuditObj): LieuditDb => {
  return {
    id: lieudit.id,
    communeId: lieudit.communeId,
    nom: lieudit.nom,
    altitude: lieudit.altitude,
    latitude_l2e: null,
    longitude_l2e: null,
    ...(
      Object.prototype.hasOwnProperty.call(lieudit, "coordinates") ? {
        longitude: new Decimal(lieudit.coordinates.longitude),
        latitude: new Decimal(lieudit.coordinates.latitude),
        coordinatesSystem: lieudit.coordinates.system
      } : {
        longitude: null,
        latitude: null,
        coordinatesSystem: null
      }
    )
  };
};
