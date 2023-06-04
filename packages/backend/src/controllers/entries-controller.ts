import {
  getEntryResponse,
  upsertEntryInput,
  upsertEntryResponse,
  type GetEntryResponse,
} from "@ou-ca/common/api/entry";
import { entryNavigationSchema } from "@ou-ca/common/entities/entry";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const entriesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const {
    donneeService,
    ageService,
    comportementService,
    especeService,
    estimationDistanceService,
    estimationNombreService,
    milieuService,
    sexeService,
  } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const entry = await donneeService.findDonnee(req.params.id, req.user);
    if (!entry) {
      return await reply.status(404).send();
    }

    // Enrich entry
    const [age, behaviors, species, distanceEstimate, numberEstimate, environments, sex] = await Promise.all([
      ageService.findAgeOfDonneeId(entry.id, req.user),
      comportementService.findComportementsOfDonneeId(entry.id, req.user),
      especeService.findEspeceOfDonneeId(entry.id, req.user),
      estimationDistanceService.findEstimationDistanceOfDonneeId(entry.id, req.user),
      estimationNombreService.findEstimationNombreOfDonneeId(entry.id, req.user),
      milieuService.findMilieuxOfDonneeId(entry.id, req.user),
      sexeService.findSexeOfDonneeId(entry.id, req.user),
    ]);

    if (!age || !species || !numberEstimate || !sex) {
      return await reply.status(404).send();
    }

    const enrichedEntry = {
      ...entry,
      id: `${entry.id}`,
      inventoryId: `${entry.inventaireId}`,
      age: {
        ...age,
        id: `${age.id}`,
      },
      behaviors: behaviors.map((behavior) => {
        return {
          ...behavior,
          id: `${behavior.id}`,
        };
      }),
      species: {
        ...species,
        id: `${species.id}`,
        classId: species.classeId ? `${species.classeId}` : "",
      },
      distanceEstimate:
        distanceEstimate != null
          ? {
              ...distanceEstimate,
              id: `${distanceEstimate.id}`,
            }
          : null,
      numberEstimate: {
        ...numberEstimate,
        id: `${numberEstimate.id}`,
      },
      environments: environments.map((environment) => {
        return {
          ...environment,
          id: `${environment.id}`,
        };
      }),
      sex: {
        ...sex,
        id: `${sex.id}`,
      },
      comment: entry.commentaire,
      number: entry.nombre,
      regroupment: entry.regroupement,
    } satisfies GetEntryResponse;

    const response = getEntryResponse.parse(enrichedEntry);
    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertEntryInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const entry = await donneeService.createDonnee(input, req.user);
      const response = upsertEntryResponse.parse(entry);

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
    const parsedInputResult = upsertEntryInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const entry = await donneeService.updateDonnee(req.params.id, input, req.user);
      const response = upsertEntryResponse.parse(entry);

      return await reply.send(response);
    } catch (e) {
      if (e instanceof OucaError && e.name === "OUCA0004") {
        return await reply.status(409).send();
      }
      throw e;
    }
  });

  fastify.get("/last", async (req, reply) => {
    const id = await donneeService.findLastDonneeId(req.user);
    await reply.send({ id });
  });

  fastify.get<{
    Params: {
      id: string;
    };
  }>("/:id/navigation", async (req, reply) => {
    const navigation = await donneeService.findDonneeNavigationData(req.user, req.params.id);
    const response = entryNavigationSchema.parse(navigation);

    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    try {
      const { id: deletedId } = await donneeService.deleteDonnee(req.params.id, req.user);
      return await reply.send({ id: deletedId });
    } catch (e) {
      if (e instanceof NotFoundError) {
        return await reply.status(404).send();
      }
      throw e;
    }
  });

  fastify.get("/next-regroupment", async (req, reply) => {
    const id = await donneeService.findNextRegroupement(req.user);
    await reply.send({ id });
  });

  done();
};

export default entriesController;
