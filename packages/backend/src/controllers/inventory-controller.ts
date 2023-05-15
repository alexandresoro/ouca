import { upsertInventoryInput, upsertInventoryResponse } from "@ou-ca/common/api/inventory";
import { type FastifyPluginCallback } from "fastify";
import { type Services } from "../services/services.js";

const inventoryController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { inventaireService } = services;

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertInventoryInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    // eslint-disable-next-line no-useless-catch
    try {
      const inventory = await inventaireService.createInventaire(input, req.user);
      const response = upsertInventoryResponse.parse(inventory);

      return await reply.send(response);
    } catch (e) {
      // TODO handle duplicate inventory
      // rome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertInventoryInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    // eslint-disable-next-line no-useless-catch
    try {
      const inventory = await inventaireService.updateInventaire(req.params.id, input, req.user);
      const response = upsertInventoryResponse.parse(inventory);

      return await reply.send(response);
    } catch (e) {
      // TODO handle duplicate inventory
      // rome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  });

  done();
};

export default inventoryController;
