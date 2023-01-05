import { type CoordinatesSystem } from "@ou-ca/common/coordinates-system/coordinates-system.object";

const ALTITUDE_MIN_VALUE = 0;
const ALTITUDE_MAX_VALUE = 65535;

export class CoordinatesValidatorHelper {
  public static checkAltitudeValidity(altitudeStr: string): string | null {
    if (!altitudeStr) {
      return "L'altitude du lieu-dit ne peut pas être vide";
    }

    const altitude = Number(altitudeStr);

    if (!Number.isInteger(altitude)) {
      return "L'altitude du lieu-dit doit être un entier";
    }

    if (altitude < ALTITUDE_MIN_VALUE || altitude > ALTITUDE_MAX_VALUE) {
      return `L'altitude du lieu-dit doit être un entier compris entre ${ALTITUDE_MIN_VALUE} et ${ALTITUDE_MAX_VALUE}`;
    }

    return null;
  }

  public static checkLongitudeValidity(longitudeStr: string, coordinatesSystem: CoordinatesSystem): string | undefined {
    if (!longitudeStr) {
      return "La longitude du lieu-dit ne peut pas être vide";
    }

    const longitude = Number(longitudeStr);

    if (
      isNaN(longitude) ||
      longitude < coordinatesSystem.longitudeRange.min ||
      longitude > coordinatesSystem.longitudeRange.max
    ) {
      return `La longitude du lieu-dit doit être un nombre compris entre ${coordinatesSystem.longitudeRange.min} et ${coordinatesSystem.longitudeRange.max}`;
    }
  }

  public static checkLatitudeValidity(latitudeStr: string, coordinatesSystem: CoordinatesSystem): string | undefined {
    if (!latitudeStr) {
      return "La latitude du lieu-dit ne peut pas être vide";
    }

    const latitude = Number(latitudeStr);

    if (
      isNaN(latitude) ||
      latitude < coordinatesSystem.latitudeRange.min ||
      latitude > coordinatesSystem.latitudeRange.max
    ) {
      return `La latitude du lieu-dit doit être un entier compris entre ${coordinatesSystem.latitudeRange.min} et ${coordinatesSystem.latitudeRange.max}`;
    }
  }
}
