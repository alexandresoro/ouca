import { sql, type DatabasePool, type DatabaseTransactionConnection, type QueryResult } from "slonik";
import { z } from "zod";
import { objectsToKeyValueInsert } from "../repository-helpers.js";

export type SexeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildInventaireAssocieRepository = ({ slonik }: SexeRepositoryDependencies) => {
  const deleteAssociesOfInventaireId = async (
    inventaireId: number,
    transaction?: DatabaseTransactionConnection
  ): Promise<QueryResult<void>> => {
    const query = sql.type(z.void())`
      DELETE 
      FROM
        basenaturaliste.inventaire_associe
      WHERE
        inventaire_associe.inventaire_id = ${inventaireId}
    `;

    return (transaction ?? slonik).query(query);
  };

  const insertInventaireWithAssocies = async (
    inventaireId: number,
    associeIds: number[],
    transaction?: DatabaseTransactionConnection
  ): Promise<QueryResult<void> | void> => {
    if (!associeIds.length) {
      return;
    }

    const dataToInsert = associeIds.map((associeId) => {
      return {
        observateur_id: associeId,
        inventaire_id: inventaireId,
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
