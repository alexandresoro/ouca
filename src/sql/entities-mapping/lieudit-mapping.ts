import { Lieudit } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { LieuDit } from "../../model/graphql";

export const buildLieuditDbFromLieudit = (lieudit: LieuDit & { communeId: number }): Lieudit => {
  return {
    id: lieudit.id,
    communeId: lieudit.communeId,
    nom: lieudit.nom,
    altitude: lieudit.altitude,
    latitude_l2e: null,
    longitude_l2e: null,
    ...(
      Object.prototype.hasOwnProperty.call(lieudit, "coordinates") ? {
        longitude: new Decimal(lieudit.longitude),
        latitude: new Decimal(lieudit.latitude),
        coordinatesSystem: lieudit.coordinatesSystem
      } : {
        longitude: null,
        latitude: null,
        coordinatesSystem: null
      }
    )
  };
};
