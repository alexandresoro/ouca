import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type MutationUpsertMeteoArgs, type QueryMeteosArgs } from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type MeteoRepository } from "../../repositories/meteo/meteo-repository";
import { type Meteo, type MeteoCreateInput } from "../../repositories/meteo/meteo-repository-types";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination } from "./entities-utils";

type MeteoServiceDependencies = {
  logger: Logger;
  meteoRepository: MeteoRepository;
  donneeRepository: DonneeRepository;
};

export const buildMeteoService = ({ meteoRepository, donneeRepository }: MeteoServiceDependencies) => {
  const findMeteo = async (id: number, loggedUser: LoggedUser | null): Promise<Meteo | null> => {
    validateAuthorization(loggedUser);

    return meteoRepository.findMeteoById(id);
  };

  const getDonneesCountByMeteo = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByMeteoId(id);
  };

  const findMeteosOfInventaireId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Meteo[]> => {
    validateAuthorization(loggedUser);

    const meteos = await meteoRepository.findMeteosOfInventaireId(inventaireId);

    return [...meteos];
  };

  const findAllMeteos = async (): Promise<Meteo[]> => {
    const meteos = await meteoRepository.findMeteos({
      orderBy: COLUMN_LIBELLE,
    });

    return [...meteos];
  };

  const findPaginatedMeteos = async (
    loggedUser: LoggedUser | null,
    options: QueryMeteosArgs = {}
  ): Promise<Meteo[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, orderBy: orderByField, sortOrder } = options;

    const meteos = await meteoRepository.findMeteos({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...meteos];
  };

  const getMeteosCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return meteoRepository.getCount(q);
  };

  const upsertMeteo = async (args: MutationUpsertMeteoArgs, loggedUser: LoggedUser | null): Promise<Meteo> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedMeteo: Meteo;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser.role !== "admin") {
        const existingData = await meteoRepository.findMeteoById(id);

        if (existingData?.ownerId !== loggedUser.id) {
          throw new OucaError("OUCA0001");
        }
      }

      // Update an existing weather
      try {
        upsertedMeteo = await meteoRepository.updateMeteo(id, data);
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      // Create a new weather
      try {
        upsertedMeteo = await meteoRepository.createMeteo({
          ...data,
          owner_id: loggedUser?.id,
        });
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    }

    return upsertedMeteo;
  };

  const deleteMeteo = async (id: number, loggedUser: LoggedUser | null): Promise<Meteo> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await meteoRepository.findMeteoById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return meteoRepository.deleteMeteoById(id);
  };

  const createMeteos = async (
    meteos: Omit<MeteoCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Meteo[]> => {
    return meteoRepository.createMeteos(
      meteos.map((meteo) => {
        return { ...meteo, owner_id: loggedUser.id };
      })
    );
  };

  return {
    findMeteo,
    getDonneesCountByMeteo,
    findMeteosOfInventaireId,
    findAllMeteos,
    findPaginatedMeteos,
    getMeteosCount,
    upsertMeteo,
    deleteMeteo,
    createMeteos,
  };
};

export type MeteoService = ReturnType<typeof buildMeteoService>;
