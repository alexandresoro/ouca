export const LAMBERT_93 = "lambert93";

export const GPS = "gps"; // WGS-84

export const COORDINATES_SYSTEMS = [LAMBERT_93, GPS] as const;

export type CoordinatesSystemType = typeof COORDINATES_SYSTEMS[number];

export interface CoordinatesSystem {
  code: CoordinatesSystemType;

  epsgCode: string;

  name: string;

  decimalPlaces: number;

  unitName: string;

  longitudeRange: { min: number; max: number };

  latitudeRange: { min: number; max: number };

  proj4Formula?: string;
}
