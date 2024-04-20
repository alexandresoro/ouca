import { z } from "zod";

const ALTICODAGE_URL = "https://wxs.ign.fr/choisirgeoportail/alti/rest/elevation.json";

const alticodageResponseSchema = z.object({
  elevations: z.array(z.number()).length(1),
});

type GetAltitudeForCoordinatesResult =
  | {
      outcome: "success";
      altitude: number;
    }
  | {
      outcome: "error";
    };

export const getAltitudeForCoordinates = async ({
  latitude,
  longitude,
}: { latitude: number; longitude: number }): Promise<GetAltitudeForCoordinatesResult> => {
  const searchParams = new URLSearchParams({
    lat: `${latitude}`,
    lon: `${longitude}`,
    zonly: "true",
  });

  try {
    const response = await fetch(`${ALTICODAGE_URL}?${searchParams.toString()}`);
    const responseParsed = (await response.json()) as unknown;

    const responseValidated = alticodageResponseSchema.parse(responseParsed);

    const altitude = responseValidated.elevations[0];

    return {
      outcome: "success",
      altitude,
    };
  } catch (e) {
    console.error(e);
    return {
      outcome: "error",
    };
  }
};
