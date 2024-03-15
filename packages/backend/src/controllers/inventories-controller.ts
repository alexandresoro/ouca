import { OucaError } from "@domain/errors/ouca-error.js";
import {
  getInventoriesQueryParamsSchema,
  getInventoriesResponse,
  getInventoryIndexParamsSchema,
  getInventoryIndexResponse,
  getInventoryResponse,
  upsertInventoryInput,
  upsertInventoryResponse,
} from "@ou-ca/common/api/inventory";
import type { FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import type { Services } from "../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";
import { enrichedInventory } from "./inventories-enricher.js";

const inventoriesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { inventoryService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const inventory = await inventoryService.findInventaire(req.params.id, req.user);
    if (!inventory) {
      return await reply.status(404).send();
    }

    try {
      const inventoryEnriched = (await enrichedInventory(services, inventory, req.user))._unsafeUnwrap();
      const response = getInventoryResponse.parse(inventoryEnriched);
      return await reply.send(response);
    } catch (e) {
      return await reply.status(404).send();
    }
  });

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id/index", async (req, reply) => {
    const parsedQueryParamsResult = getInventoryIndexParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const inventoryIndex = await inventoryService.findInventoryIndex(
      req.params.id,
      parsedQueryParamsResult.data,
      req.user,
    );
    if (inventoryIndex == null) {
      return await reply.status(404).send();
    }
    const response = getInventoryIndexResponse.parse(inventoryIndex);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getInventoriesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const { data: queryParams } = parsedQueryParamsResult;

    const [inventoriesData, count] = await Promise.all([
      inventoryService.findPaginatedInventaires(req.user, queryParams),
      inventoryService.getInventairesCount(req.user),
    ]);

    // TODO look to optimize this request
    const enrichedInventoriesResults = await Promise.all(
      inventoriesData.map(async (inventoryData) => {
        return enrichedInventory(services, inventoryData, req.user);
      }),
    );

    const response = getInventoriesResponse.parse({
      data: enrichedInventoriesResults.map((enrichedInventoryResult) => enrichedInventoryResult._unsafeUnwrap()),
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertInventoryInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send(parsedInputResult.error);
    }

    const { data: input } = parsedInputResult;

    // eslint-disable-next-line no-useless-catch
    try {
      const inventory = await inventoryService.createInventaire(input, req.user);
      const inventoryEnriched = (await enrichedInventory(services, inventory, req.user))._unsafeUnwrap();
      const response = upsertInventoryResponse.parse(inventoryEnriched);

      return await reply.send(response);
    } catch (e) {
      // TODO handle duplicate inventory
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertInventoryInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send(parsedInputResult.error);
    }

    const { data: input } = parsedInputResult;

    // eslint-disable-next-line no-useless-catch
    try {
      const inventory = await inventoryService.updateInventaire(req.params.id, input, req.user);
      const inventoryEnriched = (await enrichedInventory(services, inventory, req.user))._unsafeUnwrap();
      const response = upsertInventoryResponse.parse(inventoryEnriched);

      return await reply.send(response);
    } catch (e) {
      // TODO handle duplicate inventory
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  });

  fastify.delete<{
    Params: {
      id: string;
    };
  }>("/:id", async (req, reply) => {
    try {
      const { id: deletedId } = await inventoryService.deleteInventory(req.params.id, req.user);
      return await reply.send({ id: deletedId });
    } catch (e) {
      if (e instanceof NotFoundError) {
        return await reply.status(404).send();
        // biome-ignore lint/style/noUselessElse: <explanation>
      } else if (e instanceof OucaError && e.name === "OUCA0001") {
        return await reply.status(403).send();
        // biome-ignore lint/style/noUselessElse: <explanation>
      } else if (e instanceof OucaError && e.name === "OUCA0005") {
        return await reply.status(409).send("This inventory is still used by existing entries");
      }
      throw e;
    }
  });

  done();
};

export default inventoriesController;
