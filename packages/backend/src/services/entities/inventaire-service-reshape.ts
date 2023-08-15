import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type CoordinatesSystemType } from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { getHumanFriendlyTimeFromMinutes } from "@ou-ca/common/utils/time-format-convert";
import { type InventaireCreateInput } from "../../repositories/inventaire/inventaire-repository-types.js";
import { type Lieudit } from "../../repositories/lieudit/lieudit-repository-types.js";

export const reshapeInputInventaireUpsertData = (
  inventory: UpsertInventoryInput,
  locality: Lieudit,
  ownerId?: string | null
): InventaireCreateInput => {
  const {
    observerId,
    localityId,
    associateIds,
    weatherIds,
    time,
    duration,
    migrateDonneesIfMatchesExistingInventaire,
    coordinates,
    ...rest
  } = inventory;

  let coordinatesSystem: CoordinatesSystemType | null;
  let customLatitude: number | null;
  let customLongitude: number | null;
  let customAltitude: number | null;
  // Check that coordinates are provided and should be used
  if (
    coordinates &&
    (coordinates.latitude !== locality.latitude ||
      coordinates.longitude !== locality.longitude ||
      coordinates.altitude !== locality.altitude)
  ) {
    customLatitude = coordinates.latitude;
    customLongitude = coordinates.longitude;
    customAltitude = coordinates.altitude;
    coordinatesSystem = "gps";
  } else {
    customLatitude = null;
    customLongitude = null;
    customAltitude = null;
    coordinatesSystem = null;
  }

  return {
    ...rest,
    observateur_id: parseInt(observerId),
    heure: time,
    duree: duration != null ? getHumanFriendlyTimeFromMinutes(duration) : null,
    lieudit_id: parseInt(localityId),
    altitude: customAltitude,
    latitude: customLatitude,
    longitude: customLongitude,
    coordinates_system: coordinatesSystem,
    owner_id: ownerId,
  };
};
