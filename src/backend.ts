import fastifyCompress from "@fastify/compress";
import { fastifyCookie } from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import { fastifyStatic } from "@fastify/static";
import { fastify } from "fastify";
import { NoSchemaIntrospectionCustomRule } from "graphql";
import mercurius from "mercurius";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { createPool } from "slonik";
import { createFieldNameTransformationInterceptor } from "slonik-interceptor-field-name-transformation";
import { buildGraphQLContext } from "./graphql/graphql-context";
import { logQueries, logResults } from "./graphql/mercurius-logger";
import { buildResolvers } from "./graphql/resolvers";
import { IMPORT_TYPE, type ImportType } from "./model/import-types";
import { startImportTask } from "./services/import-manager";
import { buildServices } from "./services/services";
import { createQueryLoggingInterceptor } from "./slonik/slonik-pino-interceptor";
import { createResultParserInterceptor } from "./slonik/slonik-zod-interceptor";
import { logger } from "./utils/logger";
import options from "./utils/options";
import { checkAndCreateFolders, DOWNLOAD_ENDPOINT, IMPORTS_DIR_PATH, PUBLIC_DIR_PATH } from "./utils/paths";

logger.debug("Starting server");

const schema = fs.readFileSync(path.join(__dirname, "model/schema.graphql"), "utf-8").toString();
logger.debug("GraphQL schema has been parsed");

const server = fastify({
  logger,
});

checkAndCreateFolders();

(async () => {
  // Database connection
  const slonik = await createPool(options.database.url, {
    interceptors: [
      createFieldNameTransformationInterceptor({ format: "CAMEL_CASE" }),
      createResultParserInterceptor(),
      createQueryLoggingInterceptor(logger),
    ],
  });
  logger.debug("Connection to database successful");

  // Build services
  const services = buildServices({ logger, slonik });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { tokenService } = services;

  // Middlewares
  await server.register(fastifyMultipart);
  await server.register(fastifyCookie);
  await server.register(fastifyCompress);
  await server.register(fastifyCors, {
    origin: true,
    credentials: true,
    maxAge: 3600,
  });

  // Static files server
  await server.register(fastifyStatic, {
    root: PUBLIC_DIR_PATH,
    prefix: DOWNLOAD_ENDPOINT,
  });

  // Mercurius GraphQL adapter
  await server.register(mercurius, {
    schema,
    resolvers: buildResolvers(services),
    context: buildGraphQLContext({ tokenService }),
    validationRules: process.env.NODE_ENV === "production" ? [NoSchemaIntrospectionCustomRule] : [],
  });
  server.graphql.addHook("preExecution", logQueries);
  server.graphql.addHook("onResolution", logResults);

  // Download files
  server.get<{ Params: { id: string }; Querystring: { filename?: string } }>("/download/:id", async (req, reply) => {
    const tokenPayload = await tokenService.validateAndExtractUserToken(req);
    if (!tokenPayload?.sub) {
      return reply.code(401).send();
    }
    return reply.download(req.params.id, req.query.filename ?? undefined);
  });
  server.get<{ Params: { id: string }; Querystring: { filename?: string } }>(
    "/download/importReports/:id",
    async (req, reply) => {
      const tokenPayload = await tokenService.validateAndExtractUserToken(req);
      if (!tokenPayload?.sub) {
        return reply.code(401).send();
      }

      return reply.download(req.params.id, req.query.filename ?? undefined);
    }
  );

  // Upload import path
  server.post<{ Params: { entityName: string } }>("/uploads/:entityName", async (req, reply) => {
    const tokenPayload = await tokenService.validateAndExtractUserToken(req);
    if (!tokenPayload) {
      return reply.code(401).send();
    }
    const loggedUser = tokenService.getLoggedUserInfo(tokenPayload);
    if (!loggedUser) {
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

    await promisify(pipeline)(data.file, fs.createWriteStream(path.join(IMPORTS_DIR_PATH, uploadId)));

    startImportTask(uploadId, params.entityName as ImportType, loggedUser);

    await reply.send(
      JSON.stringify({
        uploadId,
      })
    );
  });

  await server.listen({ ...options.server });

  // Handle shutdown request gracefully
  // This is used when inside a container
  // See https://emmer.dev/blog/you-don-t-need-an-init-system-for-node.js-in-docker/
  // Alternative is to use --init flag
  const shutdown = () => {
    logger.info("Shutdown requested");
    Promise.all([
      slonik.end().then(() => {
        logger.info("Database connector has been shut down");
      }),
      server.close().then(() => {
        logger.info("Web server has been shut down");
      }),
    ]).finally(() => {
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})().catch((e) => {
  logger.error(e);
});
