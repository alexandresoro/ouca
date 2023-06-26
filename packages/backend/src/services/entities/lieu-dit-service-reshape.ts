import { type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type Locality } from "@ou-ca/common/entities/locality";
import { type Lieudit, type LieuditCreateInput } from "../../repositories/lieudit/lieudit-repository-types.js";
import { type LoggedUser } from "../../types/User.js";
import { enrichEntityWithEditableStatus } from "./entities-utils.js";

export const reshapeInputLieuditUpsertData = (data: UpsertLocalityInput): LieuditCreateInput => {
  const { townId, ...rest } = data;
  return {
    ...rest,
    commune_id: parseInt(townId),
    coordinates_system: "gps",
  };
};

export function reshapeLocalityRepositoryToApi(locality: Lieudit, user: LoggedUser | null): Locality;
export function reshapeLocalityRepositoryToApi(locality: null, user: LoggedUser | null): null;
export function reshapeLocalityRepositoryToApi(
  locality: Lieudit | null,
  loggedUser: LoggedUser | null
): Locality | null;
export function reshapeLocalityRepositoryToApi(
  locality: Lieudit | null,
  loggedUser: LoggedUser | null
): Locality | null {
  if (!locality) {
    return null;
  }

  const { altitude, latitude, longitude, ...restLocality } = locality;
  return enrichEntityWithEditableStatus(
    {
      ...restLocality,
      coordinates: {
        altitude,
        latitude,
        longitude,
      },
    },
    loggedUser
  );
}
