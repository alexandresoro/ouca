import {
  getInventoryResponse,
  upsertInventoryInput,
  upsertInventoryResponse,
  type GetInventoryResponse,
} from "@ou-ca/common/api/inventory";
import { type FastifyPluginCallback } from "fastify";
import { type Services } from "../services/services.js";
import { reshapeLocalityRepositoryToApi } from "./localities-controller.js";

const inventoriesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { inventaireService, observateurService, lieuditService, meteoService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const inventory = await inventaireService.findInventaire(req.params.id, req.user);
    if (!inventory) {
      return await reply.status(404).send();
    }

    // Enrich inventory
    const [observer, associates, locality, weathers] = await Promise.all([
      observateurService.findObservateurOfInventaireId(inventory.id, req.user),
      observateurService.findAssociesOfInventaireId(inventory.id, req.user),
      lieuditService.findLieuDitOfInventaireId(inventory.id, req.user),
      meteoService.findMeteosOfInventaireId(inventory.id, req.user),
    ]);

    if (!observer || !locality) {
      return await reply.status(404).send();
    }

    const enrichedInventory = {
      ...inventory,
      id: `${inventory.id}`,
      // TODO Remove this later
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      observer: {
        ...observer,
        id: `${observer.id}`,
      },
      // TODO Remove this later
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      associates: associates.map((associate) => {
        return {
          ...associate,
          id: `${associate.id}`,
        };
      }),
      locality: reshapeLocalityRepositoryToApi(locality),
      // TODO Remove this later
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      weathers: weathers.map((weather) => {
        return {
          ...weather,
          id: `${weather.id}`,
        };
      }),
    } satisfies GetInventoryResponse;

    const response = getInventoryResponse.parse(enrichedInventory);
    return await reply.send(response);
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
