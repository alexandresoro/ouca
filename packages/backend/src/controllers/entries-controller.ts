import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { entryNavigationSchema, type Entry, type EntryExtended } from "@ou-ca/common/api/entities/entry";
import {
  getEntriesExtendedResponse,
  getEntriesQueryParamsSchema,
  getEntriesResponse,
  getEntryResponse,
  upsertEntryInput,
  upsertEntryResponse,
  type GetEntryResponse,
} from "@ou-ca/common/api/entry";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Donnee } from "../repositories/donnee/donnee-repository-types.js";
import { type Services } from "../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";
import { enrichedInventory } from "./inventories-controller.js";

const enrichedEntry = async (services: Services, entry: Donnee, user: LoggedUser | null): Promise<GetEntryResponse> => {
  const [age, behaviors, species, distanceEstimate, numberEstimate, environments, sex] = await Promise.all([
    (await services.ageService.findAgeOfEntryId(entry.id, user))._unsafeUnwrap(),
    services.behaviorService.findBehaviorsOfEntryId(entry.id, user),
    services.speciesService.findSpeciesOfEntryId(entry.id, user),
    (await services.distanceEstimateService.findDistanceEstimateOfEntryId(entry.id, user))._unsafeUnwrap(),
    (await services.numberEstimateService.findNumberEstimateOfEntryId(entry.id, user))._unsafeUnwrap(),
    services.environmentService.findEnvironmentsOfEntryId(entry.id, user),
    (await services.sexService.findSexOfEntryId(entry.id, user))._unsafeUnwrap(),
  ]);

  if (!age || !species || !numberEstimate || !sex) {
    return Promise.reject("Missing data for enriched entry");
  }

  return {
    ...entry,
    id: `${entry.id}`,
    inventoryId: `${entry.inventaireId}`,
    age,
    behaviors,
    species,
    distanceEstimate,
    numberEstimate,
    environments,
    sex,
    comment: entry.commentaire,
    number: entry.nombre,
    regroupment: entry.regroupement,
  };
};

const entriesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { entryService, inventoryService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const entry = await entryService.findDonnee(req.params.id, req.user);
    if (!entry) {
      return await reply.status(404).send();
    }

    try {
      const entryEnriched = await enrichedEntry(services, entry, req.user);
      const response = getEntryResponse.parse(entryEnriched);
      return await reply.send(response);
    } catch (e) {
      return await reply.status(404).send();
    }
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getEntriesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [entriesData, count] = await Promise.all([
      entryService.findPaginatedDonnees(req.user, queryParams),
      entryService.getDonneesCount(req.user, queryParams),
    ]);

    // TODO look to optimize this request
    const enrichedEntries = await Promise.all(
      entriesData.map(async (entryData) => {
        return enrichedEntry(services, entryData, req.user);
      })
    );

    let data: Entry[] | EntryExtended[] = enrichedEntries;
    if (extended) {
      data = await Promise.all(
        enrichedEntries.map(async (enrichedEntryData) => {
          // TODO look to optimize this request
          const inventory = await inventoryService.findInventaireOfDonneeId(enrichedEntryData.id, req.user);
          if (!inventory) {
            return Promise.reject("No matching inventory found");
          }

          const inventoryEnriched = await enrichedInventory(services, inventory, req.user);
          return {
            ...enrichedEntryData,
            inventory: inventoryEnriched,
          };
        })
      );
    }

    const responseParser = extended ? getEntriesExtendedResponse : getEntriesResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertEntryInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const entry = await entryService.createDonnee(input, req.user);
      const entryEnriched = await enrichedEntry(services, entry, req.user);
      const response = upsertEntryResponse.parse(entryEnriched);

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
      id: string;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertEntryInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const entry = await entryService.updateDonnee(req.params.id, input, req.user);
      const entryEnriched = await enrichedEntry(services, entry, req.user);
      const response = upsertEntryResponse.parse(entryEnriched);

      return await reply.send(response);
    } catch (e) {
      if (e instanceof OucaError && e.name === "OUCA0004") {
        return await reply.status(409).send();
      }
      throw e;
    }
  });

  fastify.get("/last", async (req, reply) => {
    const id = await entryService.findLastDonneeId(req.user);
    await reply.send({ id });
  });

  fastify.get<{
    Params: {
      id: string;
    };
  }>("/:id/navigation", async (req, reply) => {
    const navigation = await entryService.findDonneeNavigationData(req.user, req.params.id);
    const response = entryNavigationSchema.parse(navigation);

    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    try {
      const { id: deletedId } = await entryService.deleteDonnee(req.params.id, req.user);
      return await reply.send({ id: deletedId });
    } catch (e) {
      if (e instanceof NotFoundError) {
        return await reply.status(404).send();
      }
      throw e;
    }
  });

  fastify.get("/next-regroupment", async (req, reply) => {
    const id = await entryService.findNextRegroupement(req.user);
    await reply.send({ id });
  });

  done();
};

export default entriesController;
