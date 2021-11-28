import { EntiteSimple } from "../../model/types/entite-simple.object";
import { EntityDb } from "../../objects/db/entity-db.model";
import { queryToInsertMultipleEntitiesAndReturnIdsNoCheck } from "../../sql/sql-queries-utils";

export const insertMultipleEntitiesAndReturnIdsNoCheck = async <T extends Omit<EntityDb, "id">>(
  tableName: string,
  entitiesToSave: (EntiteSimple | T)[],
): Promise<{ id: number }[]> => {

  const insertedIds = await queryToInsertMultipleEntitiesAndReturnIdsNoCheck(tableName, entitiesToSave);
  return insertedIds;

};
