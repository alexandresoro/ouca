import { CoordinatesSystemType } from "../model/coordinates-system/coordinates-system.object";
import { TABLE_SETTINGS } from "../utils/constants";
import { getFirstResult, query } from "./sql-queries-utils";

export const queryToFindCoordinatesSystem = async (): Promise<CoordinatesSystemType
> => {
  const results = await query<{ system: CoordinatesSystemType }[]>(
    `SELECT coordinates_system as system FROM ${TABLE_SETTINGS}`
  );
  return getFirstResult(results)?.system ? getFirstResult(results).system : null;
};
