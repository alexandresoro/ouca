import { type DatabasePool, type DatabaseTransactionConnection, sql } from "slonik";
import { objectToKeyValueSet } from "../repository-helpers.js";
import { reshapeRawInventaire } from "./inventaire-repository-reshape.js";
import { type Inventaire, type InventaireCreateInput, inventaireSchema } from "./inventaire-repository-types.js";

export type InventaireRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildInventaireRepository = ({ slonik }: InventaireRepositoryDependencies) => {
  const updateInventaire = async (
    inventoryId: number,
    inventaireInput: InventaireCreateInput,
    transaction?: DatabaseTransactionConnection,
  ): Promise<Inventaire> => {
    const query = sql.type(inventaireSchema)`
      UPDATE
        basenaturaliste.inventaire
      SET
        ${objectToKeyValueSet(inventaireInput)}
      WHERE
        id = ${inventoryId}
      RETURNING
        inventaire.id::text,
        inventaire.observateur_id,
        inventaire.date,
        inventaire.heure,
        inventaire.duree,
        inventaire.lieudit_id,
        inventaire.altitude,
        inventaire.longitude,
        inventaire.latitude,
        inventaire.temperature,
        inventaire.date_creation,
        inventaire.owner_id
    `;

    const rawInventaire = await (transaction ?? slonik).one(query);

    return reshapeRawInventaire(rawInventaire);
  };

  return {
    updateInventaire,
  };
};

export type InventaireRepository = ReturnType<typeof buildInventaireRepository>;
