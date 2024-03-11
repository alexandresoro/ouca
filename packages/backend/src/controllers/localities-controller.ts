import { OucaError } from "@domain/errors/ouca-error.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
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
import type { Services } from "../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const enrichedLocality = async (
  services: Services,
  locality: Locality,
  user: LoggedUser | null,
): Promise<Omit<LocalityExtended, "inventoriesCount" | "entriesCount">> => {
  const town = (await services.townService.findTownOfLocalityId(locality.id, user))._unsafeUnwrap();
  const department = town
    ? (await services.departmentService.findDepartmentOfTownId(town.id, user))._unsafeUnwrap()
    : null;

  if (!town || !department) {
    return Promise.reject("Missing data for enriched locality");
  }

  return {
    ...locality,
    townCode: town.code,
    townName: town.nom,
    departmentCode: department.code,
  };
};

const localitiesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { localityService, townService, departmentService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const locality = await localityService.findLocality(req.params.id, req.user);
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

    const [localitiesData, count] = await Promise.all([
      localityService.findPaginatedLocalities(req.user, queryParams),
      localityService.getLocalitiesCount(req.user, queryParams),
    ]);

    let data: Locality[] | LocalityExtended[] = localitiesData;
    if (extended) {
      data = await Promise.all(
        localitiesData.map(async (localityData) => {
          // TODO look to optimize this request
          const town = (await townService.findTownOfLocalityId(localityData.id, req.user))._unsafeUnwrap();
          const department = town
            ? (await departmentService.findDepartmentOfTownId(town.id, req.user))._unsafeUnwrap()
            : null;
          const inventoriesCount = await localityService.getInventoriesCountByLocality(localityData.id, req.user);
          const entriesCount = await localityService.getEntriesCountByLocality(localityData.id, req.user);
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

    try {
      const locality = await localityService.createLocality(input, req.user);
      const response = upsertLocalityResponse.parse(locality);

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
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertLocalityInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const locality = await localityService.updateLocality(req.params.id, input, req.user);
      const response = upsertLocalityResponse.parse(locality);

      return await reply.send(response);
    } catch (e) {
      if (e instanceof OucaError && e.name === "OUCA0004") {
        return await reply.status(409).send();
      }
      throw e;
    }
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedLocality = await localityService.deleteLocality(req.params.id, req.user);

    if (!deletedLocality) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedLocality.id });
  });

  done();
};

export default localitiesController;
