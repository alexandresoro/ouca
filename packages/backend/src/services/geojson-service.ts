// FIXME: https://github.com/Turfjs/turf/issues/2414
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { featureCollection, point } from "@turf/helpers";
import { type Redis } from "ioredis";
import { type Logger } from "pino";
import { type LieuditRepository } from "../repositories/lieudit/lieudit-repository.js";
import { type LoggedUser } from "../types/User.js";
import { validateAuthorization } from "./entities/authorization-utils.js";

const GEOJSON_DATA_REDIS_KEY = "geoJsonLocalities";

type GeoJSONServiceDependencies = {
  logger: Logger;
  lieuditRepository: LieuditRepository;
  redis: Redis;
};

export const buildGeoJSONService = ({ logger, lieuditRepository, redis }: GeoJSONServiceDependencies) => {
  const getLocalities = async (loggedUser: LoggedUser | null): Promise<unknown> => {
    validateAuthorization(loggedUser);

    const cachedLocalitiesStr = await redis.get(GEOJSON_DATA_REDIS_KEY);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cachedLocalitiesStr ? JSON.parse(cachedLocalitiesStr) : updateGeoJSONData();
  };

  const updateGeoJSONData = async (): Promise<unknown> => {
    const geoJsonLocalities = await lieuditRepository.getLocatiesForGeoJSON();

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
