import { upsertEntryInput, upsertEntryResponse } from "@ou-ca/common/api/entry";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const entryController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { donneeService } = services;

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertEntryInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const entry = await donneeService.createDonnee(input, req.user);
      const response = upsertEntryResponse.parse(entry);

      return await reply.send(response);
    } catch (e) {
      if (e instanceof OucaError && e.name === "OUCA0004") {
        return await reply.status(409).send();
      }
      throw e;
    }
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertEntryInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const entry = await donneeService.updateDonnee(req.params.id, input, req.user);
      const response = upsertEntryResponse.parse(entry);

      return await reply.send(response);
    } catch (e) {
      if (e instanceof OucaError && e.name === "OUCA0004") {
        return await reply.status(409).send();
      }
      throw e;
    }
  });

  fastify.get("/last", async (req, reply) => {
    const id = await donneeService.findLastDonneeId(req.user);
    await reply.send({ id });
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    try {
      const { id: deletedId } = await donneeService.deleteDonnee(req.params.id, req.user);
      return await reply.send({ id: deletedId });
    } catch (e) {
      if (e instanceof NotFoundError) {
        return await reply.status(404).send();
      }
      throw e;
    }
  });

  fastify.get("/next-regroupment", async (req, reply) => {
    const id = await donneeService.findNextRegroupement(req.user);
    await reply.send({ id });
  });

  done();
};

export default entryController;
