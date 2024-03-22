import { type DatabasePool, type DatabaseTransactionConnection, type QueryResult, sql } from "slonik";
import { z } from "zod";
import { objectsToKeyValueInsert } from "../repository-helpers.js";

export type SexeRepositoryDependencies = {
  slonik: DatabasePool;
};

/**
 * @deprecated
 */
export const buildDonneeComportementRepository = ({ slonik }: SexeRepositoryDependencies) => {
  const deleteComportementsOfDonneeId = async (
    entryId: number,
    transaction?: DatabaseTransactionConnection,
  ): Promise<QueryResult<void>> => {
    const query = sql.type(z.void())`
      DELETE 
      FROM
        basenaturaliste.donnee_comportement
      WHERE
        donnee_comportement.donnee_id = ${entryId}
    `;

    return (transaction ?? slonik).query(query);
  };

  const insertDonneeWithComportements = async (
    entryId: number,
    comportementIds: number[],
    transaction?: DatabaseTransactionConnection,
    // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  ): Promise<QueryResult<void> | void> => {
    if (!comportementIds.length) {
      return;
    }

    const dataToInsert = comportementIds.map((comportementId) => {
      return {
        comportement_id: comportementId,
        donnee_id: entryId,
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
    /**
     * @deprecated
     */
    deleteComportementsOfDonneeId,
    /**
     * @deprecated
     */
    insertDonneeWithComportements,
  };
};

/**
 * @deprecated
 */
export type DonneeComportementRepository = ReturnType<typeof buildDonneeComportementRepository>;
