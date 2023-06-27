import { type NumberEstimatesSearchParams, type UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { SortOrder } from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import {
  type EstimationNombre,
  type EstimationNombreCreateInput,
} from "../../repositories/estimation-nombre/estimation-nombre-repository-types.js";
import { type EstimationNombreRepository } from "../../repositories/estimation-nombre/estimation-nombre-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { reshapeInputEstimationNombreUpsertData } from "./estimation-nombre-service-reshape.js";
import { buildEstimationNombreService } from "./estimation-nombre-service.js";

const estimationNombreRepository = mock<EstimationNombreRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const estimationNombreService = buildEstimationNombreService({
  logger,
  estimationNombreRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

vi.mock("./estimation-nombre-service-reshape.js", () => {
  return {
    __esModule: true,
    reshapeInputEstimationNombreUpsertData: vi.fn(),
  };
});

const mockedReshapeInputEstimationNombreUpsertData = vi.mocked(reshapeInputEstimationNombreUpsertData);

describe("Find number estimate", () => {
  test("should handle a matching number estimate", async () => {
    const numberEstimateData = mock<EstimationNombre>();
    const loggedUser = mock<LoggedUser>();

    estimationNombreRepository.findEstimationNombreById.mockResolvedValueOnce(numberEstimateData);

    await estimationNombreService.findEstimationNombre(12, loggedUser);

    expect(estimationNombreRepository.findEstimationNombreById).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.findEstimationNombreById).toHaveBeenLastCalledWith(12);
  });

  test("should handle number estimate not found", async () => {
    estimationNombreRepository.findEstimationNombreById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(estimationNombreService.findEstimationNombre(10, loggedUser)).resolves.toBe(null);

    expect(estimationNombreRepository.findEstimationNombreById).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.findEstimationNombreById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(estimationNombreService.findEstimationNombre(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(estimationNombreRepository.findEstimationNombreById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await estimationNombreService.getDonneesCountByEstimationNombre("12", loggedUser);

    expect(donneeRepository.getCountByEstimationNombreId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByEstimationNombreId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(estimationNombreService.getDonneesCountByEstimationNombre("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Find number estimate by data ID", () => {
  test("should handle number estimate found", async () => {
    const numberEstimateData = mock<EstimationNombre>({
      id: "256",
    });
    const loggedUser = mock<LoggedUser>();

    estimationNombreRepository.findEstimationNombreByDonneeId.mockResolvedValueOnce(numberEstimateData);

    const numberEstimate = await estimationNombreService.findEstimationNombreOfDonneeId("43", loggedUser);

    expect(estimationNombreRepository.findEstimationNombreByDonneeId).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.findEstimationNombreByDonneeId).toHaveBeenLastCalledWith(43);
    expect(numberEstimate?.id).toEqual("256");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(estimationNombreService.findEstimationNombreOfDonneeId("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

test("Find all estimationsNombre", async () => {
  const estimationsNombreData = [mock<EstimationNombre>(), mock<EstimationNombre>(), mock<EstimationNombre>()];

  estimationNombreRepository.findEstimationsNombre.mockResolvedValueOnce(estimationsNombreData);

  await estimationNombreService.findAllEstimationsNombre();

  expect(estimationNombreRepository.findEstimationsNombre).toHaveBeenCalledTimes(1);
  expect(estimationNombreRepository.findEstimationsNombre).toHaveBeenLastCalledWith({
    orderBy: COLUMN_LIBELLE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const estimationsNombreData = [mock<EstimationNombre>(), mock<EstimationNombre>(), mock<EstimationNombre>()];
    const loggedUser = mock<LoggedUser>();

    estimationNombreRepository.findEstimationsNombre.mockResolvedValueOnce(estimationsNombreData);

    await estimationNombreService.findPaginatedEstimationsNombre(loggedUser, {});

    expect(estimationNombreRepository.findEstimationsNombre).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.findEstimationsNombre).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated estimationsNombre ", async () => {
    const estimationsNombreData = [mock<EstimationNombre>(), mock<EstimationNombre>(), mock<EstimationNombre>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: NumberEstimatesSearchParams = {
      orderBy: "libelle",
      sortOrder: SortOrder.Desc,
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    estimationNombreRepository.findEstimationsNombre.mockResolvedValueOnce([estimationsNombreData[0]]);

    await estimationNombreService.findPaginatedEstimationsNombre(loggedUser, searchParams);

    expect(estimationNombreRepository.findEstimationsNombre).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.findEstimationsNombre).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: SortOrder.Desc,
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(estimationNombreService.findPaginatedEstimationsNombre(null, {})).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await estimationNombreService.getEstimationsNombreCount(loggedUser);

    expect(estimationNombreRepository.getCount).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await estimationNombreService.getEstimationsNombreCount(loggedUser, "test");

    expect(estimationNombreRepository.getCount).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(estimationNombreService.getEstimationsNombreCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a number estimate", () => {
  test("should be allowed when requested by an admin ", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const reshapedInputData = mock<EstimationNombreCreateInput>();
    mockedReshapeInputEstimationNombreUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await estimationNombreService.updateEstimationNombre(12, numberEstimateData, loggedUser);

    expect(estimationNombreRepository.updateEstimationNombre).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEstimationNombreUpsertData).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.updateEstimationNombre).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should be allowed when requested by the owner ", async () => {
    const existingData = mock<EstimationNombre>({
      ownerId: "notAdmin",
    });

    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const reshapedInputData = mock<EstimationNombreCreateInput>();
    mockedReshapeInputEstimationNombreUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    estimationNombreRepository.findEstimationNombreById.mockResolvedValueOnce(existingData);

    await estimationNombreService.updateEstimationNombre(12, numberEstimateData, loggedUser);

    expect(estimationNombreRepository.updateEstimationNombre).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEstimationNombreUpsertData).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.updateEstimationNombre).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<EstimationNombre>({
      ownerId: "notAdmin",
    });

    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    estimationNombreRepository.findEstimationNombreById.mockResolvedValueOnce(existingData);

    await expect(estimationNombreService.updateEstimationNombre(12, numberEstimateData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(estimationNombreRepository.updateEstimationNombre).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a number estimate that exists", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const reshapedInputData = mock<EstimationNombreCreateInput>();
    mockedReshapeInputEstimationNombreUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    estimationNombreRepository.updateEstimationNombre.mockImplementation(uniqueConstraintFailed);

    await expect(() =>
      estimationNombreService.updateEstimationNombre(12, numberEstimateData, loggedUser)
    ).rejects.toThrowError(new OucaError("OUCA0004", uniqueConstraintFailedError));

    expect(estimationNombreRepository.updateEstimationNombre).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEstimationNombreUpsertData).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.updateEstimationNombre).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should throw an error when the requester is not logged", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    await expect(estimationNombreService.updateEstimationNombre(12, numberEstimateData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(estimationNombreRepository.updateEstimationNombre).not.toHaveBeenCalled();
  });
});

describe("Creation of a number estimate", () => {
  test("should create new number estimate", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const reshapedInputData = mock<EstimationNombreCreateInput>();
    mockedReshapeInputEstimationNombreUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await estimationNombreService.createEstimationNombre(numberEstimateData, loggedUser);

    expect(estimationNombreRepository.createEstimationNombre).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEstimationNombreUpsertData).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.createEstimationNombre).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a number estimate that already exists", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const reshapedInputData = mock<EstimationNombreCreateInput>();
    mockedReshapeInputEstimationNombreUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = mock<LoggedUser>({ id: "a" });

    estimationNombreRepository.createEstimationNombre.mockImplementation(uniqueConstraintFailed);

    await expect(() =>
      estimationNombreService.createEstimationNombre(numberEstimateData, loggedUser)
    ).rejects.toThrowError(new OucaError("OUCA0004", uniqueConstraintFailedError));

    expect(estimationNombreRepository.createEstimationNombre).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputEstimationNombreUpsertData).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.createEstimationNombre).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    await expect(estimationNombreService.createEstimationNombre(numberEstimateData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(estimationNombreRepository.createEstimationNombre).not.toHaveBeenCalled();
  });
});

describe("Deletion of a number estimate", () => {
  test("should handle the deletion of an owned number estimate", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const numberEstimate = mock<EstimationNombre>({
      ownerId: loggedUser.id,
    });

    estimationNombreRepository.findEstimationNombreById.mockResolvedValueOnce(numberEstimate);

    await estimationNombreService.deleteEstimationNombre(11, loggedUser);

    expect(estimationNombreRepository.deleteEstimationNombreById).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.deleteEstimationNombreById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any number estimate if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    estimationNombreRepository.findEstimationNombreById.mockResolvedValueOnce(mock<EstimationNombre>());

    await estimationNombreService.deleteEstimationNombre(11, loggedUser);

    expect(estimationNombreRepository.deleteEstimationNombreById).toHaveBeenCalledTimes(1);
    expect(estimationNombreRepository.deleteEstimationNombreById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned number estimate as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    estimationNombreRepository.findEstimationNombreById.mockResolvedValueOnce(mock<EstimationNombre>());

    await expect(estimationNombreService.deleteEstimationNombre(11, loggedUser)).rejects.toEqual(
      new OucaError("OUCA0001")
    );

    expect(estimationNombreRepository.deleteEstimationNombreById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(estimationNombreService.deleteEstimationNombre(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(estimationNombreRepository.deleteEstimationNombreById).not.toHaveBeenCalled();
  });
});

test("Create multiple estimationsNombre", async () => {
  const estimationsNombreData = [
    mock<Omit<EstimationNombreCreateInput, "owner_id">>(),
    mock<Omit<EstimationNombreCreateInput, "owner_id">>(),
    mock<Omit<EstimationNombreCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  estimationNombreRepository.createEstimationsNombre.mockResolvedValueOnce([]);

  await estimationNombreService.createEstimationsNombre(estimationsNombreData, loggedUser);

  expect(estimationNombreRepository.createEstimationsNombre).toHaveBeenCalledTimes(1);
  expect(estimationNombreRepository.createEstimationsNombre).toHaveBeenLastCalledWith(
    estimationsNombreData.map((numberEstimate) => {
      return {
        ...numberEstimate,
        owner_id: loggedUser.id,
      };
    })
  );
});
