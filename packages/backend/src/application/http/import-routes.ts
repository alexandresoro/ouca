import { IMPORT_TYPE } from "@ou-ca/common/import/import-types";
import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";
import { startImportTask } from "../../services/import-manager.js";
import type { Services } from "../services/services.js";
import { handleAuthorizationHook } from "./hooks/handle-authorization-hook.js";

export const importRoutes: FastifyPluginCallback<{ services: Services }> = (fastify, { services }, done) => {
  // Import needs authentication/authorization
  fastify.decorateRequest("user", null);
  fastify.addHook("onRequest", async (request, reply) => {
    await handleAuthorizationHook(request, reply, services);
  });

  fastify.get<{ Params: { id: string }; Querystring: { filename?: string } }>(
    "/download/importReports/:id",
    async (req, reply) => {
      return reply.download(req.params.id, req.query.filename ?? undefined);
    },
  );

  // Upload import path
  fastify.post("/uploads/:entityName", async (req, reply) => {
    if (!req.user) {
      return reply.code(401).send();
    }

    // Check that the import is a known one
    const parsedQueryResult = z
      .object({
        entityName: z.enum(IMPORT_TYPE),
      })
      .safeParse(req.params);

    if (!parsedQueryResult.success) {
      return reply.code(404).send();
    }

    const entityName = parsedQueryResult.data.entityName;

    const data = await req.file();
    if (!data) {
      return reply.code(400).send();
    }

    const uploadId = await services.importService.handleUpload(await data.toBuffer(), entityName, req.user);

    startImportTask(uploadId, entityName, req.user);

    await reply.send(
      JSON.stringify({
        uploadId,
      }),
    );
  });

  // Import progress report
  fastify.get("/import-status/:importId", async (req, reply) => {
    if (!req.user) {
      return reply.code(401).send();
    }

    const parsedQueryResult = z
      .object({
        importId: z.string().uuid(),
      })
      .safeParse(req.params);

    if (!parsedQueryResult.success) {
      return reply.code(404).send();
    }

    const importId = parsedQueryResult.data.importId;

    await services.importService.getImportStatus(importId, req.user);

    return reply.status(501).send();
  });

  done();
};
