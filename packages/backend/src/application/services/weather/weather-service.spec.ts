import { weatherCreateInputFactory } from "@fixtures/domain/species-class/species-class.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { weatherFactory } from "@fixtures/domain/weather/weather.fixtures.js";
import { upsertWeatherInputFactory } from "@fixtures/services/weather/weather-service.fixtures.js";
import { type WeatherRepository } from "@interfaces/weather-repository-interface.js";
import { type WeathersSearchParams } from "@ou-ca/common/api/weather";
import { err, ok } from "neverthrow";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildWeatherService } from "./weather-service.js";

const weatherRepository = mockVi<WeatherRepository>();
const entryRepository = mockVi<DonneeRepository>();

const weatherService = buildWeatherService({
  weatherRepository,
  entryRepository,
});

describe("Find weather", () => {
  test("should handle a matching weather", async () => {
    const weatherData = weatherFactory.build();
    const loggedUser = loggedUserFactory.build();

    weatherRepository.findWeatherById.mockResolvedValueOnce(weatherData);

    await weatherService.findWeather(12, loggedUser);

    expect(weatherRepository.findWeatherById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findWeatherById).toHaveBeenLastCalledWith(12);
  });

  test("should handle weather not found", async () => {
    weatherRepository.findWeatherById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(weatherService.findWeather(10, loggedUser)).resolves.toEqual(ok(null));

    expect(weatherRepository.findWeatherById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findWeatherById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await weatherService.findWeather(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(weatherRepository.findWeatherById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await weatherService.getEntriesCountByWeather("12", loggedUser);

    expect(entryRepository.getCountByMeteoId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByMeteoId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await weatherService.getEntriesCountByWeather("12", null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Find weathers by inventary ID", () => {
  test("should handle observer found", async () => {
    const weathersData = weatherFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    weatherRepository.findWeathersByInventoryId.mockResolvedValueOnce(weathersData);

    const weathersResult = await weatherService.findWeathersOfInventoryId(43, loggedUser);

    expect(weatherRepository.findWeathersByInventoryId).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findWeathersByInventoryId).toHaveBeenLastCalledWith(43);
    expect(weathersResult.isOk()).toBeTruthy();
    expect(weathersResult._unsafeUnwrap().length).toEqual(weathersData.length);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await weatherService.findWeathersOfInventoryId(12, null);

    expect(findResult).toEqual(err("notAllowed"));
  });
});

test("Find all weathers", async () => {
  const weathersData = weatherFactory.buildList(3);

  weatherRepository.findWeathers.mockResolvedValueOnce(weathersData);

  await weatherService.findAllWeathers();

  expect(weatherRepository.findWeathers).toHaveBeenCalledTimes(1);
  expect(weatherRepository.findWeathers).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const weathersData = weatherFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    weatherRepository.findWeathers.mockResolvedValueOnce(weathersData);

    await weatherService.findPaginatedWeathers(loggedUser, {});

    expect(weatherRepository.findWeathers).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findWeathers).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated weathers", async () => {
    const weathersData = weatherFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: WeathersSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    weatherRepository.findWeathers.mockResolvedValueOnce([weathersData[0]]);

    await weatherService.findPaginatedWeathers(loggedUser, searchParams);

    expect(weatherRepository.findWeathers).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findWeathers).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await weatherService.findPaginatedWeathers(null, {});

    expect(entitiesPaginatedResult).toEqual(err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await weatherService.getWeathersCount(loggedUser);

    expect(weatherRepository.getCount).toHaveBeenCalledTimes(1);
    expect(weatherRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await weatherService.getWeathersCount(loggedUser, "test");

    expect(weatherRepository.getCount).toHaveBeenCalledTimes(1);
    expect(weatherRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await weatherService.getWeathersCount(null);

    expect(entitiesCountResult).toEqual(err("notAllowed"));
  });
});

describe("Update of an weather", () => {
  test("should be allowed when requested by an admin", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    weatherRepository.updateWeather.mockResolvedValueOnce(ok(weatherFactory.build()));

    await weatherService.updateWeather(12, weatherData, loggedUser);

    expect(weatherRepository.updateWeather).toHaveBeenCalledTimes(1);
    expect(weatherRepository.updateWeather).toHaveBeenLastCalledWith(12, weatherData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = weatherFactory.build({
      ownerId: "notAdmin",
    });

    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    weatherRepository.findWeatherById.mockResolvedValueOnce(existingData);
    weatherRepository.updateWeather.mockResolvedValueOnce(ok(weatherFactory.build()));

    await weatherService.updateWeather(12, weatherData, loggedUser);

    expect(weatherRepository.updateWeather).toHaveBeenCalledTimes(1);
    expect(weatherRepository.updateWeather).toHaveBeenLastCalledWith(12, weatherData);
  });

  test("should not be allowed when requested by an use that is nor owner nor admin", async () => {
    const existingData = weatherFactory.build({
      ownerId: "notAdmin",
    });

    const weatherData = upsertWeatherInputFactory.build();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    weatherRepository.findWeatherById.mockResolvedValueOnce(existingData);

    const updateResult = await weatherService.updateWeather(12, weatherData, user);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(weatherRepository.updateWeather).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to an weather that exists", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    weatherRepository.updateWeather.mockResolvedValueOnce(err("alreadyExists"));

    const updateResult = await weatherService.updateWeather(12, weatherData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(weatherRepository.updateWeather).toHaveBeenCalledTimes(1);
    expect(weatherRepository.updateWeather).toHaveBeenLastCalledWith(12, weatherData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const updateResult = await weatherService.updateWeather(12, weatherData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(weatherRepository.updateWeather).not.toHaveBeenCalled();
  });
});

describe("Creation of an weather", () => {
  test("should create new weather", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    weatherRepository.createWeather.mockResolvedValueOnce(ok(weatherFactory.build()));

    await weatherService.createWeather(weatherData, loggedUser);

    expect(weatherRepository.createWeather).toHaveBeenCalledTimes(1);
    expect(weatherRepository.createWeather).toHaveBeenLastCalledWith({
      ...weatherData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create an weather that already exists", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    weatherRepository.createWeather.mockResolvedValueOnce(err("alreadyExists"));

    const createResult = await weatherService.createWeather(weatherData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(weatherRepository.createWeather).toHaveBeenCalledTimes(1);
    expect(weatherRepository.createWeather).toHaveBeenLastCalledWith({
      ...weatherData,
      ownerId: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const createResult = await weatherService.createWeather(weatherData, null);

    expect(createResult).toEqual(err("notAllowed"));
    expect(weatherRepository.createWeather).not.toHaveBeenCalled();
  });
});

describe("Deletion of an weather", () => {
  test("should handle the deletion of an owned weather", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
      role: "contributor",
    });

    const weather = weatherFactory.build({
      ownerId: loggedUser.id,
    });

    weatherRepository.findWeatherById.mockResolvedValueOnce(weather);

    await weatherService.deleteWeather(11, loggedUser);

    expect(weatherRepository.deleteWeatherById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.deleteWeatherById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any weather if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    weatherRepository.findWeatherById.mockResolvedValueOnce(weatherFactory.build());

    await weatherService.deleteWeather(11, loggedUser);

    expect(weatherRepository.deleteWeatherById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.deleteWeatherById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when trying to delete a non-owned weather as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const deleteResult = await weatherService.deleteWeather(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(weatherRepository.deleteWeatherById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await weatherService.deleteWeather(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(weatherRepository.deleteWeatherById).not.toHaveBeenCalled();
  });
});

test("Create multiple weathers", async () => {
  const weathersData = weatherCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  weatherRepository.createWeathers.mockResolvedValueOnce([]);

  await weatherService.createWeathers(weathersData, loggedUser);

  expect(weatherRepository.createWeathers).toHaveBeenCalledTimes(1);
  expect(weatherRepository.createWeathers).toHaveBeenLastCalledWith(
    weathersData.map((weather) => {
      return {
        ...weather,
        ownerId: loggedUser.id,
      };
    })
  );
});
