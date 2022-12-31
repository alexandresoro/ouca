import { sql, type DatabasePool, type DatabaseTransactionConnection, type QueryResult } from "slonik";
import { z } from "zod";
import { objectsToKeyValueInsert } from "../repository-helpers";

export type SexeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildDonneeComportementRepository = ({ slonik }: SexeRepositoryDependencies) => {
  const insertDonneeWithComportements = async (
    donneeId: number,
    comportementIds: number[],
    transaction?: DatabaseTransactionConnection
  ): Promise<QueryResult<void> | void> => {
    if (!comportementIds.length) {
      return;
    }

    const dataToInsert = comportementIds.map((comportementId) => {
      return {
        comportement_id: comportementId,
        donnee_id: donneeId,
      };
    });

    const query = sql.type(z.void())`
      INSERT 
      INTO
        basenaturaliste.donnee_comportement
        ${objectsToKeyValueInsert(dataToInsert)}
      RETURNING
        *
    `;

    return (transaction ?? slonik).query(query);
  };

  return {
    insertDonneeWithComportements,
  };
};

export type DonneeComportementRepository = ReturnType<typeof buildDonneeComportementRepository>;
