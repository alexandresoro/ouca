import { OucaError } from "@domain/errors/ouca-error.js";
import { type UpsertWeatherInput, type WeathersSearchParams } from "@ou-ca/common/api/weather";
import { type Weather } from "@ou-ca/common/entities/weather";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type MeteoCreateInput } from "../../repositories/meteo/meteo-repository-types.js";
import { type MeteoRepository } from "../../repositories/meteo/meteo-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { validateAuthorization } from "./authorization-utils.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";

type MeteoServiceDependencies = {
  logger: Logger;
  meteoRepository: MeteoRepository;
  donneeRepository: DonneeRepository;
};

export const buildMeteoService = ({ meteoRepository, donneeRepository }: MeteoServiceDependencies) => {
  const findMeteo = async (id: number, loggedUser: LoggedUser | null): Promise<Weather | null> => {
    validateAuthorization(loggedUser);

    const weather = await meteoRepository.findMeteoById(id);
    return enrichEntityWithEditableStatus(weather, loggedUser);
  };

  const getDonneesCountByMeteo = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByMeteoId(parseInt(id));
  };

  const findMeteosOfInventaireId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Weather[]> => {
    validateAuthorization(loggedUser);

    const meteos = await meteoRepository.findMeteosOfInventaireId(inventaireId);

    const enrichedWeathers = meteos.map((weather) => {
      return enrichEntityWithEditableStatus(weather, loggedUser);
    });

    return [...enrichedWeathers];
  };

  const findMeteosIdsOfInventaireId = async (inventaireId: number): Promise<string[]> => {
    const meteosIds = await meteoRepository
      .findMeteosOfInventaireId(inventaireId)
      .then((meteos) => meteos.map(({ id }) => id));

    return [...meteosIds];
  };

  const findAllMeteos = async (): Promise<Weather[]> => {
    const meteos = await meteoRepository.findMeteos({
      orderBy: COLUMN_LIBELLE,
    });

    const enrichedWeathers = meteos.map((weather) => {
      return enrichEntityWithEditableStatus(weather, null);
    });

    return [...enrichedWeathers];
  };

  const findPaginatedMeteos = async (
    loggedUser: LoggedUser | null,
    options: WeathersSearchParams
  ): Promise<Weather[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const meteos = await meteoRepository.findMeteos({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedWeathers = meteos.map((weather) => {
      return enrichEntityWithEditableStatus(weather, loggedUser);
    });

    return [...enrichedWeathers];
  };

  const getMeteosCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return meteoRepository.getCount(q);
  };

  const createMeteo = async (input: UpsertWeatherInput, loggedUser: LoggedUser | null): Promise<Weather> => {
    validateAuthorization(loggedUser);

    // Create a new weather
    try {
      const createdMeteo = await meteoRepository.createMeteo({
        ...input,
        owner_id: loggedUser?.id,
      });

      return enrichEntityWithEditableStatus(createdMeteo, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateMeteo = async (
    id: number,
    input: UpsertWeatherInput,
    loggedUser: LoggedUser | null
  ): Promise<Weather> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await meteoRepository.findMeteoById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing weather
    try {
      const updatedMeteo = await meteoRepository.updateMeteo(id, input);

      return enrichEntityWithEditableStatus(updatedMeteo, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteMeteo = async (id: number, loggedUser: LoggedUser | null): Promise<Weather> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await meteoRepository.findMeteoById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedMeteo = await meteoRepository.deleteMeteoById(id);
    return enrichEntityWithEditableStatus(deletedMeteo, loggedUser);
  };

  const createMeteos = async (
    meteos: Omit<MeteoCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Weather[]> => {
    const createdWeathers = await meteoRepository.createMeteos(
      meteos.map((meteo) => {
        return { ...meteo, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedWeathers = createdWeathers.map((weather) => {
      return enrichEntityWithEditableStatus(weather, loggedUser);
    });

    return enrichedCreatedWeathers;
  };

  return {
    findMeteo,
    getDonneesCountByMeteo,
    findMeteosOfInventaireId,
    findMeteosIdsOfInventaireId,
    findAllMeteos,
    findPaginatedMeteos,
    getMeteosCount,
    createMeteo,
    updateMeteo,
    deleteMeteo,
    createMeteos,
  };
};

export type MeteoService = ReturnType<typeof buildMeteoService>;
