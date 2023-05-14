import { type UpsertWeatherInput } from "@ou-ca/common/api/weather";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type QueryMeteosArgs } from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type Meteo, type MeteoCreateInput } from "../../repositories/meteo/meteo-repository-types.js";
import { type MeteoRepository } from "../../repositories/meteo/meteo-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { getSqlPagination } from "./entities-utils.js";

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

  const findMeteosIdsOfInventaireId = async (inventaireId: number): Promise<number[]> => {
    const meteosIds = await meteoRepository
      .findMeteosOfInventaireId(inventaireId)
      .then((meteos) => meteos.map(({ id }) => id));

    return [...meteosIds];
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

  const createMeteo = async (input: UpsertWeatherInput, loggedUser: LoggedUser | null): Promise<Meteo> => {
    validateAuthorization(loggedUser);

    // Create a new weather
    try {
      const upsertedMeteo = await meteoRepository.createMeteo({
        ...input,
        owner_id: loggedUser?.id,
      });

      return upsertedMeteo;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateMeteo = async (id: number, input: UpsertWeatherInput, loggedUser: LoggedUser | null): Promise<Meteo> => {
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
      const upsertedMeteo = await meteoRepository.updateMeteo(id, input);

      return upsertedMeteo;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
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
