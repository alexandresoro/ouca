import { sql, type DatabasePool, type DatabaseTransactionConnection } from "slonik";
import { reshapeRawInventaire } from "./inventaire-repository-reshape";
import { inventaireSchema, type Inventaire } from "./inventaire-repository-types";

export type InventaireRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildInventaireRepository = ({ slonik }: InventaireRepositoryDependencies) => {
  const findInventaireById = async (id: number): Promise<Inventaire | null> => {
    const query = sql.type(inventaireSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.inventaire
      WHERE
        id = ${id}
    `;

    const rawInventaire = await slonik.maybeOne(query);

    return reshapeRawInventaire(rawInventaire);
  };

  const findInventaireByDonneeId = async (
    donneeId: number | undefined,
    transaction?: DatabaseTransactionConnection
  ): Promise<Inventaire | null> => {
    if (!donneeId) {
      return null;
    }

    const query = sql.type(inventaireSchema)`
      SELECT 
        inventaire.*
      FROM
        basenaturaliste.inventaire
      LEFT JOIN basenaturaliste.donnee ON inventaire.id = donnee.inventaire_id
      WHERE
        donnee.id = ${donneeId}
    `;

    const rawInventaire = await (transaction ?? slonik).maybeOne(query);

    return reshapeRawInventaire(rawInventaire);
  };

  const findInventaires = async (): Promise<Inventaire[]> => {
    const query = sql.type(inventaireSchema)`
    SELECT 
      inventaire.*
    FROM
      basenaturaliste.inventaire`;

    const rawInventaires = await slonik.any(query);

    return rawInventaires.map((rawInventaire) => reshapeRawInventaire(rawInventaire));
  };

  const deleteInventaireById = async (
    inventaireId: number,
    transaction?: DatabaseTransactionConnection
  ): Promise<Inventaire> => {
    const query = sql.type(inventaireSchema)`
      DELETE
      FROM
        basenaturaliste.inventaire
      WHERE
        id = ${inventaireId}
      RETURNING
        *
    `;

    const rawInventaire = await (transaction ?? slonik).one(query);

    return reshapeRawInventaire(rawInventaire);
  };

  return {
    findInventaireById,
    findInventaireByDonneeId,
    findInventaires,
    deleteInventaireById,
  };
};

export type InventaireRepository = ReturnType<typeof buildInventaireRepository>;
