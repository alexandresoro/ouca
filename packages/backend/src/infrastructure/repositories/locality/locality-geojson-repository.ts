import { redis } from "@infrastructure/ioredis/redis.js";
import { logger } from "../../../utils/logger.js";

const GEOJSON_DATA_REDIS_KEY = "geoJsonLocalities";

export const buildGeoJSONRepository = () => {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  const getLocalities = async (): Promise<unknown | null> => {
    const cachedLocalitiesStr = await redis.get(GEOJSON_DATA_REDIS_KEY);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cachedLocalitiesStr ? JSON.parse(cachedLocalitiesStr) : null;
  };

  const saveLocalities = async (localitiesCollection: unknown): Promise<void> => {
    logger.debug("Storing localities feature collection to cache");
    await redis.set(GEOJSON_DATA_REDIS_KEY, JSON.stringify(localitiesCollection));
  };

  return {
    getLocalities,
    saveLocalities,
  };
};
