import { Coordinates } from "../coordinates.object";
import { Inventaire } from "../inventaire.object";
import { Lieudit } from "../lieudit.object";
import { CoordinatesSystemType } from "./coordinates-system.object";
import { transformCoordinates } from "./coordinates-transformer";

export const getOriginCoordinates = (
  object: Lieudit | Inventaire
): Coordinates => {
  if (object && object.id) {
    return Object.values(object.coordinates).find(coordinate => {
      return coordinate.isTransformed === false;
    });
  } else {
    return null;
  }
};

export const getCoordinates = (
  object: Lieudit | Inventaire,
  coordinatesSystem: CoordinatesSystemType
): Coordinates => {
  const originCoordinates: Coordinates = getOriginCoordinates(object);
  return transformCoordinates(originCoordinates, coordinatesSystem);
};
