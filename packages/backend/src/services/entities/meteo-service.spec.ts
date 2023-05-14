import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import {
  EntitesAvecLibelleOrderBy,
  SortOrder,
  type MutationUpsertMeteoArgs,
  type QueryMeteosArgs,
} from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type Meteo, type MeteoCreateInput } from "../../repositories/meteo/meteo-repository-types.js";
import { type MeteoRepository } from "../../repositories/meteo/meteo-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { buildMeteoService } from "./meteo-service.js";

const meteoRepository = mock<MeteoRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const meteoService = buildMeteoService({
  logger,
  meteoRepository,
  donneeRepository,
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
    const weatherData = mock<Meteo>();
    const loggedUser = mock<LoggedUser>();

    meteoRepository.findMeteoById.mockResolvedValueOnce(weatherData);

    await meteoService.findMeteo(weatherData.id, loggedUser);

    expect(meteoRepository.findMeteoById).toHaveBeenCalledTimes(1);
    expect(meteoRepository.findMeteoById).toHaveBeenLastCalledWith(weatherData.id);
  });

  test("should handle weather not found", async () => {
    meteoRepository.findMeteoById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(meteoService.findMeteo(10, loggedUser)).resolves.toBe(null);

    expect(meteoRepository.findMeteoById).toHaveBeenCalledTimes(1);
    expect(meteoRepository.findMeteoById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(meteoService.findMeteo(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(meteoRepository.findMeteoById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await meteoService.getDonneesCountByMeteo(12, loggedUser);

    expect(donneeRepository.getCountByMeteoId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByMeteoId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(meteoService.getDonneesCountByMeteo(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Find weathers by inventary ID", () => {
  test("should handle observer found", async () => {
    const weathersData = [mock<Meteo>(), mock<Meteo>(), mock<Meteo>()];
    const loggedUser = mock<LoggedUser>();

    meteoRepository.findMeteosOfInventaireId.mockResolvedValueOnce(weathersData);

    const weathers = await meteoService.findMeteosOfInventaireId(43, loggedUser);

    expect(meteoRepository.findMeteosOfInventaireId).toHaveBeenCalledTimes(1);
    expect(meteoRepository.findMeteosOfInventaireId).toHaveBeenLastCalledWith(43);
    expect(weathers).toEqual(weathersData);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(meteoService.findMeteosOfInventaireId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all weathers", async () => {
  const weathersData = [mock<Meteo>(), mock<Meteo>(), mock<Meteo>()];

  meteoRepository.findMeteos.mockResolvedValueOnce(weathersData);

  await meteoService.findAllMeteos();

  expect(meteoRepository.findMeteos).toHaveBeenCalledTimes(1);
  expect(meteoRepository.findMeteos).toHaveBeenLastCalledWith({
    orderBy: COLUMN_LIBELLE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const weathersData = [mock<Meteo>(), mock<Meteo>(), mock<Meteo>()];
    const loggedUser = mock<LoggedUser>();

    meteoRepository.findMeteos.mockResolvedValueOnce(weathersData);

    await meteoService.findPaginatedMeteos(loggedUser);

    expect(meteoRepository.findMeteos).toHaveBeenCalledTimes(1);
    expect(meteoRepository.findMeteos).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated weathers ", async () => {
    const weathersData = [mock<Meteo>(), mock<Meteo>(), mock<Meteo>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryMeteosArgs = {
      orderBy: EntitesAvecLibelleOrderBy.Libelle,
      sortOrder: SortOrder.Desc,
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    meteoRepository.findMeteos.mockResolvedValueOnce([weathersData[0]]);

    await meteoService.findPaginatedMeteos(loggedUser, searchParams);

    expect(meteoRepository.findMeteos).toHaveBeenCalledTimes(1);
    expect(meteoRepository.findMeteos).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: SortOrder.Desc,
      offset: searchParams.searchParams?.pageNumber,
      limit: searchParams.searchParams?.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(meteoService.findPaginatedMeteos(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await meteoService.getMeteosCount(loggedUser);

    expect(meteoRepository.getCount).toHaveBeenCalledTimes(1);
    expect(meteoRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await meteoService.getMeteosCount(loggedUser, "test");

    expect(meteoRepository.getCount).toHaveBeenCalledTimes(1);
    expect(meteoRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(meteoService.getMeteosCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an weather", () => {
  test("should be allowed when requested by an admin", async () => {
    const weatherData = mock<MutationUpsertMeteoArgs>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await meteoService.updateMeteo(12, weatherData, loggedUser);

    expect(meteoRepository.updateMeteo).toHaveBeenCalledTimes(1);
    expect(meteoRepository.updateMeteo).toHaveBeenLastCalledWith(12, weatherData.data);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Meteo>({
      ownerId: "notAdmin",
    });

    const weatherData = mock<MutationUpsertMeteoArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    meteoRepository.findMeteoById.mockResolvedValueOnce(existingData);

    await meteoService.updateMeteo(12, weatherData, loggedUser);

    expect(meteoRepository.updateMeteo).toHaveBeenCalledTimes(1);
    expect(meteoRepository.updateMeteo).toHaveBeenLastCalledWith(12, weatherData.data);
  });

  test("should throw an error when requested by an use that is nor owner nor admin", async () => {
    const existingData = mock<Meteo>({
      ownerId: "notAdmin",
    });

    const weatherData = mock<MutationUpsertMeteoArgs>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    meteoRepository.findMeteoById.mockResolvedValueOnce(existingData);

    await expect(meteoService.updateMeteo(12, weatherData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(meteoRepository.updateMeteo).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an weather that exists", async () => {
    const weatherData = mock<MutationUpsertMeteoArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    meteoRepository.updateMeteo.mockImplementation(uniqueConstraintFailed);

    await expect(() => meteoService.updateMeteo(12, weatherData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(meteoRepository.updateMeteo).toHaveBeenCalledTimes(1);
    expect(meteoRepository.updateMeteo).toHaveBeenLastCalledWith(12, weatherData.data);
  });

  test("should throw an error when the requester is not logged", async () => {
    const weatherData = mock<MutationUpsertMeteoArgs>({
      id: 12,
    });

    await expect(meteoService.updateMeteo(12, weatherData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(meteoRepository.updateMeteo).not.toHaveBeenCalled();
  });
});

describe("Creation of an weather", () => {
  test("should create new weather", async () => {
    const weatherData = mock<MutationUpsertMeteoArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await meteoService.createMeteo(weatherData, loggedUser);

    expect(meteoRepository.createMeteo).toHaveBeenCalledTimes(1);
    expect(meteoRepository.createMeteo).toHaveBeenLastCalledWith({
      ...weatherData.data,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create an weather that already exists", async () => {
    const weatherData = mock<MutationUpsertMeteoArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    meteoRepository.createMeteo.mockImplementation(uniqueConstraintFailed);

    await expect(() => meteoService.createMeteo(weatherData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", uniqueConstraintFailedError)
    );

    expect(meteoRepository.createMeteo).toHaveBeenCalledTimes(1);
    expect(meteoRepository.createMeteo).toHaveBeenLastCalledWith({
      ...weatherData.data,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const weatherData = mock<MutationUpsertMeteoArgs>({
      id: undefined,
    });

    await expect(meteoService.createMeteo(weatherData, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(meteoRepository.createMeteo).not.toHaveBeenCalled();
  });
});

describe("Deletion of an weather", () => {
  test("should handle the deletion of an owned weather", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const weather = mock<Meteo>({
      ownerId: loggedUser.id,
    });

    meteoRepository.findMeteoById.mockResolvedValueOnce(weather);

    await meteoService.deleteMeteo(11, loggedUser);

    expect(meteoRepository.deleteMeteoById).toHaveBeenCalledTimes(1);
    expect(meteoRepository.deleteMeteoById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any weather if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    meteoRepository.findMeteoById.mockResolvedValueOnce(mock<Meteo>());

    await meteoService.deleteMeteo(11, loggedUser);

    expect(meteoRepository.deleteMeteoById).toHaveBeenCalledTimes(1);
    expect(meteoRepository.deleteMeteoById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when trying to delete a non-owned weather as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    meteoRepository.findMeteoById.mockResolvedValueOnce(mock<Meteo>());

    await expect(meteoService.deleteMeteo(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(meteoRepository.deleteMeteoById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(meteoService.deleteMeteo(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(meteoRepository.deleteMeteoById).not.toHaveBeenCalled();
  });
});

test("Create multiple weathers", async () => {
  const weathersData = [
    mock<Omit<MeteoCreateInput, "owner_id">>(),
    mock<Omit<MeteoCreateInput, "owner_id">>(),
    mock<Omit<MeteoCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await meteoService.createMeteos(weathersData, loggedUser);

  expect(meteoRepository.createMeteos).toHaveBeenCalledTimes(1);
  expect(meteoRepository.createMeteos).toHaveBeenLastCalledWith(
    weathersData.map((weather) => {
      return {
        ...weather,
        owner_id: loggedUser.id,
      };
    })
  );
});
