import { type AccessFailureReason } from "@domain/shared/failure-reason.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type WeatherCreateInput, type WeatherFailureReason } from "@domain/weather/weather.js";
import { type WeatherRepository } from "@interfaces/weather-repository-interface.js";
import { type Weather } from "@ou-ca/common/api/entities/weather";
import { type UpsertWeatherInput, type WeathersSearchParams } from "@ou-ca/common/api/weather";
import { type Result, err, ok } from "neverthrow";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../../../services/entities/entities-utils.js";

type WeatherServiceDependencies = {
  weatherRepository: WeatherRepository;
  entryRepository: DonneeRepository;
};

export const buildWeatherService = ({ weatherRepository, entryRepository }: WeatherServiceDependencies) => {
  const findWeather = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Weather | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const weather = await weatherRepository.findWeatherById(id);
    return ok(enrichEntityWithEditableStatus(weather, loggedUser));
  };

  const getEntriesCountByWeather = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.getCountByMeteoId(Number.parseInt(id)));
  };

  const findWeathersOfInventoryId = async (
    inventoryId: number | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Weather[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const weathers = await weatherRepository.findWeathersByInventoryId(inventoryId);

    const enrichedWeathers = weathers.map((weather) => {
      return enrichEntityWithEditableStatus(weather, loggedUser);
    });

    return ok([...enrichedWeathers]);
  };

  const findWeatherIdsOfInventoryId = async (inventoryId: number): Promise<string[]> => {
    const meteosIds = await weatherRepository
      .findWeathersByInventoryId(inventoryId)
      .then((weathers) => weathers.map(({ id }) => id));

    return [...meteosIds];
  };

  const findAllWeathers = async (): Promise<Weather[]> => {
    const weathers = await weatherRepository.findWeathers({
      orderBy: "libelle",
    });

    const enrichedWeathers = weathers.map((weather) => {
      return enrichEntityWithEditableStatus(weather, null);
    });

    return [...enrichedWeathers];
  };

  const findPaginatedWeathers = async (
    loggedUser: LoggedUser | null,
    options: WeathersSearchParams,
  ): Promise<Result<Weather[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const weathers = await weatherRepository.findWeathers({
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
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await weatherRepository.getCount(q));
  };

  const createWeather = async (
    input: UpsertWeatherInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Weather, WeatherFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Create a new weather
    const createdWeatherResult = await weatherRepository.createWeather({
      ...input,
      ownerId: loggedUser?.id,
    });

    return createdWeatherResult.map((createdWeather) => {
      return enrichEntityWithEditableStatus(createdWeather, loggedUser);
    });
  };

  const updateWeather = async (
    id: number,
    input: UpsertWeatherInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Weather, WeatherFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await weatherRepository.findWeatherById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    // Update an existing weather
    const updatedWeatherResult = await weatherRepository.updateWeather(id, input);

    return updatedWeatherResult.map((updatedWeather) => {
      return enrichEntityWithEditableStatus(updatedWeather, loggedUser);
    });
  };

  const deleteWeather = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Weather | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await weatherRepository.findWeatherById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    const deletedWeather = await weatherRepository.deleteWeatherById(id);
    return ok(deletedWeather ? enrichEntityWithEditableStatus(deletedWeather, loggedUser) : null);
  };

  const createWeathers = async (
    weathers: Omit<WeatherCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<Weather[]> => {
    const createdWeathers = await weatherRepository.createWeathers(
      weathers.map((weather) => {
        return { ...weather, ownerId: loggedUser.id };
      }),
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
