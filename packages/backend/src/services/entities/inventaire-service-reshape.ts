import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { CoordinatesSystemType } from "../../graphql/generated/graphql-types.js";
import { type InventaireCreateInput } from "../../repositories/inventaire/inventaire-repository-types.js";

export const reshapeInputInventaireUpsertData = (
  inventory: UpsertInventoryInput,
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
  const coordinatesSystem =
    inventory?.coordinates?.altitude != null &&
    inventory?.coordinates?.latitude != null &&
    inventory?.coordinates?.longitude != null
      ? CoordinatesSystemType.Gps
      : null;
  return {
    ...rest,
    observateur_id: parseInt(observerId),
    heure: time,
    duree: duration,
    lieudit_id: parseInt(localityId),
    altitude: coordinates?.altitude ?? null,
    latitude: coordinates?.latitude ?? null,
    longitude: coordinates?.longitude ?? null,
    coordinates_system: coordinatesSystem,
    owner_id: ownerId,
  };
};
