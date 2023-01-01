import { type InputInventaire } from "../../graphql/generated/graphql-types";
import { type InventaireCreateInput } from "../../repositories/inventaire/inventaire-repository-types";

export const reshapeInputInventaireUpsertData = (inventory: InputInventaire): InventaireCreateInput => {
  const { observateurId, lieuDitId, associesIds, meteosIds, ...rest } = inventory;
  return {
    ...rest,
    observateur_id: observateurId,
    lieudit_id: lieuDitId,
  };
};
