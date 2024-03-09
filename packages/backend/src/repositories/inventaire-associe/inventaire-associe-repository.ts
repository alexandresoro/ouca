import { type DatabasePool, type DatabaseTransactionConnection, type QueryResult, sql } from "slonik";
import { z } from "zod";
import { objectsToKeyValueInsert } from "../repository-helpers.js";

export type SexeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildInventaireAssocieRepository = ({ slonik }: SexeRepositoryDependencies) => {
  const deleteAssociesOfInventaireId = async (
    inventoryId: number,
    transaction?: DatabaseTransactionConnection
  ): Promise<QueryResult<void>> => {
    const query = sql.type(z.void())`
      DELETE 
      FROM
        basenaturaliste.inventaire_associe
      WHERE
        inventaire_associe.inventaire_id = ${inventoryId}
    `;

    return (transaction ?? slonik).query(query);
  };

  const insertInventaireWithAssocies = async (
    inventoryId: number,
    associeIds: number[],
    transaction?: DatabaseTransactionConnection
    // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  ): Promise<QueryResult<void> | void> => {
    if (!associeIds.length) {
      return;
    }

    const dataToInsert = associeIds.map((associeId) => {
      return {
        observateur_id: associeId,
        inventaire_id: inventoryId,
      };
    });

    const query = sql.type(z.void())`
      INSERT 
      INTO
        basenaturaliste.inventaire_associe
        ${objectsToKeyValueInsert(dataToInsert)}
    `;

    return (transaction ?? slonik).query(query);
  };

  return {
    deleteAssociesOfInventaireId,
    insertInventaireWithAssocies,
  };
};

export type InventaireAssocieRepository = ReturnType<typeof buildInventaireAssocieRepository>;
