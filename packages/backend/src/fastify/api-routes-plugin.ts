import { type FastifyPluginAsync } from "fastify";
import ageController from "../controllers/age-controller.js";
import behaviorController from "../controllers/behavior-controller.js";
import classController from "../controllers/class-controller.js";
import departmentController from "../controllers/department-controller.js";
import distanceEstimateController from "../controllers/distance-estimate-controller.js";
import entryController from "../controllers/entry-controller.js";
import environmentController from "../controllers/environment-controller.js";
import generateExportController from "../controllers/generate-export-controllers.js";
import localityController from "../controllers/locality-controller.js";
import numberEstimateController from "../controllers/number-estimate-controller.js";
import observerController from "../controllers/observer-controller.js";
import sexController from "../controllers/sex-controller.js";
import speciesController from "../controllers/species-controller.js";
import townController from "../controllers/town-controller.js";
import userController from "../controllers/user-controller.js";
import weatherController from "../controllers/weather-controller.js";
import { type Services } from "../services/services.js";
import handleAuthorizationHook from "./handle-authorization-hook.js";

const apiRoutesPlugin: FastifyPluginAsync<{ services: Services }> = async (fastify, { services }) => {
  // API needs authentication/authorization
  fastify.decorateRequest("user", null);
  fastify.addHook("onRequest", async (request, reply) => {
    await handleAuthorizationHook(request, reply, services);
  });

  await fastify.register(ageController, { services, prefix: "/age" });
  await fastify.register(behaviorController, { services, prefix: "/behavior" });
  await fastify.register(classController, { services, prefix: "/class" });
  await fastify.register(departmentController, { services, prefix: "/department" });
  await fastify.register(distanceEstimateController, { services, prefix: "/distance-estimate" });
  await fastify.register(entryController, { services, prefix: "/entry" });
  await fastify.register(environmentController, { services, prefix: "/environment" });
  await fastify.register(localityController, { services, prefix: "/locality" });
  await fastify.register(numberEstimateController, { services, prefix: "/number-estimate" });
  await fastify.register(observerController, { services, prefix: "/observer" });
  await fastify.register(sexController, { services, prefix: "/sex" });
  await fastify.register(speciesController, { services, prefix: "/species" });
  await fastify.register(townController, { services, prefix: "/town" });
  await fastify.register(weatherController, { services, prefix: "/weather" });

  await fastify.register(userController, { services, prefix: "/user" });

  await fastify.register(generateExportController, { services, prefix: "/generate-export" });
};

export default apiRoutesPlugin;
