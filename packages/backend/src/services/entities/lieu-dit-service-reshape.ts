import { type Locality } from "@domain/locality/locality.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type Locality as LocalityCommon } from "@ou-ca/common/api/entities/locality";
import { type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type LieuditCreateInput } from "../../repositories/lieudit/lieudit-repository-types.js";
import { enrichEntityWithEditableStatus } from "./entities-utils.js";

export const reshapeInputLieuditUpsertData = (data: UpsertLocalityInput): LieuditCreateInput => {
  const { townId, ...rest } = data;
  return {
    ...rest,
    commune_id: parseInt(townId),
    coordinates_system: "gps",
  };
};

export function reshapeLocalityRepositoryToApi(locality: Locality, user: LoggedUser | null): LocalityCommon;
export function reshapeLocalityRepositoryToApi(locality: null, user: LoggedUser | null): null;
export function reshapeLocalityRepositoryToApi(
  locality: Locality | null,
  loggedUser: LoggedUser | null
): LocalityCommon | null;
export function reshapeLocalityRepositoryToApi(
  locality: Locality | null,
  loggedUser: LoggedUser | null
): LocalityCommon | null {
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
