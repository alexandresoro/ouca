import {
  getInventoriesQueryParamsSchema,
  getInventoriesResponse,
  getInventoryIndexParamsSchema,
  getInventoryIndexResponse,
  getInventoryResponse,
  upsertInventoryInput,
  upsertInventoryResponse,
} from "@ou-ca/common/api/inventory";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { logger } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";
import { enrichedInventory } from "./inventories-enricher.js";

export const inventoriesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { inventoryService } = services;

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: string;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Inventory"],
      },
    },
    async (req, reply) => {
      const inventoryResult = await inventoryService.findInventory(req.params.id, req.user);

      if (inventoryResult.isErr()) {
        switch (inventoryResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
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
        }
      }

      const response = getInventoryResponse.parse(inventoryEnrichedResult.value);
      return await reply.send(response);
    },
  );

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>(
    "/:id/index",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Inventory"],
      },
    },
    async (req, reply) => {
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
        }
      }

      const inventoryIndex = inventoryIndexResult.value;

      if (inventoryIndex == null) {
        return await reply.status(404).send();
      }
      const response = getInventoryIndexResponse.parse(inventoryIndex);
      return await reply.send(response);
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Inventory"],
      },
    },
    async (req, reply) => {
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
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Inventory"],
      },
    },
    async (req, reply) => {
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
        }
      }

      const inventoryEnriched = inventoryEnrichedResult.value;

      const response = upsertInventoryResponse.parse(inventoryEnriched);
      return await reply.send(response);
    },
  );

  fastify.put<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Inventory"],
      },
    },
    async (req, reply) => {
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
        }
      }

      const inventoryEnriched = inventoryEnrichedResult.value;

      const response = upsertInventoryResponse.parse(inventoryEnriched);
      return await reply.send(response);
    },
  );

  fastify.delete<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: string;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Inventory"],
      },
    },
    async (req, reply) => {
      const deletedInventoryResult = await inventoryService.deleteInventory(req.params.id, req.user);

      if (deletedInventoryResult.isErr()) {
        switch (deletedInventoryResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "inventoryStillInUse":
            return await reply.status(409).send();
        }
      }

      const deletedInventory = deletedInventoryResult.value;

      if (!deletedInventory) {
        return await reply.status(404).send();
      }

      return await reply.send({ id: deletedInventory.id });
    },
  );

  done();
};
