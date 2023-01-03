import { type CoordinatesSystemType } from "../coordinates-system/coordinates-system.object";

export type Coordinates = {
  system: CoordinatesSystemType;

  longitude: number;

  latitude: number;

  areTransformed?: boolean;

  areInvalid?: boolean;
};
