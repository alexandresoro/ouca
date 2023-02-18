import { sql, type DatabasePool, type DatabaseTransactionConnection, type QueryResult } from "slonik";
import { z } from "zod";
import { objectsToKeyValueInsert } from "../repository-helpers.js";

export type SexeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildInventaireMeteoRepository = ({ slonik }: SexeRepositoryDependencies) => {
  const deleteMeteosOfInventaireId = async (
    inventaireId: number,
    transaction?: DatabaseTransactionConnection
  ): Promise<QueryResult<void>> => {
    const query = sql.type(z.void())`
      DELETE 
      FROM
        basenaturaliste.inventaire_meteo
      WHERE
        inventaire_meteo.inventaire_id = ${inventaireId}
    `;

    return (transaction ?? slonik).query(query);
  };

  const insertInventaireWithMeteos = async (
    inventaireId: number,
    meteoIds: number[],
    transaction?: DatabaseTransactionConnection
  ): Promise<QueryResult<void> | void> => {
    if (!meteoIds.length) {
      return;
    }

    const dataToInsert = meteoIds.map((meteoId) => {
      return {
        meteo_id: meteoId,
        inventaire_id: inventaireId,
      };
    });

    const query = sql.type(z.void())`
      INSERT 
      INTO
        basenaturaliste.inventaire_meteo
        ${objectsToKeyValueInsert(dataToInsert)}
    `;

    return (transaction ?? slonik).query(query);
  };

  return {
    deleteMeteosOfInventaireId,
    insertInventaireWithMeteos,
  };
};

export type InventaireMeteoRepository = ReturnType<typeof buildInventaireMeteoRepository>;
