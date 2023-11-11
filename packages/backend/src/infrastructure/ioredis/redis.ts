import { config } from "@infrastructure/config/config.js";
import { Redis } from "ioredis";

export const redis = new Redis(config.redis.url);
