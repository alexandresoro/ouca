import fastifyCompress from "@fastify/compress";
import { fastifyCookie } from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import { fastifyStatic } from "@fastify/static";
import { fastify } from "fastify";
import mercurius from "mercurius";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { buildGraphQLContext } from "./graphql/graphql-context";
import { logQueries, logResults } from "./graphql/mercurius-logger";
import resolvers from "./graphql/resolvers";
import { ImportType, IMPORT_TYPE } from "./model/import-types";
import { startImportTask } from "./services/import-manager";
import { getLoggedUserInfo, validateAndExtractUserToken } from "./services/token-service";
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
    resolvers,
    context: buildGraphQLContext,
  });
  server.graphql.addHook("preExecution", logQueries);
  server.graphql.addHook("onResolution", logResults);

  // Download files
  server.get<{ Params: { id: string }; Querystring: { filename?: string } }>("/download/:id", async (req, reply) => {
    const tokenPayload = await validateAndExtractUserToken(req);
    if (!tokenPayload?.sub) {
      return reply.code(401).send();
    }
    return reply.download(req.params.id, req.query.filename ?? undefined);
  });
  server.get<{ Params: { id: string }; Querystring: { filename?: string } }>(
    "/download/importReports/:id",
    async (req, reply) => {
      const tokenPayload = await validateAndExtractUserToken(req);
      if (!tokenPayload?.sub) {
        return reply.code(401).send();
      }

      return reply.download(req.params.id, req.query.filename ?? undefined);
    }
  );

  // Upload import path
  server.post<{ Params: { entityName: string } }>("/uploads/:entityName", async (req, reply) => {
    const tokenPayload = await validateAndExtractUserToken(req);
    if (!tokenPayload) {
      return reply.code(401).send();
    }
    const loggedUser = getLoggedUserInfo(tokenPayload);
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
    const uploadId = randomUUID();

    await promisify(pipeline)(data.file, fs.createWriteStream(path.join(IMPORTS_DIR_PATH, uploadId)));

    startImportTask(uploadId, params.entityName as ImportType, loggedUser);

    await reply.send(
      JSON.stringify({
        uploadId,
      })
    );
  });

  await server.listen({ port: options.listenPort, host: options.listenAddress });

  // Handle shutdown request gracefully
  // This is used when inside a container
  // See https://emmer.dev/blog/you-don-t-need-an-init-system-for-node.js-in-docker/
  // Alternative is to use --init flag
  const shutdown = () => {
    logger.info("Shutdown requested");
    void server.close().then(() => {
      logger.info("Web server has been shut down");
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})().catch((e) => {
  logger.error(e);
});
