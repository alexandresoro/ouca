import type { AltitudeResult, ProviderFailureReason } from "@domain/altitude/altitude.js";
import { type Result, err, fromPromise, ok } from "neverthrow";
import { z } from "zod";
import { logger } from "../../../utils/logger.js";

const ALTICODAGE_URL = "https://wxs.ign.fr/choisirgeoportail/alti/rest/elevation.json";

const ignAlticodageResponseSchema = z.object({
  elevations: z.array(z.number()).length(1),
});

export const fetchAltitudeFromIGNAlticodage = async ({
  latitude,
  longitude,
}: { latitude: number; longitude: number }): Promise<Result<AltitudeResult, ProviderFailureReason>> => {
  const searchParams = new URLSearchParams({
    lat: `${latitude}`,
    lon: `${longitude}`,
    zonly: "true",
  });

  const responseResult = await fromPromise(fetch(`${ALTICODAGE_URL}?${searchParams.toString()}`), (error) => {
    logger.error({ error }, "An error has occurred while trying to fetch the altitude provider");
    return "fetchError" as const;
  });

  if (responseResult.isErr()) {
    return err(responseResult.error);
  }

  const response = responseResult.value;

  const responseBodyResult = await fromPromise(response.json(), (error) => {
    logger.error({ error }, "An error has occurred while trying to parse the altitude result");
    return "parseError" as const;
  });

  if (responseBodyResult.isErr()) {
    return err(responseBodyResult.error);
  }

  const responseBody = responseBodyResult.value;

  const parsedResponseBodyResult = ignAlticodageResponseSchema.safeParse(responseBody);

  if (!parsedResponseBodyResult.success) {
    logger.error({ responseBody }, "The altitude result has an unexpected format");
    return err("parseError");
  }

  return ok({
    coordinates: { latitude, longitude },
    altitude: parsedResponseBodyResult.data.elevations[0],
  });
};
