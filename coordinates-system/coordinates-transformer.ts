import proj4 from "proj4";
import { Coordinates } from "../types/coordinates.object";
import { COORDINATES_SYSTEMS_CONFIG } from "./coordinates-system-list.object";
import { CoordinatesSystemType } from "./coordinates-system.object";

const areCoordinatesInvalid = (
  longitude: number,
  latitude: number,
  system: CoordinatesSystemType
): boolean => {
  const coordinatesSystem = COORDINATES_SYSTEMS_CONFIG[system];
  return (
    longitude < coordinatesSystem.longitudeRange.min ||
    longitude > coordinatesSystem.longitudeRange.max ||
    latitude < coordinatesSystem.latitudeRange.min ||
    latitude > coordinatesSystem.latitudeRange.max
  );
};

export const transformCoordinates = (
  inputCoordinates: Coordinates,
  outputSystemType: CoordinatesSystemType
): Coordinates => {
  if (!inputCoordinates || !inputCoordinates.system || !outputSystemType) {
    throw new Error("Wrong usage of method transformCoordinates");
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

  const [
    transformedLongitude,
    transformedLatitude
  ] = proj4(inputSystem.epsgCode, outputSystem.epsgCode, [
    inputCoordinates.longitude,
    inputCoordinates.latitude
  ]);

  const outputLongitude = +transformedLongitude.toFixed(
    outputSystem.decimalPlaces
  );
  const outputLatitude = +transformedLatitude.toFixed(
    outputSystem.decimalPlaces
  );

  return {
    system: outputSystemType,
    longitude: outputLongitude,
    latitude: outputLatitude,
    areTransformed: true,
    areInvalid: areCoordinatesInvalid(
      outputLongitude,
      outputLatitude,
      outputSystemType
    )
  };
};
