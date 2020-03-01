import { Coordinates } from "../coordinates.object";
import {
  CoordinatesSystemType,
  GPS,
  LAMBERT_93
} from "./coordinates-system.object";

const deg2rad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Transform longitude and latitude from WGS84 to Lambert 93
 * Rounded to 1 decimal place
 * @param longitude in degrees
 * @param latitude in degrees
 */
const transformWGS84toLambert93 = (
  coordinatesWSG84: Coordinates
): Coordinates => {
  // Constants
  const constants = {
    A: 6378137, //demi grand axe de l'ellipsoide (m)
    E: 0.08181919106, //première excentricité de l'ellipsoide
    LC: deg2rad(3),
    PHI0: deg2rad(46.5), //latitude d'origine en radian
    PHI1: deg2rad(44), //1er parallele automécoïque
    PHI2: deg2rad(49), //2eme parallele automécoïque
    X0: 700000, // origin longitude
    Y0: 6600000 // origin
  };

  // Convert coordinates from degrees to radians
  const phi = deg2rad(coordinatesWSG84.latitude);
  const l = deg2rad(coordinatesWSG84.longitude);

  // Calcul des grandes normales
  const gN1 =
    constants.A /
    Math.sqrt(
      1 -
        constants.E *
          constants.E *
          Math.sin(constants.PHI1) *
          Math.sin(constants.PHI1)
    );
  const gN2 =
    constants.A /
    Math.sqrt(
      1 -
        constants.E *
          constants.E *
          Math.sin(constants.PHI2) *
          Math.sin(constants.PHI2)
    );

  // Calculs des latitudes isométriques
  const gl1 = Math.log(
    Math.tan(Math.PI / 4 + constants.PHI1 / 2) *
      Math.pow(
        (1 - constants.E * Math.sin(constants.PHI1)) /
          (1 + constants.E * Math.sin(constants.PHI1)),
        constants.E / 2
      )
  );
  const gl2 = Math.log(
    Math.tan(Math.PI / 4 + constants.PHI2 / 2) *
      Math.pow(
        (1 - constants.E * Math.sin(constants.PHI2)) /
          (1 + constants.E * Math.sin(constants.PHI2)),
        constants.E / 2
      )
  );
  const gl0 = Math.log(
    Math.tan(Math.PI / 4 + constants.PHI0 / 2) *
      Math.pow(
        (1 - constants.E * Math.sin(constants.PHI0)) /
          (1 + constants.E * Math.sin(constants.PHI0)),
        constants.E / 2
      )
  );
  const gl = Math.log(
    Math.tan(Math.PI / 4 + phi / 2) *
      Math.pow(
        (1 - constants.E * Math.sin(phi)) / (1 + constants.E * Math.sin(phi)),
        constants.E / 2
      )
  );

  // Calcul de l'exposant de la projection
  const n =
    Math.log(
      (gN2 * Math.cos(constants.PHI2)) / (gN1 * Math.cos(constants.PHI1))
    ) /
    (gl1 - gl2);

  // Calcul de la constante de projection
  const c = ((gN1 * Math.cos(constants.PHI1)) / n) * Math.exp(n * gl1);

  // Calcul des coordonnées
  const ys = constants.Y0 + c * Math.exp(-1 * n * gl0);

  const x93 =
    constants.X0 + c * Math.exp(-1 * n * gl) * Math.sin(n * (l - constants.LC));
  const y93 = ys - c * Math.exp(-1 * n * gl) * Math.cos(n * (l - constants.LC));

  return {
    system: LAMBERT_93,
    longitude: Math.round(x93 * 10) / 10,
    latitude: Math.round(y93 * 10) / 10,
    isTransformed: true
  };
};

/**
 * Transform coordinates in Lambert 93 to WGS84
 * Rounded to 5 decimal places
 * @param coordinatesL93
 */
const transformLambert93toWGS84 = (
  coordinatesL93: Coordinates
): Coordinates => {
  const constants = {
    GRS80E: 0.081819191042816,
    LONG_0: 3,
    XS: 700000,
    YS: 12655612.0499,
    n: 0.725607765053267,
    C: 11754255.4261
  };

  const delX = coordinatesL93.longitude - constants.XS;
  const delY = coordinatesL93.latitude - constants.YS;

  const gamma = Math.atan(-delX / delY);

  const R = Math.sqrt(delX * delX + delY * delY);

  const latiso = Math.log(constants.C / R) / constants.n;

  const sinPhiit0 = Math.tanh(
    latiso + constants.GRS80E * Math.atanh(constants.GRS80E * Math.sin(1))
  );

  const sinPhiit1 = Math.tanh(
    latiso + constants.GRS80E * Math.atanh(constants.GRS80E * sinPhiit0)
  );

  const sinPhiit2 = Math.tanh(
    latiso + constants.GRS80E * Math.atanh(constants.GRS80E * sinPhiit1)
  );

  const sinPhiit3 = Math.tanh(
    latiso + constants.GRS80E * Math.atanh(constants.GRS80E * sinPhiit2)
  );

  const sinPhiit4 = Math.tanh(
    latiso + constants.GRS80E * Math.atanh(constants.GRS80E * sinPhiit3)
  );

  const sinPhiit5 = Math.tanh(
    latiso + constants.GRS80E * Math.atanh(constants.GRS80E * sinPhiit4)
  );

  const sinPhiit6 = Math.tanh(
    latiso + constants.GRS80E * Math.atanh(constants.GRS80E * sinPhiit5)
  );

  const longRad = Math.asin(sinPhiit6);
  const latRad = gamma / constants.n + (constants.LONG_0 / 180) * Math.PI;

  const longitude = (latRad / Math.PI) * 180;
  const latitude = (longRad / Math.PI) * 180;

  return {
    system: GPS,
    longitude: Math.round(longitude * 100000) / 100000,
    latitude: Math.round(latitude * 100000) / 100000,
    isTransformed: true
  };
};

export const transformCoordinates = (
  inputCoordinates: Coordinates,
  outputSystem: CoordinatesSystemType
): Coordinates => {
  if (!inputCoordinates || !inputCoordinates.system || !outputSystem) {
    console.error("Wrong usage of method transformCoordinates");
    return null;
  }

  if (inputCoordinates.system === outputSystem) {
    return inputCoordinates;
  }

  if (inputCoordinates.system === LAMBERT_93) {
    if (outputSystem === GPS) {
      return transformLambert93toWGS84(inputCoordinates);
    }
  }

  if (inputCoordinates.system === GPS) {
    if (outputSystem === LAMBERT_93) {
      return transformWGS84toLambert93(inputCoordinates);
    }
  }

  console.error(
    "Unsupported coordinates transformation from " +
      inputCoordinates.system +
      " to " +
      outputSystem
  );

  return null;
};
