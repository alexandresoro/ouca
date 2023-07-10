import { GPS_COORDINATES } from "@ou-ca/common/coordinates-system/gps.object";

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

  public static checkLongitudeValidity(longitudeStr: string): string | undefined {
    if (!longitudeStr) {
      return "La longitude du lieu-dit ne peut pas être vide";
    }

    const longitude = Number(longitudeStr);

    if (
      isNaN(longitude) ||
      longitude < GPS_COORDINATES.longitudeRange.min ||
      longitude > GPS_COORDINATES.longitudeRange.max
    ) {
      return `La longitude du lieu-dit doit être un nombre compris entre ${GPS_COORDINATES.longitudeRange.min} et ${GPS_COORDINATES.longitudeRange.max}`;
    }
  }

  public static checkLatitudeValidity(latitudeStr: string): string | undefined {
    if (!latitudeStr) {
      return "La latitude du lieu-dit ne peut pas être vide";
    }

    const latitude = Number(latitudeStr);

    if (
      isNaN(latitude) ||
      latitude < GPS_COORDINATES.latitudeRange.min ||
      latitude > GPS_COORDINATES.latitudeRange.max
    ) {
      return `La latitude du lieu-dit doit être un entier compris entre ${GPS_COORDINATES.latitudeRange.min} et ${GPS_COORDINATES.latitudeRange.max}`;
    }
  }
}
