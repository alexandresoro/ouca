import type {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import type { Logger } from "pino";
import { logger as loggerParent } from "../../utils/logger.js";
import type { Services } from "../services/services.js";
import { apiRoutes } from "./api-routes.js";
import { downloadController } from "./controllers/download-controller.js";
import { userController } from "./controllers/user-controller.js";
import { importRoutes } from "./import-routes.js";

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

  await server.register(importRoutes, { services });
  logger.debug("Fastify static routes added");
};
