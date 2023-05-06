import { startImportTask } from "./services/import-manager.js";
import { type Services } from "./services/services.js";
import { DOWNLOAD_ENDPOINT, IMPORTS_DIR_PATH, IMPORT_REPORTS_DIR, IMPORT_REPORTS_DIR_PATH } from "./utils/paths.js";
/* eslint-disable import/no-named-as-default */
import fastifyCompress from "@fastify/compress";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { IMPORT_TYPE, type ImportType } from "@ou-ca/common/import-types";
import fastify, { type FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import downloadController from "./controllers/download-controller.js";
import apiRoutesPlugin from "./fastify/api-routes-plugin.js";
import graphQlServerPlugin from "./fastify/graphql-server-plugin.js";
import sentryMetricsPlugin from "./fastify/sentry-metrics-plugin.js";

const API_V1_PREFIX = "/api/v1";

export const buildServer = async (services: Services): Promise<FastifyInstance> => {
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

  logger.debug("Fastify middlewares successfully registered");

  // Static files server
  await server.register(fastifyStatic, {
    root: IMPORT_REPORTS_DIR_PATH.pathname,
    prefix: `${DOWNLOAD_ENDPOINT}/${IMPORT_REPORTS_DIR}`,
  });

  logger.debug("Fastify static server successfully registered");

  await server.register(sentryMetricsPlugin);

  // Mercurius GraphQL adapter

  // Parse GraphQL schema
  const graphQLSchema = fs.readFileSync(new URL("./schema.graphql", import.meta.url), "utf-8").toString();
  logger.debug("GraphQL schema has been parsed");

  await server.register(graphQlServerPlugin, { schema: graphQLSchema, services });
  logger.debug("Mercurius GraphQL adapter successfully registered");

  // Register API routes
  await server.register(apiRoutesPlugin, { services, prefix: API_V1_PREFIX });
  logger.debug("Fastify API routes registered");

  await server.register(downloadController, { services, prefix: "/download" });
  registerFastifyStaticRoutes(server);
  logger.debug("Fastify static routes added");

  return server;
};

const registerFastifyStaticRoutes = (server: FastifyInstance): void => {
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
