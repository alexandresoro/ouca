import type { Inventory } from "@domain/inventory/inventory.js";
import type { Locality } from "@domain/locality/locality.js";
import type { UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import type { CoordinatesSystemType } from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { getHumanFriendlyTimeFromMinutes } from "@ou-ca/common/utils/time-format-convert";
import type { Inventaire, InventaireCreateInput } from "../../repositories/inventaire/inventaire-repository-types.js";

export const reshapeInputInventoryUpsertData = (
  inventory: UpsertInventoryInput,
  locality: Locality,
  ownerId?: string | null,
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
    observateur_id: Number.parseInt(observerId),
    heure: time,
    duree: duration != null ? getHumanFriendlyTimeFromMinutes(duration) : null,
    lieudit_id: Number.parseInt(localityId),
    altitude: customAltitude,
    latitude: customLatitude,
    longitude: customLongitude,
    coordinates_system: coordinatesSystem,
    owner_id: ownerId,
  };
};

export const reshapeInventaireToInventory = (inventaire: Inventaire): Inventory => {
  const { observateurId, date, heure, duree, lieuditId, dateCreation, ...restInventaire } = inventaire;

  return {
    ...restInventaire,
    observerId: observateurId.toString(),
    date: new Date(date),
    time: heure,
    duration: duree,
    localityId: lieuditId.toString(),
    creationDate: new Date(dateCreation),
  };
};