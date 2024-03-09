import { type DatabasePool, type DatabaseTransactionConnection, type QueryResult, sql } from "slonik";
import { z } from "zod";
import { objectsToKeyValueInsert } from "../repository-helpers.js";

export type SexeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildInventaireMeteoRepository = ({ slonik }: SexeRepositoryDependencies) => {
  const deleteMeteosOfInventaireId = async (
    inventoryId: number,
    transaction?: DatabaseTransactionConnection
  ): Promise<QueryResult<void>> => {
    const query = sql.type(z.void())`
      DELETE 
      FROM
        basenaturaliste.inventaire_meteo
      WHERE
        inventaire_meteo.inventaire_id = ${inventoryId}
    `;

    return (transaction ?? slonik).query(query);
  };

  const insertInventaireWithMeteos = async (
    inventoryId: number,
    meteoIds: number[],
    transaction?: DatabaseTransactionConnection
    // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  ): Promise<QueryResult<void> | void> => {
    if (!meteoIds.length) {
      return;
    }

    const dataToInsert = meteoIds.map((meteoId) => {
      return {
        meteo_id: meteoId,
        inventaire_id: inventoryId,
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
