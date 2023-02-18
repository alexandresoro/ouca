import { sql, type DatabasePool, type DatabaseTransactionConnection, type QueryResult } from "slonik";
import { z } from "zod";
import { objectsToKeyValueInsert } from "../repository-helpers.js";

export type SexeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildDonneeComportementRepository = ({ slonik }: SexeRepositoryDependencies) => {
  const deleteComportementsOfDonneeId = async (
    donneeId: number,
    transaction?: DatabaseTransactionConnection
  ): Promise<QueryResult<void>> => {
    const query = sql.type(z.void())`
      DELETE 
      FROM
        basenaturaliste.donnee_comportement
      WHERE
        donnee_comportement.donnee_id = ${donneeId}
    `;

    return (transaction ?? slonik).query(query);
  };

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
    `;

    return (transaction ?? slonik).query(query);
  };

  return {
    deleteComportementsOfDonneeId,
    insertDonneeWithComportements,
  };
};

export type DonneeComportementRepository = ReturnType<typeof buildDonneeComportementRepository>;
