import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { IMPORT_TYPE, type ImportType } from "@ou-ca/common/import/import-types";
import type {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import type { Logger } from "pino";
import { startImportTask } from "../../services/import-manager.js";
import { logger as loggerParent } from "../../utils/logger.js";
import { IMPORTS_DIR_PATH } from "../../utils/paths.js";
import type { Services } from "../services/services.js";
import { apiRoutes } from "./api-routes.js";
import { downloadController } from "./controllers/download-controller.js";
import userController from "./controllers/user-controller.js";

const logger = loggerParent.child({ module: "fastify" });

const API_V1_PREFIX = "/api/v1";

export const registerRoutes = async (
  server: FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Logger
  >,
  services: Services,
): Promise<void> => {
  // Register API routes
  await server.register(apiRoutes, { services, prefix: API_V1_PREFIX });
  await server.register(userController, { services, prefix: `${API_V1_PREFIX}/user` });
  logger.debug("Fastify API routes registered");

  await server.register(downloadController, { services, prefix: "/download" });
  registerFastifyStaticRoutes(server);
  logger.debug("Fastify static routes added");
};

const registerFastifyStaticRoutes = (
  server: FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Logger
  >,
): void => {
  server.get<{ Params: { id: string }; Querystring: { filename?: string } }>(
    "/download/importReports/:id",
    async (req, reply) => {
      return reply.download(req.params.id, req.query.filename ?? undefined);
    },
  );

  // Upload import path
  server.post<{ Params: { entityName: string } }>("/uploads/:entityName", async (req, reply) => {
    if (!req.user) {
      return reply.code(401).send();
    }

    const { params } = req;

    // Check that the import is a known one
    if (
      !IMPORT_TYPE.find((importType) => {
        return importType === params.entityName;
      })
    ) {
      return await reply.code(404).send();
    }

    const data = await req.file();
    if (!data) {
      return reply.code(400).send();
    }

    const uploadId = randomUUID();

    await promisify(pipeline)(data.file, createWriteStream(path.join(IMPORTS_DIR_PATH.pathname, uploadId)));

    startImportTask(uploadId, params.entityName as ImportType, req.user);

    await reply.send(
      JSON.stringify({
        uploadId,
      }),
    );
  });
};
