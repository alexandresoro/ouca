import { CoordinatesSystemType, type InputInventaire } from "../../graphql/generated/graphql-types";
import { type InventaireCreateInput } from "../../repositories/inventaire/inventaire-repository-types";

export const reshapeInputInventaireUpsertData = (
  inventory: InputInventaire,
  ownerId?: string | null
): InventaireCreateInput => {
  const { observateurId, lieuDitId, associesIds, meteosIds, ...rest } = inventory;
  const coordinatesSystem =
    inventory?.altitude != null && inventory?.latitude != null && inventory?.longitude != null
      ? CoordinatesSystemType.Gps
      : null;
  return {
    ...rest,
    observateur_id: observateurId,
    lieudit_id: lieuDitId,
    coordinates_system: coordinatesSystem,
    owner_id: ownerId,
  };
};
