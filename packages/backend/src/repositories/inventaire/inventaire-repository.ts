import { type DatabasePool, type DatabaseTransactionConnection, sql } from "slonik";
import { objectToKeyValueInsert, objectToKeyValueSet } from "../repository-helpers.js";
import { reshapeRawInventaire } from "./inventaire-repository-reshape.js";
import { type Inventaire, type InventaireCreateInput, inventaireSchema } from "./inventaire-repository-types.js";

export type InventaireRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildInventaireRepository = ({ slonik }: InventaireRepositoryDependencies) => {
  const createInventaire = async (
    inventaireInput: InventaireCreateInput,
    transaction?: DatabaseTransactionConnection,
  ): Promise<Inventaire> => {
    const query = sql.type(inventaireSchema)`
      INSERT INTO
        basenaturaliste.inventaire
        ${objectToKeyValueInsert({ ...inventaireInput, date_creation: "NOW()" })}
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
    createInventaire,
    updateInventaire,
  };
};

export type InventaireRepository = ReturnType<typeof buildInventaireRepository>;
