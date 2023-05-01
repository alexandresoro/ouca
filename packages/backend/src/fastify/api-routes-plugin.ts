import { type FastifyPluginAsync } from "fastify";
import entryController from "../controllers/entry-controller.js";
import observerController from "../controllers/observer-controller.js";
import userController from "../controllers/user-controller.js";
import { type Services } from "../services/services.js";

const apiRoutesPlugin: FastifyPluginAsync<{ services: Services }> = async (fastify, { services }) => {
  await fastify.register(entryController, { services, prefix: "/entry" });
  await fastify.register(observerController, { services, prefix: "/observer" });
  await fastify.register(userController, { services, prefix: "/user" });
};

export default apiRoutesPlugin;
