import { redisConfig } from "@infrastructure/config/redis-config.js";
import { Redis } from "ioredis";

export const redis = new Redis(redisConfig.url);
