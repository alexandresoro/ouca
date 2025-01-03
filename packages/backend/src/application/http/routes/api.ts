import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyPluginAsync } from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { logger as loggerParent } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";
import { apiV1Routes } from "../api-routes.js";
import { userController } from "../controllers/user-controller.js";

const logger = loggerParent.child({ module: "fastify" });

const V1_PREFIX = "/v1";

export const apiRoutes: FastifyPluginAsync<{ services: Services }> = async (fastify, { services }) => {
  // Zod type provider
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.setErrorHandler((error, _, reply) => {
    if (error instanceof ZodError) {
      // Treat validation errors as HTTP 422
      reply.status(422).send({
        statusCode: fastify.httpErrors.unprocessableEntity().statusCode,
        error: fastify.httpErrors.unprocessableEntity().message,
        issues: error.issues,
      });
      return;
    }

    reply.send(error);
  });

  // OpenAPI spec
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.1.1",
      info: {
        title: "Ou ca API",
        version: "1.0.0",
        description: "",
      },
      components: {
        securitySchemes: {
          token: {
            type: "http",
            scheme: "bearer",
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  // OpenAPI spec for API
  await fastify.register(fastifySwaggerUi);

  await fastify.register(apiV1Routes, { services, prefix: V1_PREFIX });
  await fastify.register(userController, { services, prefix: `${V1_PREFIX}/user` });
  logger.debug("Fastify API routes registered");
};
