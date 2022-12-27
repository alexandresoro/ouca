import { mock } from "jest-mock-extended";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type LoggedUser } from "../../types/User";
import { OucaError } from "../../utils/errors";
import { buildDonneeService } from "./donnee-service";

const donneeRepository = mock<DonneeRepository>({});
const logger = mock<Logger>();

const donneeService = buildDonneeService({
  logger,
  donneeRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Get latest data id", () => {
  test("should handle existing data", async () => {
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findLatestDonneeId.mockResolvedValueOnce(18);

    const nextRegroupement = await donneeService.findLastDonneeId(loggedUser);

    expect(donneeRepository.findLatestDonneeId).toHaveBeenCalledTimes(1);
    expect(nextRegroupement).toEqual(18);
  });

  test("should handle no existing data", async () => {
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findLatestDonneeId.mockResolvedValueOnce(null);

    await donneeService.findLastDonneeId(loggedUser);

    expect(donneeRepository.findLatestDonneeId).toHaveBeenCalledTimes(1);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(donneeService.findLastDonneeId(null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(donneeRepository.findLatestDonneeId).not.toHaveBeenCalled();
  });
});

describe("Get next group", () => {
  test("should handle existing groups", async () => {
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findLatestRegroupement.mockResolvedValueOnce(18);

    const nextRegroupement = await donneeService.findNextRegroupement(loggedUser);

    expect(donneeRepository.findLatestRegroupement).toHaveBeenCalledTimes(1);
    expect(nextRegroupement).toEqual(19);
  });

  test("should handle no existing group", async () => {
    const loggedUser = mock<LoggedUser>();

    donneeRepository.findLatestRegroupement.mockResolvedValueOnce(null);

    await donneeService.findNextRegroupement(loggedUser);

    expect(donneeRepository.findLatestRegroupement).toHaveBeenCalledTimes(1);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(donneeService.findNextRegroupement(null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(donneeRepository.findLatestRegroupement).not.toHaveBeenCalled();
  });
});
