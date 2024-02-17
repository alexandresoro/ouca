import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type Weather } from "@domain/weather/weather.js";
import { type UpsertWeatherInput, type WeathersSearchParams } from "@ou-ca/common/api/weather";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type MeteoCreateInput } from "../../repositories/meteo/meteo-repository-types.js";
import { type MeteoRepository } from "../../repositories/meteo/meteo-repository.js";
import { mockVi } from "../../utils/mock.js";
import { buildMeteoService } from "./meteo-service.js";

const weatherRepository = mockVi<MeteoRepository>();
const entryRepository = mockVi<DonneeRepository>();

const meteoService = buildMeteoService({
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
    const weatherData = mock<Weather>();
    const loggedUser = mock<LoggedUser>();

    weatherRepository.findMeteoById.mockResolvedValueOnce(weatherData);

    await meteoService.findMeteo(12, loggedUser);

    expect(weatherRepository.findMeteoById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findMeteoById).toHaveBeenLastCalledWith(12);
  });

  test("should handle weather not found", async () => {
    weatherRepository.findMeteoById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(meteoService.findMeteo(10, loggedUser)).resolves.toBe(null);

    expect(weatherRepository.findMeteoById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findMeteoById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(meteoService.findMeteo(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(weatherRepository.findMeteoById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await meteoService.getDonneesCountByMeteo("12", loggedUser);

    expect(entryRepository.getCountByMeteoId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByMeteoId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(meteoService.getDonneesCountByMeteo("12", null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find weathers by inventary ID", () => {
  test("should handle observer found", async () => {
    const weathersData = [mock<Weather>(), mock<Weather>(), mock<Weather>()];
    const loggedUser = mock<LoggedUser>();

    weatherRepository.findMeteosOfInventaireId.mockResolvedValueOnce(weathersData);

    const weathers = await meteoService.findMeteosOfInventaireId(43, loggedUser);

    expect(weatherRepository.findMeteosOfInventaireId).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findMeteosOfInventaireId).toHaveBeenLastCalledWith(43);
    expect(weathers.length).toEqual(weathersData.length);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(meteoService.findMeteosOfInventaireId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all weathers", async () => {
  const weathersData = [mock<Weather>(), mock<Weather>(), mock<Weather>()];

  weatherRepository.findMeteos.mockResolvedValueOnce(weathersData);

  await meteoService.findAllMeteos();

  expect(weatherRepository.findMeteos).toHaveBeenCalledTimes(1);
  expect(weatherRepository.findMeteos).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const weathersData = [mock<Weather>(), mock<Weather>(), mock<Weather>()];
    const loggedUser = mock<LoggedUser>();

    weatherRepository.findMeteos.mockResolvedValueOnce(weathersData);

    await meteoService.findPaginatedMeteos(loggedUser, {});

    expect(weatherRepository.findMeteos).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findMeteos).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated weathers ", async () => {
    const weathersData = [mock<Weather>(), mock<Weather>(), mock<Weather>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: WeathersSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    weatherRepository.findMeteos.mockResolvedValueOnce([weathersData[0]]);

    await meteoService.findPaginatedMeteos(loggedUser, searchParams);

    expect(weatherRepository.findMeteos).toHaveBeenCalledTimes(1);
    expect(weatherRepository.findMeteos).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(meteoService.findPaginatedMeteos(null, {})).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await meteoService.getMeteosCount(loggedUser);

    expect(weatherRepository.getCount).toHaveBeenCalledTimes(1);
    expect(weatherRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await meteoService.getMeteosCount(loggedUser, "test");

    expect(weatherRepository.getCount).toHaveBeenCalledTimes(1);
    expect(weatherRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(meteoService.getMeteosCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an weather", () => {
  test("should be allowed when requested by an admin", async () => {
    const weatherData = mock<UpsertWeatherInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await meteoService.updateMeteo(12, weatherData, loggedUser);

    expect(weatherRepository.updateMeteo).toHaveBeenCalledTimes(1);
    expect(weatherRepository.updateMeteo).toHaveBeenLastCalledWith(12, weatherData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Weather>({
      ownerId: "notAdmin",
    });

    const weatherData = mock<UpsertWeatherInput>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    weatherRepository.findMeteoById.mockResolvedValueOnce(existingData);

    await meteoService.updateMeteo(12, weatherData, loggedUser);

    expect(weatherRepository.updateMeteo).toHaveBeenCalledTimes(1);
    expect(weatherRepository.updateMeteo).toHaveBeenLastCalledWith(12, weatherData);
  });

  test("should throw an error when requested by an use that is nor owner nor admin", async () => {
    const existingData = mock<Weather>({
      ownerId: "notAdmin",
    });

    const weatherData = mock<UpsertWeatherInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    weatherRepository.findMeteoById.mockResolvedValueOnce(existingData);

    await expect(meteoService.updateMeteo(12, weatherData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(weatherRepository.updateMeteo).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an weather that exists", async () => {
    const weatherData = mock<UpsertWeatherInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    weatherRepository.updateMeteo.mockImplementation(uniqueConstraintFailed);

    await expect(() => meteoService.updateMeteo(12, weatherData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(weatherRepository.updateMeteo).toHaveBeenCalledTimes(1);
    expect(weatherRepository.updateMeteo).toHaveBeenLastCalledWith(12, weatherData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const weatherData = mock<UpsertWeatherInput>();

    await expect(meteoService.updateMeteo(12, weatherData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(weatherRepository.updateMeteo).not.toHaveBeenCalled();
  });
});

describe("Creation of an weather", () => {
  test("should create new weather", async () => {
    const weatherData = mock<UpsertWeatherInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await meteoService.createMeteo(weatherData, loggedUser);

    expect(weatherRepository.createMeteo).toHaveBeenCalledTimes(1);
    expect(weatherRepository.createMeteo).toHaveBeenLastCalledWith({
      ...weatherData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create an weather that already exists", async () => {
    const weatherData = mock<UpsertWeatherInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    weatherRepository.createMeteo.mockImplementation(uniqueConstraintFailed);

    await expect(() => meteoService.createMeteo(weatherData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(weatherRepository.createMeteo).toHaveBeenCalledTimes(1);
    expect(weatherRepository.createMeteo).toHaveBeenLastCalledWith({
      ...weatherData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const weatherData = mock<UpsertWeatherInput>();

    await expect(meteoService.createMeteo(weatherData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(weatherRepository.createMeteo).not.toHaveBeenCalled();
  });
});

describe("Deletion of an weather", () => {
  test("should handle the deletion of an owned weather", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const weather = mock<Weather>({
      ownerId: loggedUser.id,
    });

    weatherRepository.findMeteoById.mockResolvedValueOnce(weather);

    await meteoService.deleteMeteo(11, loggedUser);

    expect(weatherRepository.deleteMeteoById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.deleteMeteoById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any weather if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    weatherRepository.findMeteoById.mockResolvedValueOnce(mock<Weather>());

    await meteoService.deleteMeteo(11, loggedUser);

    expect(weatherRepository.deleteMeteoById).toHaveBeenCalledTimes(1);
    expect(weatherRepository.deleteMeteoById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when trying to delete a non-owned weather as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    weatherRepository.findMeteoById.mockResolvedValueOnce(mock<Weather>());

    await expect(meteoService.deleteMeteo(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(weatherRepository.deleteMeteoById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(meteoService.deleteMeteo(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(weatherRepository.deleteMeteoById).not.toHaveBeenCalled();
  });
});

test("Create multiple weathers", async () => {
  const weathersData = [
    mock<Omit<MeteoCreateInput, "owner_id">>(),
    mock<Omit<MeteoCreateInput, "owner_id">>(),
    mock<Omit<MeteoCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  weatherRepository.createMeteos.mockResolvedValueOnce([]);

  await meteoService.createMeteos(weathersData, loggedUser);

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
