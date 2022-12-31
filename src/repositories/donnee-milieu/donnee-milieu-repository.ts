import { sql, type DatabasePool, type DatabaseTransactionConnection, type QueryResult } from "slonik";
import { z } from "zod";
import { objectsToKeyValueInsert } from "../repository-helpers";

export type SexeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildDonneeMilieuRepository = ({ slonik }: SexeRepositoryDependencies) => {
  const insertDonneeWithMilieux = async (
    donneeId: number,
    milieuIds: number[],
    transaction?: DatabaseTransactionConnection
  ): Promise<QueryResult<void> | void> => {
    if (!milieuIds.length) {
      return;
    }

    const dataToInsert = milieuIds.map((milieuId) => {
      return {
        milieu_id: milieuId,
        donnee_id: donneeId,
      };
    });

    const query = sql.type(z.void())`
      INSERT 
      INTO
        basenaturaliste.donnee_milieu
        ${objectsToKeyValueInsert(dataToInsert)}
      RETURNING
        *
    `;

    return (transaction ?? slonik).query(query);
  };

  return {
    insertDonneeWithMilieux,
  };
};

export type DonneeMilieuRepository = ReturnType<typeof buildDonneeMilieuRepository>;
