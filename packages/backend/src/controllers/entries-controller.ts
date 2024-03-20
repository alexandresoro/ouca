import { type Entry, type EntryExtended, entryNavigationSchema } from "@ou-ca/common/api/entities/entry";
import {
  getEntriesExtendedResponse,
  getEntriesQueryParamsSchema,
  getEntriesResponse,
  getEntryResponse,
  upsertEntryInput,
  upsertEntryResponse,
} from "@ou-ca/common/api/entry";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import type { Services } from "../services/services.js";
import { logger } from "../utils/logger.js";
import { getPaginationMetadata } from "./controller-utils.js";
import { enrichedEntry } from "./entries-enricher.js";
import { enrichedInventory } from "./inventories-enricher.js";

const entriesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { entryService, inventoryService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const entryResult = await entryService.findDonnee(req.params.id, req.user);

    if (entryResult.isErr()) {
      switch (entryResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: entryResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const entry = entryResult.value;

    if (!entry) {
      return await reply.status(404).send();
    }

    const entryEnrichedResult = await enrichedEntry(services, entry, req.user);

    if (entryEnrichedResult.isErr()) {
      switch (entryEnrichedResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "extendedDataNotFound":
          return await reply.status(404).send();
        default:
          logger.error({ error: entryEnrichedResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = getEntryResponse.parse(entryEnrichedResult.value);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getEntriesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await entryService.findPaginatedDonnees(req.user, queryParams),
      await entryService.getDonneesCount(req.user, queryParams),
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

    const [entriesData, count] = paginatedResults.value;

    // TODO look to optimize this request
    const enrichedEntriesResults = await Promise.all(
      entriesData.map(async (entryData) => {
        return enrichedEntry(services, entryData, req.user);
      }),
    );

    const enrichedEntries = enrichedEntriesResults.map((enrichedEntryResult) => enrichedEntryResult._unsafeUnwrap());

    let data: Entry[] | EntryExtended[] = enrichedEntries;
    if (extended) {
      data = await Promise.all(
        enrichedEntries.map(async (enrichedEntryData) => {
          // TODO look to optimize this request
          const inventory = (
            await inventoryService.findInventoryOfEntryId(enrichedEntryData.id, req.user)
          )._unsafeUnwrap();
          if (!inventory) {
            return Promise.reject("No matching inventory found");
          }

          const inventoryEnriched = (await enrichedInventory(services, inventory, req.user))._unsafeUnwrap();
          return {
            ...enrichedEntryData,
            inventory: inventoryEnriched,
          };
        }),
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

    const entryResult = await entryService.createDonnee(input, req.user);

    if (entryResult.isErr()) {
      switch (entryResult.error.type) {
        case "notAllowed":
          return await reply.status(403).send();
        case "similarEntryAlreadyExists":
          return await reply.status(409).send({
            correspondingEntryFound: entryResult.error.correspondingEntryFound,
          });
        default:
          logger.error({ error: entryResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const entry = entryResult.value;

    const entryEnrichedResult = await enrichedEntry(services, entry, req.user);

    if (entryEnrichedResult.isErr()) {
      switch (entryEnrichedResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "extendedDataNotFound":
          return await reply.status(404).send();
        default:
          logger.error({ error: entryEnrichedResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const entryEnriched = entryEnrichedResult.value;

    const response = upsertEntryResponse.parse(entryEnriched);
    return await reply.send(response);
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

    const entryResult = await entryService.updateDonnee(req.params.id, input, req.user);

    if (entryResult.isErr()) {
      switch (entryResult.error.type) {
        case "notAllowed":
          return await reply.status(403).send();
        case "similarEntryAlreadyExists":
          return await reply.status(409).send({
            correspondingEntryFound: entryResult.error.correspondingEntryFound,
          });
        default:
          logger.error({ error: entryResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const entry = entryResult.value;

    const entryEnrichedResult = await enrichedEntry(services, entry, req.user);

    if (entryEnrichedResult.isErr()) {
      switch (entryEnrichedResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "extendedDataNotFound":
          return await reply.status(404).send();
        default:
          logger.error({ error: entryEnrichedResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const entryEnriched = entryEnrichedResult.value;

    const response = upsertEntryResponse.parse(entryEnriched);
    return await reply.send(response);
  });

  fastify.get("/last", async (req, reply) => {
    const idResult = await entryService.findLastDonneeId(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: idResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    await reply.send({ id: idResult.value });
  });

  fastify.get<{
    Params: {
      id: string;
    };
  }>("/:id/navigation", async (req, reply) => {
    const navigationResult = await entryService.findDonneeNavigationData(req.user, req.params.id);

    if (navigationResult.isErr()) {
      switch (navigationResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: navigationResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = entryNavigationSchema.parse(navigationResult.value);

    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: string | number;
    };
  }>("/:id", async (req, reply) => {
    const deletedEntryResult = await entryService.deleteDonnee(`${req.params.id}`, req.user);

    if (deletedEntryResult.isErr()) {
      switch (deletedEntryResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: deletedEntryResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const deletedEntry = deletedEntryResult.value;

    if (!deletedEntry) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedEntry.id });
  });

  fastify.get("/next-regroupment", async (req, reply) => {
    const idResult = await entryService.findNextRegroupement(req.user);

    if (idResult.isErr()) {
      switch (idResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: idResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    await reply.send({ id: idResult.value });
  });

  done();
};

export default entriesController;
