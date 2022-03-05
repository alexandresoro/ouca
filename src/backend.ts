import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-fastify";
import { randomUUID } from "crypto";
import { fastify } from "fastify";
import fastifyCompress from "fastify-compress";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import fastifyMultipart from "fastify-multipart";
import fastifyStatic from "fastify-static";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { apolloRequestLogger, fastifyAppClosePlugin } from "./graphql/apollo-plugins";
import { getGraphQLContext } from "./graphql/graphql-context";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typedefs";
import { ImportType, IMPORT_TYPE } from "./model/import-types";
import { startImportTask } from "./services/import-manager";
import { getLoggedUser, validateAndExtractUserToken } from "./services/token-service";
import { logger } from "./utils/logger";
import options from "./utils/options";
import { checkAndCreateFolders, DOWNLOAD_ENDPOINT, IMPORTS_DIR_PATH, PUBLIC_DIR_PATH } from "./utils/paths";

const server = fastify({
  logger
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    fastifyAppClosePlugin(server),
    ApolloServerPluginDrainHttpServer({ httpServer: server.server }),
    apolloRequestLogger
  ],
  context: getGraphQLContext
});

checkAndCreateFolders();

(async () => {
  // Middlewares
  await server.register(fastifyMultipart);
  await server.register(fastifyCookie);
  await server.register(fastifyCompress);
  await server.register(fastifyCors, {
    origin: true,
    credentials: true
  });

  // Static files server
  await server.register(fastifyStatic, {
    root: PUBLIC_DIR_PATH,
    prefix: DOWNLOAD_ENDPOINT
  });

  // Download files
  server.get<{ Params: { id: string }; Querystring: { filename?: string } }>("/download/:id", async (req, reply) => {
    const tokenPayload = await validateAndExtractUserToken(req, reply);
    if (!tokenPayload?.sub) {
      return reply.code(401).send();
    }
    return reply.download(req.params.id, req.query.filename ?? undefined);
  });
  server.get<{ Params: { id: string }; Querystring: { filename?: string } }>(
    "/download/importReports/:id",
    async (req, reply) => {
      const tokenPayload = await validateAndExtractUserToken(req, reply);
      if (!tokenPayload?.sub) {
        return reply.code(401).send();
      }

      return reply.download(req.params.id, req.query.filename ?? undefined);
    }
  );

  // Upload import path
  server.post<{ Params: { entityName: string } }>("/uploads/:entityName", async (req, reply) => {
    const tokenPayload = await validateAndExtractUserToken(req, reply);
    if (!tokenPayload) {
      return reply.code(401).send();
    }
    const loggedUser = getLoggedUser(tokenPayload);
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
        uploadId
      })
    );
  });

  // GraphQL server
  await apolloServer.start();
  void server.register(
    apolloServer.createHandler({
      path: "graphql",
      cors: false // Need to set to false otherwise it conflicts with the one defined as middleware above
    })
  );

  await server.listen(options.listenPort, options.listenAddress);

  // Handle shutdown request gracefully
  // This is used when inside a container
  // See https://emmer.dev/blog/you-don-t-need-an-init-system-for-node.js-in-docker/
  // Alternative is to use --init flag
  const shutdown = () => {
    logger.info("Shutdown requested");
    server.close(() => {
      logger.info("Web server has been shut down");
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})().catch((e) => {
  logger.error(e);
});
