import { randomUUID } from "node:crypto";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import type { ImportType } from "@ou-ca/common/import/import-types";

const UPLOADS_KEY_PREFIX = "uploads";

const UPLOAD_DATA_EXPIRATION = 3600; // 1h

export const buildImportService = () => {
  const handleUpload = async (data: Buffer, entityName: ImportType, loggedUser: LoggedUser): Promise<string> => {
    const uploadId = randomUUID();

    const key = `${UPLOADS_KEY_PREFIX}:${uploadId}`;

    // Store data in cache
    await redis.set(key, data, "EX", UPLOAD_DATA_EXPIRATION);

    return uploadId;
  };

  const getUploadData = async (uploadId: string): Promise<string | null> => {
    const key = `${UPLOADS_KEY_PREFIX}:${uploadId}`;

    return redis.get(key);
  };

  return {
    handleUpload,
    getUploadData,
  };
};

export type ImportService = ReturnType<typeof buildImportService>;
