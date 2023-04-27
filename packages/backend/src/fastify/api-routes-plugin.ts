import { type FastifyPluginAsync } from "fastify";
import { type Services } from "../services/services.js";
import handleAuthorizationPlugin from "./handle-authorization-plugin.js";

const apiRoutesPlugin: FastifyPluginAsync<{ services: Services }> = async (fastify, { services }) => {
  // Authorization middleware on API routes
  await fastify.register(handleAuthorizationPlugin, { services });

  // await fastify.register(entryController, { services, prefix: "/entry" });
};

export default apiRoutesPlugin;
