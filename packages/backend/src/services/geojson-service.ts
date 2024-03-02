import { type AccessFailureReason } from "@domain/shared/failure-reason.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { redis } from "@infrastructure/ioredis/redis.js";
// FIXME: https://github.com/Turfjs/turf/issues/2414
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { featureCollection, point } from "@turf/helpers";
import { err, ok, type Result } from "neverthrow";
import { type LieuditRepository } from "../repositories/lieudit/lieudit-repository.js";
import { logger } from "../utils/logger.js";

const GEOJSON_DATA_REDIS_KEY = "geoJsonLocalities";

type GeoJSONServiceDependencies = {
  localityRepository: LieuditRepository;
};

export const buildGeoJSONService = ({ localityRepository }: GeoJSONServiceDependencies) => {
  const getLocalities = async (loggedUser: LoggedUser | null): Promise<Result<unknown, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const cachedLocalitiesStr = await redis.get(GEOJSON_DATA_REDIS_KEY);

    if (cachedLocalitiesStr) {
      return ok(JSON.parse(cachedLocalitiesStr));
    }

    const geojsonData = await updateGeoJSONData();
    return ok(geojsonData);
  };

  const updateGeoJSONData = async (): Promise<unknown> => {
    const geoJsonLocalities = await localityRepository.getLocatiesForGeoJSON();

    const localityPoints =
      geoJsonLocalities?.map((geoJsonLocality) => {
        const { longitude, latitude, ...restLocality } = geoJsonLocality;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return point([longitude, latitude], restLocality);
      }) ?? [];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const localitiesCollection = featureCollection(localityPoints);

    // Store collection as cache
    logger.debug("Storing localities feature collection to cache");
    await redis.set(GEOJSON_DATA_REDIS_KEY, JSON.stringify(localitiesCollection));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return localitiesCollection;
  };

  return {
    getLocalities,
    updateGeoJSONData,
  };
};

export type GeoJSONService = ReturnType<typeof buildGeoJSONService>;
