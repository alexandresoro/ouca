import { EntiteSimple } from "../basenaturaliste-model/entite-simple.object";
import { SqlConnection } from "../sql/sql-connection";
import { getSaveEntityQuery } from "../sql/sql-queries-utils";

export const saveEntity = async (
  tableName: string,
  entityToSave: EntiteSimple,
  mapping: { [column: string]: string }
): Promise<boolean> => {
  const saveResult = await SqlConnection.query(
    getSaveEntityQuery(tableName, entityToSave, mapping)
  );
  console.log(saveResult);
  return !!saveResult;
};
