/* eslint-disable import/no-named-as-default */
import fastifyCompress from "@fastify/compress";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifyUnderPressure from "@fastify/under-pressure";
import { buildBullBoardAdapter } from "@infrastructure/bullmq/bullboard.js";
import type { Queues } from "@infrastructure/bullmq/queues.js";
import fastify, {
  type FastifyInstance,
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerDefault,
} from "fastify";
import type { Logger } from "pino";
import { logger as loggerParent } from "../../utils/logger.js";
import { DOWNLOAD_ENDPOINT, IMPORT_REPORTS_DIR, IMPORT_REPORTS_DIR_PATH } from "../../utils/paths.js";
import { sentryPlugin } from "./sentry-plugin.js";

export const buildServer = async (
  queues: Queues,
): Promise<
  FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    Logger
  >
> => {
  const logger = loggerParent.child({ module: "fastify" });

  // Server
  const server = fastify.default({
    logger: loggerParent,
    trustProxy: true,
  });

  // Middlewares
  await server.register(fastifyMultipart);
  await server.register(fastifyCompress);
  await server.register(fastifyCors, {
    origin: true,
    credentials: true,
    maxAge: 3600,
    exposedHeaders: ["Location"],
  });
  await server.register(fastifyUnderPressure, {
    exposeStatusRoute: "/healthz",
  });

  logger.debug("Fastify middlewares successfully registered");

  // Remove default text/plain parser
  // https://fastify.dev/docs/latest/Reference/ContentTypeParser/
  server.removeContentTypeParser(["text/plain"]);

  // Static files server
  await server.register(fastifyStatic, {
    root: IMPORT_REPORTS_DIR_PATH.pathname,
    prefix: `${DOWNLOAD_ENDPOINT}/${IMPORT_REPORTS_DIR}`,
  });

  logger.debug("Fastify static server successfully registered");

  // BullBoard
  const serverAdapter = buildBullBoardAdapter(queues);
  await server.register(serverAdapter.registerPlugin(), { basePath: "/jobs", prefix: "/jobs" });
  logger.debug("BullBoard successfully registered");

  await server.register(sentryPlugin);

  return server;
};