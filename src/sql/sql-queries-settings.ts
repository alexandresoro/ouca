import { CoordinatesSystemType } from "../model/coordinates-system/coordinates-system.object";
import { TABLE_SETTINGS } from "../utils/constants";
import { query } from "./sql-queries-utils";

export const queryToFindCoordinatesSystem = async (): Promise<
  { system: CoordinatesSystemType }[]
> => {
  return query<{ system: CoordinatesSystemType }[]>(
    "SELECT coordinates_system as system FROM " + TABLE_SETTINGS
  );
};
