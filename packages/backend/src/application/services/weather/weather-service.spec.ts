import { weatherCreateInputFactory } from "@fixtures/domain/species-class/species-class.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { weatherFactory } from "@fixtures/domain/weather/weather.fixtures.js";
import { upsertWeatherInputFactory } from "@fixtures/services/weather/weather-service.fixtures.js";
import { type WeathersSearchParams } from "@ou-ca/common/api/weather";
import { err, ok } from "neverthrow";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type MeteoRepository } from "../../../repositories/meteo/meteo-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { buildWeatherService } from "./weather-service.js";

const weatherRepository = mockVi<MeteoRepository>();
const entryRepository = mockVi<DonneeRepository>();

const weatherService = buildWeatherService({
  weatherRepository,
  entryRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find weather", () => {
  test("should handle a matching weather", async () => {
    const weatherData = weatherFactory.build();
    const loggedUser = loggedUserFactory.build();

    weatherRepository.findMeteoById.mockResolvedValueOnce(weatherData);

    await weatherService.findWeather(12, loggedUser);

    expect(weatherRepository.findMeteoById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findMeteoById).toHaveBeenLastCalledWith(12);
  });

  test("should handle weather not found", async () => {
    weatherRepository.findMeteoById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(weatherService.findWeather(10, loggedUser)).resolves.toEqual(ok(null));

    expect(weatherRepository.findMeteoById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findMeteoById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await weatherService.findWeather(11, null);

    expect(findResult).toEqual(err("notAllowed"));
    expect(weatherRepository.findMeteoById).not.toHaveBeenCalled();
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

    weatherRepository.findMeteosOfInventaireId.mockResolvedValueOnce(weathersData);

    const weathersResult = await weatherService.findWeathersOfInventoryId(43, loggedUser);

    expect(weatherRepository.findMeteosOfInventaireId).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findMeteosOfInventaireId).toHaveBeenLastCalledWith(43);
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

  weatherRepository.findMeteos.mockResolvedValueOnce(weathersData);

  await weatherService.findAllWeathers();

  expect(weatherRepository.findMeteos).toHaveBeenCalledTimes(1);
  expect(weatherRepository.findMeteos).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const weathersData = weatherFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    weatherRepository.findMeteos.mockResolvedValueOnce(weathersData);

    await weatherService.findPaginatedWeathers(loggedUser, {});

    expect(weatherRepository.findMeteos).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findMeteos).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated weathers ", async () => {
    const weathersData = weatherFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: WeathersSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    weatherRepository.findMeteos.mockResolvedValueOnce([weathersData[0]]);

    await weatherService.findPaginatedWeathers(loggedUser, searchParams);

    expect(weatherRepository.findMeteos).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findMeteos).toHaveBeenLastCalledWith({
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

    await weatherService.updateWeather(12, weatherData, loggedUser);

    expect(weatherRepository.updateMeteo).toHaveBeenCalledTimes(1);
    expect(weatherRepository.updateMeteo).toHaveBeenLastCalledWith(12, weatherData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = weatherFactory.build({
      ownerId: "notAdmin",
    });

    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    weatherRepository.findMeteoById.mockResolvedValueOnce(existingData);

    await weatherService.updateWeather(12, weatherData, loggedUser);

    expect(weatherRepository.updateMeteo).toHaveBeenCalledTimes(1);
    expect(weatherRepository.updateMeteo).toHaveBeenLastCalledWith(12, weatherData);
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

    weatherRepository.findMeteoById.mockResolvedValueOnce(existingData);

    const updateResult = await weatherService.updateWeather(12, weatherData, user);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(weatherRepository.updateMeteo).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to an weather that exists", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    weatherRepository.updateMeteo.mockImplementation(uniqueConstraintFailed);

    const updateResult = await weatherService.updateWeather(12, weatherData, loggedUser);

    expect(updateResult).toEqual(err("alreadyExists"));
    expect(weatherRepository.updateMeteo).toHaveBeenCalledTimes(1);
    expect(weatherRepository.updateMeteo).toHaveBeenLastCalledWith(12, weatherData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const updateResult = await weatherService.updateWeather(12, weatherData, null);

    expect(updateResult).toEqual(err("notAllowed"));
    expect(weatherRepository.updateMeteo).not.toHaveBeenCalled();
  });
});

describe("Creation of an weather", () => {
  test("should create new weather", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    await weatherService.createWeather(weatherData, loggedUser);

    expect(weatherRepository.createMeteo).toHaveBeenCalledTimes(1);
    expect(weatherRepository.createMeteo).toHaveBeenLastCalledWith({
      ...weatherData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create an weather that already exists", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    weatherRepository.createMeteo.mockImplementation(uniqueConstraintFailed);

    const createResult = await weatherService.createWeather(weatherData, loggedUser);

    expect(createResult).toEqual(err("alreadyExists"));
    expect(weatherRepository.createMeteo).toHaveBeenCalledTimes(1);
    expect(weatherRepository.createMeteo).toHaveBeenLastCalledWith({
      ...weatherData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const createResult = await weatherService.createWeather(weatherData, null);

    expect(createResult).toEqual(err("notAllowed"));
    expect(weatherRepository.createMeteo).not.toHaveBeenCalled();
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

    weatherRepository.findMeteoById.mockResolvedValueOnce(weather);

    await weatherService.deleteWeather(11, loggedUser);

    expect(weatherRepository.deleteMeteoById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.deleteMeteoById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any weather if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    weatherRepository.findMeteoById.mockResolvedValueOnce(weatherFactory.build());

    await weatherService.deleteWeather(11, loggedUser);

    expect(weatherRepository.deleteMeteoById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.deleteMeteoById).toHaveBeenLastCalledWith(11);
  });

  test("should not be allowed when trying to delete a non-owned weather as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const deleteResult = await weatherService.deleteWeather(11, loggedUser);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(weatherRepository.deleteMeteoById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await weatherService.deleteWeather(11, null);

    expect(deleteResult).toEqual(err("notAllowed"));
    expect(weatherRepository.deleteMeteoById).not.toHaveBeenCalled();
  });
});

test("Create multiple weathers", async () => {
  const weathersData = weatherCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  weatherRepository.createMeteos.mockResolvedValueOnce([]);

  await weatherService.createWeathers(weathersData, loggedUser);

  expect(weatherRepository.createMeteos).toHaveBeenCalledTimes(1);
  expect(weatherRepository.createMeteos).toHaveBeenLastCalledWith(
    weathersData.map((weather) => {
      return {
        ...weather,
        owner_id: loggedUser.id,
      };
    })
  );
});
