import type { Locality, LocalityExtended } from "@ou-ca/common/api/entities/locality";
import {
  getLocalitiesExtendedResponse,
  getLocalitiesQueryParamsSchema,
  getLocalitiesResponse,
  getLocalityResponse,
  upsertLocalityInput,
  upsertLocalityResponse,
} from "@ou-ca/common/api/locality";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const localitiesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { localityService, townService, departmentService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const localityResult = await localityService.findLocality(req.params.id, req.user);

    if (localityResult.isErr()) {
      switch (localityResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const locality = localityResult.value;

    if (!locality) {
      return await reply.status(404).send();
    }

    const response = getLocalityResponse.parse(locality);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getLocalitiesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await localityService.findPaginatedLocalities(req.user, queryParams),
      await localityService.getLocalitiesCount(req.user, queryParams),
    ]);

    if (paginatedResults.isErr()) {
      switch (paginatedResults.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [localitiesData, count] = paginatedResults.value;

    let data: Locality[] | LocalityExtended[] = localitiesData;
    if (extended) {
      data = await Promise.all(
        localitiesData.map(async (localityData) => {
          // TODO look to optimize this request
          const town = (await townService.findTownOfLocalityId(localityData.id, req.user))._unsafeUnwrap();
          const department = town
            ? (await departmentService.findDepartmentOfTownId(town.id, req.user))._unsafeUnwrap()
            : null;
          const inventoriesCount = (
            await localityService.getInventoriesCountByLocality(localityData.id, req.user)
          )._unsafeUnwrap();
          const entriesCount = (
            await localityService.getEntriesCountByLocality(localityData.id, req.user)
          )._unsafeUnwrap();
          return {
            ...localityData,
            townCode: town?.code,
            townName: town?.nom,
            departmentCode: department?.code,
            inventoriesCount,
            entriesCount,
          };
        }),
      );
    }

    const responseParser = extended ? getLocalitiesExtendedResponse : getLocalitiesResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertLocalityInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const localityCreateResult = await localityService.createLocality(input, req.user);

    if (localityCreateResult.isErr()) {
      switch (localityCreateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertLocalityResponse.parse(localityCreateResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertLocalityInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const localityUpdateResult = await localityService.updateLocality(req.params.id, input, req.user);

    if (localityUpdateResult.isErr()) {
      switch (localityUpdateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertLocalityResponse.parse(localityUpdateResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedLocalityResult = await localityService.deleteLocality(req.params.id, req.user);

    if (deletedLocalityResult.isErr()) {
      switch (deletedLocalityResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const deletedLocality = deletedLocalityResult.value;

    if (!deletedLocality) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedLocality.id });
  });

  done();
};
