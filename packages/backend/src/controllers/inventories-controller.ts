import {
  getInventoriesQueryParamsSchema,
  getInventoriesResponse,
  getInventoryIndexParamsSchema,
  getInventoryIndexResponse,
  getInventoryResponse,
  upsertInventoryInput,
  upsertInventoryResponse,
} from "@ou-ca/common/api/inventory";
import { type InventoryExtended } from "@ou-ca/common/entities/inventory";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Inventaire } from "../repositories/inventaire/inventaire-repository-types.js";
import { type Services } from "../services/services.js";
import { type LoggedUser } from "../types/User.js";
import { OucaError } from "../utils/errors.js";
import { getPaginationMetadata } from "./controller-utils.js";
import { enrichedLocality } from "./localities-controller.js";

export const enrichedInventory = async (
  services: Services,
  inventory: Inventaire,
  user: LoggedUser | null
): Promise<InventoryExtended> => {
  const [observer, associates, locality, weathers] = await Promise.all([
    services.observateurService.findObservateurOfInventaireId(parseInt(inventory.id), user),
    services.observateurService.findAssociesOfInventaireId(parseInt(inventory.id), user),
    services.lieuditService.findLieuDitOfInventaireId(parseInt(inventory.id), user),
    services.meteoService.findMeteosOfInventaireId(parseInt(inventory.id), user),
  ]);

  if (!observer || !locality) {
    return Promise.reject("Missing data for enriched inventory");
  }

  const localityEnriched = await enrichedLocality(services, locality, user);

  return {
    ...inventory,
    observer,
    associates,
    locality: localityEnriched,
    weathers,
  };
};

const inventoriesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { inventaireService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const inventory = await inventaireService.findInventaire(req.params.id, req.user);
    if (!inventory) {
      return await reply.status(404).send();
    }

    try {
      const inventoryEnriched = await enrichedInventory(services, inventory, req.user);
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
      return await reply.status(400).send(parsedQueryParamsResult.error.issues);
    }

    const inventoryIndex = await inventaireService.findInventoryIndex(
      req.params.id,
      parsedQueryParamsResult.data,
      req.user
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
      return await reply.status(400).send(parsedQueryParamsResult.error.issues);
    }

    const { data: queryParams } = parsedQueryParamsResult;

    const [inventoriesData, count] = await Promise.all([
      inventaireService.findPaginatedInventaires(req.user, queryParams),
      inventaireService.getInventairesCount(req.user),
    ]);

    // TODO look to optimize this request
    const enrichedInventories = await Promise.all(
      inventoriesData.map(async (inventoryData) => {
        return enrichedInventory(services, inventoryData, req.user);
      })
    );

    const response = getInventoriesResponse.parse({
      data: enrichedInventories,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertInventoryInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send(parsedInputResult.error);
    }

    const { data: input } = parsedInputResult;

    // eslint-disable-next-line no-useless-catch
    try {
      const inventory = await inventaireService.createInventaire(input, req.user);
      const inventoryEnriched = await enrichedInventory(services, inventory, req.user);
      const response = upsertInventoryResponse.parse(inventoryEnriched);

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
      return await reply.status(400).send(parsedInputResult.error);
    }

    const { data: input } = parsedInputResult;

    // eslint-disable-next-line no-useless-catch
    try {
      const inventory = await inventaireService.updateInventaire(req.params.id, input, req.user);
      const inventoryEnriched = await enrichedInventory(services, inventory, req.user);
      const response = upsertInventoryResponse.parse(inventoryEnriched);

      return await reply.send(response);
    } catch (e) {
      // TODO handle duplicate inventory
      // rome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  });

  fastify.delete<{
    Params: {
      id: string;
    };
  }>("/:id", async (req, reply) => {
    try {
      const { id: deletedId } = await inventaireService.deleteInventory(req.params.id, req.user);
      return await reply.send({ id: deletedId });
    } catch (e) {
      if (e instanceof NotFoundError) {
        return await reply.status(404).send();
      } else if (e instanceof OucaError && e.name === "OUCA0001") {
        return await reply.status(403).send();
      } else if (e instanceof OucaError && e.name === "OUCA0005") {
        return await reply.status(409).send("This inventory is still used by existing entries");
      }
      throw e;
    }
  });

  done();
};

export default inventoriesController;
