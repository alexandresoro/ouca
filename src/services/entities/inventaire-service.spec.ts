import { mock } from "jest-mock-extended";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository";
import { type Inventaire } from "../../repositories/inventaire/inventaire-repository-types";
import { type LoggedUser } from "../../types/User";
import { OucaError } from "../../utils/errors";
import { buildInventaireService } from "./inventaire-service";

const inventaireRepository = mock<InventaireRepository>({});
const logger = mock<Logger>();

const inventaireService = buildInventaireService({
  logger,
  inventaireRepository,
});

const uniqueConstraintFailedError = new UniqueIntegrityConstraintViolationError(
  new Error("errorMessage"),
  "constraint"
);

const uniqueConstraintFailed = () => {
  throw uniqueConstraintFailedError;
};

describe("Find inventary", () => {
  test("should handle a matching inventary", async () => {
    const inventaryData = mock<Inventaire>();
    const loggedUser = mock<LoggedUser>();

    inventaireRepository.findInventaireById.mockResolvedValueOnce(inventaryData);

    await inventaireService.findInventaire(inventaryData.id, loggedUser);

    expect(inventaireRepository.findInventaireById).toHaveBeenCalledTimes(1);
    expect(inventaireRepository.findInventaireById).toHaveBeenLastCalledWith(inventaryData.id);
  });

  test("should handle inventary not found", async () => {
    inventaireRepository.findInventaireById.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(inventaireService.findInventaire(10, loggedUser)).resolves.toBe(null);

    expect(inventaireRepository.findInventaireById).toHaveBeenCalledTimes(1);
    expect(inventaireRepository.findInventaireById).toHaveBeenLastCalledWith(10);
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(inventaireService.findInventaire(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(inventaireRepository.findInventaireById).not.toHaveBeenCalled();
  });
});

describe("Find inventary by data ID", () => {
  test("should handle inventary found", async () => {
    const inventaryData = mock<Inventaire>();
    const loggedUser = mock<LoggedUser>();

    inventaireRepository.findInventaireByDonneeId.mockResolvedValueOnce(inventaryData);

    const inventary = await inventaireService.findInventaireOfDonneeId(43, loggedUser);

    expect(inventaireRepository.findInventaireByDonneeId).toHaveBeenCalledTimes(1);
    expect(inventaireRepository.findInventaireByDonneeId).toHaveBeenLastCalledWith(43);
    expect(inventary).toEqual(inventaryData);
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(inventaireService.findInventaireOfDonneeId(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find all inventaries", async () => {
  const inventariesData = [mock<Inventaire>(), mock<Inventaire>(), mock<Inventaire>()];

  inventaireRepository.findInventaires.mockResolvedValueOnce(inventariesData);

  await inventaireService.findAllInventaires();

  expect(inventaireRepository.findInventaires).toHaveBeenCalledTimes(1);
});
