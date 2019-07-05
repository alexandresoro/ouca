import { EntiteSimple } from "../basenaturaliste-model/entite-simple.object";
import { SqlConnection } from "../sql/sql-connection";
import { getSaveEntityQuery } from "../sql/sql-queries-utils";

export const saveEntity = async (
  tableName: string,
  entityToSave: EntiteSimple,
  mapping: { [column: string]: string }
): Promise<boolean> => {
  const saveResult: any = await SqlConnection.query(
    getSaveEntityQuery(tableName, entityToSave, mapping)
  );

  return !!saveResult && !!saveResult.insertId && saveResult.affectedRows === 1;
};
