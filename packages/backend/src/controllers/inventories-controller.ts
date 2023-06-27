import { getInventoryResponse, upsertInventoryInput, upsertInventoryResponse } from "@ou-ca/common/api/inventory";
import { type InventoryExtended } from "@ou-ca/common/entities/inventory";
import { type FastifyPluginCallback } from "fastify";
import { type Inventaire } from "../repositories/inventaire/inventaire-repository-types.js";
import { type Services } from "../services/services.js";
import { type LoggedUser } from "../types/User.js";
import { enrichedLocality } from "./localities-controller.js";

export const enrichedInventory = async (
  services: Services,
  inventory: Inventaire,
  user: LoggedUser | null
): Promise<InventoryExtended> => {
  const [observer, associates, locality, weathers] = await Promise.all([
    services.observateurService.findObservateurOfInventaireId(inventory.id, user),
    services.observateurService.findAssociesOfInventaireId(inventory.id, user),
    services.lieuditService.findLieuDitOfInventaireId(inventory.id, user),
    services.meteoService.findMeteosOfInventaireId(inventory.id, user),
  ]);

  if (!observer || !locality) {
    return Promise.reject("Missing data for enriched inventory");
  }

  const localityEnriched = await enrichedLocality(services, locality, user);

  return {
    ...inventory,
    id: `${inventory.id}`,
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

export default inventoriesController;
