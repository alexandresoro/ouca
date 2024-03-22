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
import { Result } from "neverthrow";
import type { Services } from "../services/services.js";
import { logger } from "../utils/logger.js";
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
    const inventoryResult = await inventoryService.findInventory(req.params.id, req.user);

    if (inventoryResult.isErr()) {
      switch (inventoryResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: inventoryResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const inventory = inventoryResult.value;

    if (!inventory) {
      return await reply.status(404).send();
    }

    const inventoryEnrichedResult = await enrichedInventory(services, inventory, req.user);

    if (inventoryEnrichedResult.isErr()) {
      switch (inventoryEnrichedResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "extendedDataNotFound":
          return await reply.status(404).send();
        default:
          logger.error({ error: inventoryEnrichedResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = getInventoryResponse.parse(inventoryEnrichedResult.value);
    return await reply.send(response);
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

    const inventoryIndexResult = await inventoryService.findInventoryIndex(
      `${req.params.id}`,
      parsedQueryParamsResult.data,
      req.user,
    );

    if (inventoryIndexResult.isErr()) {
      switch (inventoryIndexResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: inventoryIndexResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const inventoryIndex = inventoryIndexResult.value;

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

    const paginatedResults = Result.combine([
      await inventoryService.findPaginatedInventories(req.user, queryParams),
      await inventoryService.getInventoriesCount(req.user),
    ]);

    if (paginatedResults.isErr()) {
      switch (paginatedResults.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: paginatedResults.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const [inventoriesData, count] = paginatedResults.value;

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

    const inventoryResult = await inventoryService.createInventory(input, req.user);

    // TODO handle duplicate inventory
    if (inventoryResult.isErr()) {
      switch (inventoryResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "requiredDataNotFound":
          return await reply.status(422).send();
        default:
          logger.error({ error: inventoryResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const inventory = inventoryResult.value;

    const inventoryEnrichedResult = await enrichedInventory(services, inventory, req.user);

    if (inventoryEnrichedResult.isErr()) {
      switch (inventoryEnrichedResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "extendedDataNotFound":
          return await reply.status(404).send();
        default:
          logger.error({ error: inventoryEnrichedResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const inventoryEnriched = inventoryEnrichedResult.value;

    const response = upsertInventoryResponse.parse(inventoryEnriched);
    return await reply.send(response);
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

    const inventoryResult = await inventoryService.updateInventory(`${req.params.id}`, input, req.user);

    if (inventoryResult.isErr()) {
      switch (inventoryResult.error.type) {
        case "notAllowed":
          return await reply.status(403).send();
        case "requiredDataNotFound":
          return await reply.status(422).send();
        case "similarInventoryAlreadyExists":
          // TODO handle duplicate inventory on caller side
          return await reply
            .status(409)
            .send({ correspondingInventoryFound: inventoryResult.error.correspondingInventoryFound });
        default:
          logger.error({ error: inventoryResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const inventory = inventoryResult.value;

    const inventoryEnrichedResult = await enrichedInventory(services, inventory, req.user);

    if (inventoryEnrichedResult.isErr()) {
      switch (inventoryEnrichedResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "extendedDataNotFound":
          return await reply.status(404).send();
        default:
          logger.error({ error: inventoryEnrichedResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const inventoryEnriched = inventoryEnrichedResult.value;

    const response = upsertInventoryResponse.parse(inventoryEnriched);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: string;
    };
  }>("/:id", async (req, reply) => {
    const deletedInventoryResult = await inventoryService.deleteInventory(req.params.id, req.user);

    if (deletedInventoryResult.isErr()) {
      switch (deletedInventoryResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "inventoryStillInUse":
          return await reply.status(409).send();
        default:
          logger.error({ error: deletedInventoryResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const deletedInventory = deletedInventoryResult.value;

    if (!deletedInventory) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedInventory.id });
  });

  done();
};

export default inventoriesController;
