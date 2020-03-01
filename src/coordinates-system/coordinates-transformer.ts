import { Coordinates } from "../coordinates.object";
import { CoordinatesSystemType } from "./coordinates-system.object";
import { COORDINATES_SYSTEMS_CONFIG } from "./coordinates-system-list.object";
import proj4 from "proj4";

export const transformCoordinates = (
  inputCoordinates: Coordinates,
  outputSystemType: CoordinatesSystemType
): Coordinates => {
  if (!inputCoordinates || !inputCoordinates.system || !outputSystemType) {
    console.error("Wrong usage of method transformCoordinates");
    return null;
  }

  if (inputCoordinates.system === outputSystemType) {
    return inputCoordinates;
  }

  const inputSystem = COORDINATES_SYSTEMS_CONFIG[inputCoordinates.system];
  if (!proj4.defs(inputSystem.epsgCode) && inputSystem.proj4Formula) {
    proj4.defs(inputSystem.epsgCode, inputSystem.proj4Formula);
  }

  const outputSystem = COORDINATES_SYSTEMS_CONFIG[outputSystemType];
  if (!proj4.defs(outputSystem.epsgCode) && outputSystem.proj4Formula) {
    proj4.defs(outputSystem.epsgCode, outputSystem.proj4Formula);
  }

  const [outputLongitude, outputLatitude] = proj4(
    inputSystem.epsgCode,
    outputSystem.epsgCode,
    [inputCoordinates.longitude, inputCoordinates.latitude]
  );

  return {
    system: outputSystemType,
    longitude: +outputLongitude.toFixed(outputSystem.decimalPlaces),
    latitude: +outputLatitude.toFixed(outputSystem.decimalPlaces),
    isTransformed: true
  };
};
