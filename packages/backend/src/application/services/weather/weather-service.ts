import { type AccessFailureReason } from "@domain/shared/failure-reason.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type WeatherFailureReason } from "@domain/weather/weather.js";
import { type Weather } from "@ou-ca/common/api/entities/weather";
import { type UpsertWeatherInput, type WeathersSearchParams } from "@ou-ca/common/api/weather";
import { err, ok, type Result } from "neverthrow";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type MeteoCreateInput } from "../../../repositories/meteo/meteo-repository-types.js";
import { type MeteoRepository } from "../../../repositories/meteo/meteo-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../../../services/entities/entities-utils.js";

type WeatherServiceDependencies = {
  weatherRepository: MeteoRepository;
  entryRepository: DonneeRepository;
};

export const buildWeatherService = ({ weatherRepository, entryRepository }: WeatherServiceDependencies) => {
  const findWeather = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<Weather | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const weather = await weatherRepository.findMeteoById(id);
    return ok(enrichEntityWithEditableStatus(weather, loggedUser));
  };

  const getEntriesCountByWeather = async (
    id: string,
    loggedUser: LoggedUser | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByMeteoId(parseInt(id)));
  };

  const findWeathersOfInventoryId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Result<Weather[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const weathers = await weatherRepository.findMeteosOfInventaireId(inventaireId);

    const enrichedWeathers = weathers.map((weather) => {
      return enrichEntityWithEditableStatus(weather, loggedUser);
    });

    return ok([...enrichedWeathers]);
  };

  const findWeatherIdsOfInventoryId = async (inventaireId: number): Promise<string[]> => {
    const meteosIds = await weatherRepository
      .findMeteosOfInventaireId(inventaireId)
      .then((weathers) => weathers.map(({ id }) => id));

    return [...meteosIds];
  };

  const findAllWeathers = async (): Promise<Weather[]> => {
    const weathers = await weatherRepository.findMeteos({
      orderBy: "libelle",
    });

    const enrichedWeathers = weathers.map((weather) => {
      return enrichEntityWithEditableStatus(weather, null);
    });

    return [...enrichedWeathers];
  };

  const findPaginatedWeathers = async (
    loggedUser: LoggedUser | null,
    options: WeathersSearchParams
  ): Promise<Result<Weather[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const weathers = await weatherRepository.findMeteos({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedWeathers = weathers.map((weather) => {
      return enrichEntityWithEditableStatus(weather, loggedUser);
    });

    return ok([...enrichedWeathers]);
  };

  const getWeathersCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await weatherRepository.getCount(q));
  };

  const createWeather = async (
    input: UpsertWeatherInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<Weather, WeatherFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Create a new weather
    try {
      const createdMeteo = await weatherRepository.createMeteo({
        ...input,
        owner_id: loggedUser?.id,
      });

      return ok(enrichEntityWithEditableStatus(createdMeteo, loggedUser));
    } catch (e) {
      return err("alreadyExists");
    }
  };

  const updateWeather = async (
    id: number,
    input: UpsertWeatherInput,
    loggedUser: LoggedUser | null
  ): Promise<Result<Weather, WeatherFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await weatherRepository.findMeteoById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    // Update an existing weather
    try {
      const updatedMeteo = await weatherRepository.updateMeteo(id, input);

      return ok(enrichEntityWithEditableStatus(updatedMeteo, loggedUser));
    } catch (e) {
      return err("alreadyExists");
    }
  };

  const deleteWeather = async (
    id: number,
    loggedUser: LoggedUser | null
  ): Promise<Result<Weather, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await weatherRepository.findMeteoById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    const deletedMeteo = await weatherRepository.deleteMeteoById(id);
    return ok(enrichEntityWithEditableStatus(deletedMeteo, loggedUser));
  };

  const createWeathers = async (
    weathers: Omit<MeteoCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Weather[]> => {
    const createdWeathers = await weatherRepository.createMeteos(
      weathers.map((weather) => {
        return { ...weather, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedWeathers = createdWeathers.map((weather) => {
      return enrichEntityWithEditableStatus(weather, loggedUser);
    });

    return enrichedCreatedWeathers;
  };

  return {
    findWeather,
    getEntriesCountByWeather,
    findWeathersOfInventoryId,
    findWeatherIdsOfInventoryId,
    findAllWeathers,
    findPaginatedWeathers,
    getWeathersCount,
    createWeather,
    updateWeather,
    deleteWeather,
    createWeathers,
  };
};

export type WeatherService = ReturnType<typeof buildWeatherService>;
