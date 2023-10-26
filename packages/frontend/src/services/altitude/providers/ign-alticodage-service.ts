import { z } from "zod";

const ALTICODAGE_URL = "https://wxs.ign.fr/choisirgeoportail/alti/rest/elevation.json";

const alticodageResponseSchema = z.object({
  elevations: z
    .array(
      z.object({
        lon: z.number(),
        lat: z.number(),
        z: z.number(),
        acc: z.number(),
      })
    )
    .length(1),
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
  });

  try {
    const response = await fetch(`${ALTICODAGE_URL}?${searchParams.toString()}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const responseParsed = await response.json();

    const responseValidated = alticodageResponseSchema.parse(responseParsed);

    const altitude = responseValidated.elevations[0].z;

    return {
      outcome: "success",
      altitude,
    };
  } catch (e) {
    return {
      outcome: "error",
    };
  }
};
