import {
  getEntriesQueryParamsSchema,
  getEntriesResponse,
  getEntryResponse,
  upsertEntryInput,
  upsertEntryResponse,
} from "@ou-ca/common/api/entry";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";
import { enrichedEntry } from "./entries-enricher.js";

export const entriesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { entryService } = services;

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
        tags: ["Entry"],
      },
    },
    async (req, reply) => {
      const entryResult = await entryService.findEntry(req.params.id, req.user);

      if (entryResult.isErr()) {
        switch (entryResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
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
        }
      }

      const response = getEntryResponse.parse(entryEnrichedResult.value);
      return await reply.send(response);
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Entry"],
        querystring: getEntriesQueryParamsSchema,
      },
    },
    async (req, reply) => {
      const parsedQueryParamsResult = getEntriesQueryParamsSchema.safeParse(req.query);

      if (!parsedQueryParamsResult.success) {
        return await reply.status(422).send(parsedQueryParamsResult.error.issues);
      }

      const { data: queryParams } = parsedQueryParamsResult;

      if (queryParams.fromAllUsers && !req.user?.permissions.canViewAllEntries) {
        return await reply.status(403).send();
      }

      const paginatedResults = Result.combine([
        await entryService.findPaginatedEntries(req.user, queryParams),
        await entryService.getEntriesCount(req.user, queryParams),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.status(403).send();
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

      const response = getEntriesResponse.parse({
        data: enrichedEntries,
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
        tags: ["Entry"],
        body: upsertEntryInput,
      },
    },
    async (req, reply) => {
      const parsedInputResult = upsertEntryInput.safeParse(req.body);

      if (!parsedInputResult.success) {
        return await reply.status(422).send();
      }

      const { data: input } = parsedInputResult;

      const entryResult = await entryService.createEntry(input, req.user);

      if (entryResult.isErr()) {
        switch (entryResult.error.type) {
          case "notAllowed":
            return await reply.status(403).send();
          case "similarEntryAlreadyExists":
            return await reply.status(409).send({
              correspondingEntryFound: entryResult.error.correspondingEntryFound,
            });
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
        }
      }

      const entryEnriched = entryEnrichedResult.value;

      const response = upsertEntryResponse.parse(entryEnriched);
      return await reply.send(response);
    },
  );

  fastify.put<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: string;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Entry"],
        body: upsertEntryInput,
      },
    },
    async (req, reply) => {
      const parsedInputResult = upsertEntryInput.safeParse(req.body);

      if (!parsedInputResult.success) {
        return await reply.status(422).send();
      }

      const { data: input } = parsedInputResult;

      const entryResult = await entryService.updateEntry(req.params.id, input, req.user);

      if (entryResult.isErr()) {
        switch (entryResult.error.type) {
          case "notAllowed":
            return await reply.status(403).send();
          case "similarEntryAlreadyExists":
            return await reply.status(409).send({
              correspondingEntryFound: entryResult.error.correspondingEntryFound,
            });
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
        }
      }

      const entryEnriched = entryEnrichedResult.value;

      const response = upsertEntryResponse.parse(entryEnriched);
      return await reply.send(response);
    },
  );

  fastify.delete<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: string | number;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Entry"],
      },
    },
    async (req, reply) => {
      const deletedEntryResult = await entryService.deleteEntry(`${req.params.id}`, req.user);

      if (deletedEntryResult.isErr()) {
        switch (deletedEntryResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const deletedEntry = deletedEntryResult.value;

      if (!deletedEntry) {
        return await reply.status(404).send();
      }

      return await reply.send({ id: deletedEntry.id });
    },
  );

  done();
};
