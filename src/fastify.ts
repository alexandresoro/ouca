import fastifyCompress from "@fastify/compress";
import { fastifyCookie } from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import { fastifyStatic } from "@fastify/static";
import fastify, { type FastifyInstance } from "fastify";
import { NoSchemaIntrospectionCustomRule } from "graphql";
import mercurius from "mercurius";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { buildGraphQLContext } from "./graphql/graphql-context";
import { logQueries, logResults } from "./graphql/mercurius-logger";
import { buildResolvers } from "./graphql/resolvers";
import { IMPORT_TYPE, type ImportType } from "./model/import-types";
import { startImportTask } from "./services/import-manager";
import { type Services } from "./services/services";
import { DOWNLOAD_ENDPOINT, IMPORTS_DIR_PATH, PUBLIC_DIR_PATH } from "./utils/paths";

export const buildServer = async (services: Services): Promise<FastifyInstance> => {
  // Server
  const server = fastify({
    logger: services.logger,
  });

  // Middlewares
  await server.register(fastifyMultipart);
  await server.register(fastifyCookie);
  await server.register(fastifyCompress);
  await server.register(fastifyCors, {
    origin: true,
    credentials: true,
    maxAge: 3600,
  });

  services.logger.debug("Fastify middlewares successfully registered");

  // Static files server
  await server.register(fastifyStatic, {
    root: PUBLIC_DIR_PATH,
    prefix: DOWNLOAD_ENDPOINT,
  });

  services.logger.debug("Fastify static server successfully registered");

  // Mercurius GraphQL adapter

  // Parse GraphQL schema
  const graphQLSchema = fs.readFileSync(path.join(__dirname, "model/schema.graphql"), "utf-8").toString();
  services.logger.debug("GraphQL schema has been parsed");

  await server.register(mercurius, {
    schema: graphQLSchema,
    resolvers: buildResolvers(services),
    context: buildGraphQLContext({ tokenService: services.tokenService }),
    validationRules: process.env.NODE_ENV === "production" ? [NoSchemaIntrospectionCustomRule] : [],
  });
  server.graphql.addHook("preExecution", logQueries);
  server.graphql.addHook("onResolution", logResults);
  services.logger.debug("Mercurius GraphQL adapter successfully registered");

  return server;
};

export const registerFastifyRoutes = (server: FastifyInstance, services: Services): void => {
  const { tokenService } = services;

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

  services.logger.debug("Fastify routes added");
};
