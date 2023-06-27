import { type DistanceEstimatesSearchParams, type UpsertDistanceEstimateInput } from "@ou-ca/common/api/distance-estimate";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { mock } from "vitest-mock-extended";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import {
    type EstimationDistance,
    type EstimationDistanceCreateInput
} from "../../repositories/estimation-distance/estimation-distance-repository-types.js";
import { type EstimationDistanceRepository } from "../../repositories/estimation-distance/estimation-distance-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { buildEstimationDistanceService } from "./estimation-distance-service.js";

const estimationDistanceRepository = mock<EstimationDistanceRepository>({});
const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const estimationDistanceService = buildEstimationDistanceService({
  logger,
  estimationDistanceRepository,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find distance estimate", () => {
  test("should handle a matching distance estimate", async () => {
    const distanceEstimateData = mock<EstimationDistance>();
    const loggedUser = mock<LoggedUser>();

    estimationDistanceRepository.findEstimationDistanceById.mockResolvedValueOnce(distanceEstimateData);

    await estimationDistanceService.findEstimationDistance(12, loggedUser);

    expect(estimationDistanceRepository.findEstimationDistanceById).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.findEstimationDistanceById).toHaveBeenLastCalledWith(12);
  });

  test("should handle distance estimate not found", async () => {
    estimationDistanceRepository.findEstimationDistanceById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(estimationDistanceService.findEstimationDistance(10, loggedUser)).resolves.toBe(null);

    expect(estimationDistanceRepository.findEstimationDistanceById).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.findEstimationDistanceById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(estimationDistanceService.findEstimationDistance(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(estimationDistanceRepository.findEstimationDistanceById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await estimationDistanceService.getDonneesCountByEstimationDistance("12", loggedUser);

    expect(donneeRepository.getCountByEstimationDistanceId).toHaveBeenCalledTimes(1);
    expect(donneeRepository.getCountByEstimationDistanceId).toHaveBeenLastCalledWith(12);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(estimationDistanceService.getDonneesCountByEstimationDistance("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Find distance estimate by data ID", () => {
  test("should handle distance estimate found", async () => {
    const distanceEstimateData = mock<EstimationDistance>({
      id: "256",
    });
    const loggedUser = mock<LoggedUser>();

    estimationDistanceRepository.findEstimationDistanceByDonneeId.mockResolvedValueOnce(distanceEstimateData);

    const distanceEstimate = await estimationDistanceService.findEstimationDistanceOfDonneeId("43", loggedUser);

    expect(estimationDistanceRepository.findEstimationDistanceByDonneeId).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.findEstimationDistanceByDonneeId).toHaveBeenLastCalledWith(43);
    expect(distanceEstimate?.id).toEqual("256");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(estimationDistanceService.findEstimationDistanceOfDonneeId("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

test("Find all estimationsDistance", async () => {
  const estimationsDistanceData = [mock<EstimationDistance>(), mock<EstimationDistance>(), mock<EstimationDistance>()];

  estimationDistanceRepository.findEstimationsDistance.mockResolvedValueOnce(estimationsDistanceData);

  await estimationDistanceService.findAllEstimationsDistance();

  expect(estimationDistanceRepository.findEstimationsDistance).toHaveBeenCalledTimes(1);
  expect(estimationDistanceRepository.findEstimationsDistance).toHaveBeenLastCalledWith({
    orderBy: COLUMN_LIBELLE,
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const estimationsDistanceData = [
      mock<EstimationDistance>(),
      mock<EstimationDistance>(),
      mock<EstimationDistance>(),
    ];
    const loggedUser = mock<LoggedUser>();

    estimationDistanceRepository.findEstimationsDistance.mockResolvedValueOnce(estimationsDistanceData);

    await estimationDistanceService.findPaginatedEstimationsDistance(loggedUser, {});

    expect(estimationDistanceRepository.findEstimationsDistance).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.findEstimationsDistance).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated estimationsDistance ", async () => {
    const estimationsDistanceData = [
      mock<EstimationDistance>(),
      mock<EstimationDistance>(),
      mock<EstimationDistance>(),
    ];
    const loggedUser = mock<LoggedUser>();

    const searchParams: DistanceEstimatesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    estimationDistanceRepository.findEstimationsDistance.mockResolvedValueOnce([estimationsDistanceData[0]]);

    await estimationDistanceService.findPaginatedEstimationsDistance(loggedUser, searchParams);

    expect(estimationDistanceRepository.findEstimationsDistance).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.findEstimationsDistance).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: COLUMN_LIBELLE,
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(estimationDistanceService.findPaginatedEstimationsDistance(null, {})).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await estimationDistanceService.getEstimationsDistanceCount(loggedUser);

    expect(estimationDistanceRepository.getCount).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await estimationDistanceService.getEstimationsDistanceCount(loggedUser, "test");

    expect(estimationDistanceRepository.getCount).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(estimationDistanceService.getEstimationsDistanceCount(null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Update of a distance estimate", () => {
  test("should be allowed when requested by an admin ", async () => {
    const distanceEstimateData = mock<UpsertDistanceEstimateInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    await estimationDistanceService.updateEstimationDistance(12, distanceEstimateData, loggedUser);

    expect(estimationDistanceRepository.updateEstimationDistance).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.updateEstimationDistance).toHaveBeenLastCalledWith(
      12,
      distanceEstimateData
    );
  });

  test("should be allowed when requested by the owner ", async () => {
    const existingData = mock<EstimationDistance>({
      ownerId: "notAdmin",
    });

    const distanceEstimateData = mock<UpsertDistanceEstimateInput>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    estimationDistanceRepository.findEstimationDistanceById.mockResolvedValueOnce(existingData);

    await estimationDistanceService.updateEstimationDistance(12, distanceEstimateData, loggedUser);

    expect(estimationDistanceRepository.updateEstimationDistance).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.updateEstimationDistance).toHaveBeenLastCalledWith(
      12,
      distanceEstimateData
    );
  });

  test("should throw an error when requested by an user that is nor owner nor admin", async () => {
    const existingData = mock<EstimationDistance>({
      ownerId: "notAdmin",
    });

    const distanceEstimateData = mock<UpsertDistanceEstimateInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    estimationDistanceRepository.findEstimationDistanceById.mockResolvedValueOnce(existingData);

    await expect(estimationDistanceService.updateEstimationDistance(12, distanceEstimateData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(estimationDistanceRepository.updateEstimationDistance).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to a distance estimate that exists", async () => {
    const distanceEstimateData = mock<UpsertDistanceEstimateInput>();

    const loggedUser = mock<LoggedUser>({ role: "admin" });

    estimationDistanceRepository.updateEstimationDistance.mockImplementation(uniqueConstraintFailed);

    await expect(() =>
      estimationDistanceService.updateEstimationDistance(12, distanceEstimateData, loggedUser)
    ).rejects.toThrowError(new OucaError("OUCA0004", uniqueConstraintFailedError));

    expect(estimationDistanceRepository.updateEstimationDistance).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.updateEstimationDistance).toHaveBeenLastCalledWith(
      12,
      distanceEstimateData
    );
  });

  test("should throw an error when the requester is not logged", async () => {
    const distanceEstimateData = mock<UpsertDistanceEstimateInput>();

    await expect(estimationDistanceService.updateEstimationDistance(12, distanceEstimateData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(estimationDistanceRepository.updateEstimationDistance).not.toHaveBeenCalled();
  });
});

describe("Creation of a distance estimate", () => {
  test("should create new distance estimate", async () => {
    const distanceEstimateData = mock<UpsertDistanceEstimateInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await estimationDistanceService.createEstimationDistance(distanceEstimateData, loggedUser);

    expect(estimationDistanceRepository.createEstimationDistance).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.createEstimationDistance).toHaveBeenLastCalledWith({
      ...distanceEstimateData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when trying to create a distance estimate that already exists", async () => {
    const distanceEstimateData = mock<UpsertDistanceEstimateInput>();

    const loggedUser = mock<LoggedUser>({ id: "a" });

    estimationDistanceRepository.createEstimationDistance.mockImplementation(uniqueConstraintFailed);

    await expect(() =>
      estimationDistanceService.createEstimationDistance(distanceEstimateData, loggedUser)
    ).rejects.toThrowError(new OucaError("OUCA0004", uniqueConstraintFailedError));

    expect(estimationDistanceRepository.createEstimationDistance).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.createEstimationDistance).toHaveBeenLastCalledWith({
      ...distanceEstimateData,
      owner_id: loggedUser.id,
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    const distanceEstimateData = mock<UpsertDistanceEstimateInput>();

    await expect(estimationDistanceService.createEstimationDistance(distanceEstimateData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(estimationDistanceRepository.createEstimationDistance).not.toHaveBeenCalled();
  });
});

describe("Deletion of a distance estimate", () => {
  test("should handle the deletion of an owned distance estimate", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const distanceEstimate = mock<EstimationDistance>({
      ownerId: loggedUser.id,
    });

    estimationDistanceRepository.findEstimationDistanceById.mockResolvedValueOnce(distanceEstimate);

    await estimationDistanceService.deleteEstimationDistance(11, loggedUser);

    expect(estimationDistanceRepository.deleteEstimationDistanceById).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.deleteEstimationDistanceById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any distance estimate if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "admin",
    });

    estimationDistanceRepository.findEstimationDistanceById.mockResolvedValueOnce(mock<EstimationDistance>());

    await estimationDistanceService.deleteEstimationDistance(11, loggedUser);

    expect(estimationDistanceRepository.deleteEstimationDistanceById).toHaveBeenCalledTimes(1);
    expect(estimationDistanceRepository.deleteEstimationDistanceById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned distance estimate as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: "contributor",
    });

    estimationDistanceRepository.findEstimationDistanceById.mockResolvedValueOnce(mock<EstimationDistance>());

    await expect(estimationDistanceService.deleteEstimationDistance(11, loggedUser)).rejects.toEqual(
      new OucaError("OUCA0001")
    );

    expect(estimationDistanceRepository.deleteEstimationDistanceById).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(estimationDistanceService.deleteEstimationDistance(11, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(estimationDistanceRepository.deleteEstimationDistanceById).not.toHaveBeenCalled();
  });
});

test("Create multiple estimationsDistance", async () => {
  const estimationsDistanceData = [
    mock<Omit<EstimationDistanceCreateInput, "owner_id">>(),
    mock<Omit<EstimationDistanceCreateInput, "owner_id">>(),
    mock<Omit<EstimationDistanceCreateInput, "owner_id">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  estimationDistanceRepository.createEstimationsDistance.mockResolvedValueOnce([]);

  await estimationDistanceService.createEstimationsDistance(estimationsDistanceData, loggedUser);

  expect(estimationDistanceRepository.createEstimationsDistance).toHaveBeenCalledTimes(1);
  expect(estimationDistanceRepository.createEstimationsDistance).toHaveBeenLastCalledWith(
    estimationsDistanceData.map((distanceEstimate) => {
      return {
        ...distanceEstimate,
        owner_id: loggedUser.id,
      };
    })
  );
});
