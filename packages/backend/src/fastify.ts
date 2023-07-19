import { startImportTask } from "./services/import-manager.js";
import { type Services } from "./services/services.js";
import { DOWNLOAD_ENDPOINT, IMPORTS_DIR_PATH, IMPORT_REPORTS_DIR, IMPORT_REPORTS_DIR_PATH } from "./utils/paths.js";
/* eslint-disable import/no-named-as-default */
import fastifyCompress from "@fastify/compress";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifyUnderPressure from "@fastify/under-pressure";
import { IMPORT_TYPE, type ImportType } from "@ou-ca/common/import/import-types";
import fastify, {
  type FastifyInstance,
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerDefault,
} from "fastify";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { type Logger } from "pino";
import downloadController from "./controllers/download-controller.js";
import userController from "./controllers/user-controller.js";
import apiRoutesPlugin from "./fastify/api-routes-plugin.js";
import sentryMetricsPlugin from "./fastify/sentry-metrics-plugin.js";

const API_V1_PREFIX = "/api/v1";

export const buildServer = async (
  services: Services
): Promise<
  FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Logger
  >
> => {
  const { logger: loggerParent } = services;
  const logger = loggerParent.child({ module: "fastify" });

  // Server
  const server = fastify.default({
    logger: services.logger,
  });

  // Middlewares
  await server.register(fastifyMultipart);
  await server.register(fastifyCompress);
  await server.register(fastifyCors, {
    origin: true,
    credentials: true,
    maxAge: 3600,
  });
  await server.register(fastifyUnderPressure, {
    exposeStatusRoute: "/healthz",
  });

  logger.debug("Fastify middlewares successfully registered");

  // Static files server
  await server.register(fastifyStatic, {
    root: IMPORT_REPORTS_DIR_PATH.pathname,
    prefix: `${DOWNLOAD_ENDPOINT}/${IMPORT_REPORTS_DIR}`,
  });

  logger.debug("Fastify static server successfully registered");

  await server.register(sentryMetricsPlugin);

  // Register API routes
  await server.register(apiRoutesPlugin, { services, prefix: API_V1_PREFIX });
  await server.register(userController, { services, prefix: `${API_V1_PREFIX}/user` });
  logger.debug("Fastify API routes registered");

  await server.register(downloadController, { services, prefix: "/download" });
  registerFastifyStaticRoutes(server);
  logger.debug("Fastify static routes added");

  return server;
};

const registerFastifyStaticRoutes = (
  server: FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Logger
  >
): void => {
  server.get<{ Params: { id: string }; Querystring: { filename?: string } }>(
    "/download/importReports/:id",
    async (req, reply) => {
      return reply.download(req.params.id, req.query.filename ?? undefined);
    }
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

    await promisify(pipeline)(data.file, fs.createWriteStream(path.join(IMPORTS_DIR_PATH.pathname, uploadId)));

    startImportTask(uploadId, params.entityName as ImportType, req.user);

    await reply.send(
      JSON.stringify({
        uploadId,
      })
    );
  });
};
