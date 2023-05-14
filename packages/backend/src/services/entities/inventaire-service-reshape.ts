import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { CoordinatesSystemType } from "../../graphql/generated/graphql-types.js";
import { type InventaireCreateInput } from "../../repositories/inventaire/inventaire-repository-types.js";

export const reshapeInputInventaireUpsertData = (
  inventory: UpsertInventoryInput,
  ownerId?: string | null
): InventaireCreateInput => {
  const { observerId, localityId, associateIds, weatherIds, time, duration, ...rest } = inventory;
  const coordinatesSystem =
    inventory?.altitude != null && inventory?.latitude != null && inventory?.longitude != null
      ? CoordinatesSystemType.Gps
      : null;
  return {
    ...rest,
    observateur_id: observerId,
    heure: time,
    duree: duration,
    lieudit_id: localityId,
    coordinates_system: coordinatesSystem,
    owner_id: ownerId,
  };
};
