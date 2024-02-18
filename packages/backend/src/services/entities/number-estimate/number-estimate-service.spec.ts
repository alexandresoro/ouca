import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { numberEstimateFactory } from "@fixtures/domain/number-estimate/number-estimate.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { type NumberEstimatesSearchParams, type UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type EstimationNombreCreateInput } from "../../../repositories/estimation-nombre/estimation-nombre-repository-types.js";
import { type EstimationNombreRepository } from "../../../repositories/estimation-nombre/estimation-nombre-repository.js";
import { mockVi } from "../../../utils/mock.js";
import { reshapeInputNumberEstimateUpsertData } from "./number-estimate-service-reshape.js";
import { buildNumberEstimateService } from "./number-estimate-service.js";

const numberEstimateRepository = mockVi<EstimationNombreRepository>();
const entryRepository = mockVi<DonneeRepository>();

const numberEstimateService = buildNumberEstimateService({
  numberEstimateRepository,
  entryRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

vi.mock("./number-estimate-service-reshape.js", () => {
  return {
    __esModule: true,
    reshapeInputNumberEstimateUpsertData: vi.fn(),
  };
});

const mockedReshapeInputNumberEstimateUpsertData = vi.mocked(reshapeInputNumberEstimateUpsertData);

describe("Find number estimate", () => {
  test("should handle a matching number estimate", async () => {
    const numberEstimateData = numberEstimateFactory.build();
    const loggedUser = loggedUserFactory.build();

    numberEstimateRepository.findEstimationNombreById.mockResolvedValueOnce(numberEstimateData);

    await numberEstimateService.findEstimationNombre(12, loggedUser);

    expect(numberEstimateRepository.findEstimationNombreById).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.findEstimationNombreById).toHaveBeenLastCalledWith(12);
  });

  test("should handle number estimate not found", async () => {
    numberEstimateRepository.findEstimationNombreById.mockResolvedValueOnce(null);
    const loggedUser = loggedUserFactory.build();

    await expect(numberEstimateService.findEstimationNombre(10, loggedUser)).resolves.toEqual(null);

    expect(numberEstimateRepository.findEstimationNombreById).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.findEstimationNombreById).toHaveBeenLastCalledWith(10);
  });

  test("should not be allowed when the no login details are provided", async () => {
    await expect(numberEstimateService.findEstimationNombre(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(numberEstimateRepository.findEstimationNombreById).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await numberEstimateService.getDonneesCountByEstimationNombre("12", loggedUser);

    expect(entryRepository.getCountByEstimationNombreId).toHaveBeenCalledTimes(1);
    expect(entryRepository.getCountByEstimationNombreId).toHaveBeenLastCalledWith(12);
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(numberEstimateService.getDonneesCountByEstimationNombre("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Find number estimate by data ID", () => {
  test("should handle number estimate found", async () => {
    const numberEstimateData = numberEstimateFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    numberEstimateRepository.findEstimationNombreByDonneeId.mockResolvedValueOnce(numberEstimateData);

    const numberEstimate = await numberEstimateService.findEstimationNombreOfDonneeId("43", loggedUser);

    expect(numberEstimateRepository.findEstimationNombreByDonneeId).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.findEstimationNombreByDonneeId).toHaveBeenLastCalledWith(43);
    expect(numberEstimate?.id).toEqual("256");
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(numberEstimateService.findEstimationNombreOfDonneeId("12", null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

test("Find all estimationsNombre", async () => {
  const estimationsNombreData = numberEstimateFactory.buildList(3);

  numberEstimateRepository.findEstimationsNombre.mockResolvedValueOnce(estimationsNombreData);

  await numberEstimateService.findAllEstimationsNombre();

  expect(numberEstimateRepository.findEstimationsNombre).toHaveBeenCalledTimes(1);
  expect(numberEstimateRepository.findEstimationsNombre).toHaveBeenLastCalledWith({
    orderBy: "libelle",
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const estimationsNombreData = numberEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    numberEstimateRepository.findEstimationsNombre.mockResolvedValueOnce(estimationsNombreData);

    await numberEstimateService.findPaginatedEstimationsNombre(loggedUser, {});

    expect(numberEstimateRepository.findEstimationsNombre).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.findEstimationsNombre).toHaveBeenLastCalledWith({});
  });

  test("should handle params when retrieving paginated estimationsNombre", async () => {
    const estimationsNombreData = numberEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: NumberEstimatesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    numberEstimateRepository.findEstimationsNombre.mockResolvedValueOnce([estimationsNombreData[0]]);

    await numberEstimateService.findPaginatedEstimationsNombre(loggedUser, searchParams);

    expect(numberEstimateRepository.findEstimationsNombre).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.findEstimationsNombre).toHaveBeenLastCalledWith({
      q: "Bob",
      orderBy: "libelle",
      sortOrder: "desc",
      offset: 0,
      limit: searchParams.pageSize,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(numberEstimateService.findPaginatedEstimationsNombre(null, {})).rejects.toEqual(
      new OucaError("OUCA0001")
    );
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await numberEstimateService.getEstimationsNombreCount(loggedUser);

    expect(numberEstimateRepository.getCount).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.getCount).toHaveBeenLastCalledWith(undefined);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await numberEstimateService.getEstimationsNombreCount(loggedUser, "test");

    expect(numberEstimateRepository.getCount).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.getCount).toHaveBeenLastCalledWith("test");
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(numberEstimateService.getEstimationsNombreCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of a number estimate", () => {
  test("should be allowed when requested by an admin", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const reshapedInputData = mock<EstimationNombreCreateInput>();
    mockedReshapeInputNumberEstimateUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    await numberEstimateService.updateEstimationNombre(12, numberEstimateData, loggedUser);

    expect(numberEstimateRepository.updateEstimationNombre).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputNumberEstimateUpsertData).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.updateEstimationNombre).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = numberEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const reshapedInputData = mock<EstimationNombreCreateInput>();
    mockedReshapeInputNumberEstimateUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    numberEstimateRepository.findEstimationNombreById.mockResolvedValueOnce(existingData);

    await numberEstimateService.updateEstimationNombre(12, numberEstimateData, loggedUser);

    expect(numberEstimateRepository.updateEstimationNombre).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputNumberEstimateUpsertData).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.updateEstimationNombre).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should not be allowed when requested by an user that is nor owner nor admin", async () => {
    const existingData = numberEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const user = {
      id: "Bob",
      role: "contributor",
    } as const;

    numberEstimateRepository.findEstimationNombreById.mockResolvedValueOnce(existingData);

    await expect(numberEstimateService.updateEstimationNombre(12, numberEstimateData, user)).rejects.toThrowError(
      new OucaError("OUCA0001")
    );

    expect(numberEstimateRepository.updateEstimationNombre).not.toHaveBeenCalled();
  });

  test("should not be allowed when trying to update to a number estimate that exists", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const reshapedInputData = mock<EstimationNombreCreateInput>();
    mockedReshapeInputNumberEstimateUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ role: "admin" });

    numberEstimateRepository.updateEstimationNombre.mockImplementation(uniqueConstraintFailed);

    await expect(() =>
      numberEstimateService.updateEstimationNombre(12, numberEstimateData, loggedUser)
    ).rejects.toThrowError(new OucaError("OUCA0004", uniqueConstraintFailedError));

    expect(numberEstimateRepository.updateEstimationNombre).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputNumberEstimateUpsertData).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.updateEstimationNombre).toHaveBeenLastCalledWith(12, reshapedInputData);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    await expect(numberEstimateService.updateEstimationNombre(12, numberEstimateData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(numberEstimateRepository.updateEstimationNombre).not.toHaveBeenCalled();
  });
});

describe("Creation of a number estimate", () => {
  test("should create new number estimate", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const reshapedInputData = mock<EstimationNombreCreateInput>();
    mockedReshapeInputNumberEstimateUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ id: "a" });

    await numberEstimateService.createEstimationNombre(numberEstimateData, loggedUser);

    expect(numberEstimateRepository.createEstimationNombre).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputNumberEstimateUpsertData).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.createEstimationNombre).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when trying to create a number estimate that already exists", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    const reshapedInputData = mock<EstimationNombreCreateInput>();
    mockedReshapeInputNumberEstimateUpsertData.mockReturnValueOnce(reshapedInputData);

    const loggedUser = loggedUserFactory.build({ id: "a" });

    numberEstimateRepository.createEstimationNombre.mockImplementation(uniqueConstraintFailed);

    await expect(() =>
      numberEstimateService.createEstimationNombre(numberEstimateData, loggedUser)
    ).rejects.toThrowError(new OucaError("OUCA0004", uniqueConstraintFailedError));

    expect(numberEstimateRepository.createEstimationNombre).toHaveBeenCalledTimes(1);
    expect(mockedReshapeInputNumberEstimateUpsertData).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.createEstimationNombre).toHaveBeenLastCalledWith({
      ...reshapedInputData,
      owner_id: loggedUser.id,
    });
  });

  test("should not be allowed when the requester is not logged", async () => {
    const numberEstimateData = mock<UpsertNumberEstimateInput>();

    await expect(numberEstimateService.createEstimationNombre(numberEstimateData, null)).rejects.toEqual(
      new OucaError("OUCA0001")
    );
    expect(numberEstimateRepository.createEstimationNombre).not.toHaveBeenCalled();
  });
});

describe("Deletion of a number estimate", () => {
  test("should handle the deletion of an owned number estimate", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: "contributor",
    };

    const numberEstimate = numberEstimateFactory.build({
      ownerId: loggedUser.id,
    });

    numberEstimateRepository.findEstimationNombreById.mockResolvedValueOnce(numberEstimate);

    await numberEstimateService.deleteEstimationNombre(11, loggedUser);

    expect(numberEstimateRepository.deleteEstimationNombreById).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.deleteEstimationNombreById).toHaveBeenLastCalledWith(11);
  });

  test("should handle the deletion of any number estimate if admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "admin",
    });

    numberEstimateRepository.findEstimationNombreById.mockResolvedValueOnce(numberEstimateFactory.build());

    await numberEstimateService.deleteEstimationNombre(11, loggedUser);

    expect(numberEstimateRepository.deleteEstimationNombreById).toHaveBeenCalledTimes(1);
    expect(numberEstimateRepository.deleteEstimationNombreById).toHaveBeenLastCalledWith(11);
  });

  test("should return an error when deleting a non-owned number estimate as non-admin", async () => {
    const loggedUser = loggedUserFactory.build({
      role: "contributor",
    });

    numberEstimateRepository.findEstimationNombreById.mockResolvedValueOnce(numberEstimateFactory.build());

    await expect(numberEstimateService.deleteEstimationNombre(11, loggedUser)).rejects.toEqual(
      new OucaError("OUCA0001")
    );

    expect(numberEstimateRepository.deleteEstimationNombreById).not.toHaveBeenCalled();
  });

  test("should not be allowed when the requester is not logged", async () => {
    await expect(numberEstimateService.deleteEstimationNombre(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(numberEstimateRepository.deleteEstimationNombreById).not.toHaveBeenCalled();
  });
});

test("Create multiple estimationsNombre", async () => {
  const estimationsNombreData = [
    mock<Omit<EstimationNombreCreateInput, "owner_id">>(),
    mock<Omit<EstimationNombreCreateInput, "owner_id">>(),
    mock<Omit<EstimationNombreCreateInput, "owner_id">>(),
  ];

  const loggedUser = loggedUserFactory.build();

  numberEstimateRepository.createEstimationsNombre.mockResolvedValueOnce([]);

  await numberEstimateService.createEstimationsNombre(estimationsNombreData, loggedUser);

  expect(numberEstimateRepository.createEstimationsNombre).toHaveBeenCalledTimes(1);
  expect(numberEstimateRepository.createEstimationsNombre).toHaveBeenLastCalledWith(
    estimationsNombreData.map((numberEstimate) => {
      return {
        ...numberEstimate,
        owner_id: loggedUser.id,
      };
    })
  );
});
