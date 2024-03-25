import { IMPORT_TYPE, type ImportType } from "@ou-ca/common/import/import-types";
import type { FastifyPluginCallback } from "fastify";
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
  fastify.post<{ Params: { entityName: string } }>("/uploads/:entityName", async (req, reply) => {
    if (!req.user) {
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

    const uploadId = await services.importService.handleUpload(
      await data.toBuffer(),
      params.entityName as ImportType,
      req.user,
    );

    startImportTask(uploadId, params.entityName as ImportType, req.user);

    await reply.send(
      JSON.stringify({
        uploadId,
      }),
    );
  });

  done();
};
