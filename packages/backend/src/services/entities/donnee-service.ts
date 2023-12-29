import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type EntryNavigation } from "@ou-ca/common/api/entities/entry";
import { type EntriesSearchParams, type UpsertEntryInput } from "@ou-ca/common/api/entry";
import { type DatabasePool } from "slonik";
import { validateAuthorization } from "../../application/services/authorization/authorization-utils.js";
import { type DonneeComportementRepository } from "../../repositories/donnee-comportement/donnee-comportement-repository.js";
import { type DonneeMilieuRepository } from "../../repositories/donnee-milieu/donnee-milieu-repository.js";
import { type Donnee } from "../../repositories/donnee/donnee-repository-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { reshapeSearchCriteria } from "../../repositories/search-criteria.js";
import { reshapeInputDonneeUpsertData } from "./donnee-service-reshape.js";
import { getSqlPagination } from "./entities-utils.js";

type DonneeServiceDependencies = {
  slonik: DatabasePool;
  inventoryRepository: InventaireRepository;
  entryRepository: DonneeRepository;
  entryBehaviorRepository: DonneeComportementRepository;
  entryEnvironmentRepository: DonneeMilieuRepository;
};

export const buildDonneeService = ({
  slonik,
  inventoryRepository,
  entryRepository,
  entryBehaviorRepository,
  entryEnvironmentRepository,
}: DonneeServiceDependencies) => {
  const findDonnee = async (id: number, loggedUser: LoggedUser | null): Promise<Donnee | null> => {
    validateAuthorization(loggedUser);

    return entryRepository.findDonneeById(id);
  };

  // Be careful when calling it, it will retrieve a lot of data!
  const findAllDonnees = async (): Promise<Donnee[]> => {
    const donnees = await entryRepository.findDonnees();

    return [...donnees];
  };

  const findPaginatedDonnees = async (
    loggedUser: LoggedUser | null,
    options: Omit<EntriesSearchParams, "pageNumber" | "pageSize"> & Partial<{ pageNumber: number; pageSize: number }>
  ): Promise<Donnee[]> => {
    validateAuthorization(loggedUser);

    const { orderBy: orderByField, sortOrder, pageSize, pageNumber, ...searchCriteria } = options;

    const reshapedSearchCriteria = reshapeSearchCriteria(searchCriteria);

    const donnees = await entryRepository.findDonnees({
      searchCriteria: reshapedSearchCriteria,
      ...getSqlPagination({
        pageNumber,
        pageSize,
      }),
      orderBy: orderByField,
      sortOrder,
    });

    return [...donnees];
  };

  const getDonneesCount = async (loggedUser: LoggedUser | null, options: EntriesSearchParams): Promise<number> => {
    validateAuthorization(loggedUser);

    const reshapedSearchCriteria = reshapeSearchCriteria(options);

    return entryRepository.getCount(reshapedSearchCriteria);
  };

  const findDonneeNavigationData = async (loggedUser: LoggedUser | null, entryId: string): Promise<EntryNavigation> => {
    validateAuthorization(loggedUser);

    const [previousEntryId, nextEntryId, index] = await Promise.all([
      entryRepository.findPreviousDonneeId(parseInt(entryId)),
      entryRepository.findNextDonneeId(parseInt(entryId)),
      entryRepository.findDonneeIndex(parseInt(entryId)),
    ]);

    return {
      index,
      previousEntryId: previousEntryId != null ? `${previousEntryId}` : null,
      nextEntryId: nextEntryId != null ? `${nextEntryId}` : null,
    };
  };

  const findLastDonneeId = async (loggedUser: LoggedUser | null): Promise<string | null> => {
    validateAuthorization(loggedUser);

    const latestDonneeId = await entryRepository.findLatestDonneeId();

    return latestDonneeId;
  };

  const findNextRegroupement = async (loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    const latestRegroupement = await entryRepository.findLatestRegroupement();
    return (latestRegroupement ?? 0) + 1;
  };

  const createDonnee = async (input: UpsertEntryInput, loggedUser: LoggedUser | null): Promise<Donnee> => {
    validateAuthorization(loggedUser);

    const { behaviorIds, environmentIds } = input;

    // Check if an exact same donnee already exists or not
    const existingDonnee = await entryRepository.findExistingDonnee({
      ...reshapeInputDonneeUpsertData(input),
      behaviorIds,
      environmentIds,
    });

    if (existingDonnee) {
      // The donnee already exists so we return an error
      throw new OucaError("OUCA0004", {
        code: "OUCA0004",
        message: `Cette donnée existe déjà (ID = ${existingDonnee.id}).`,
      });
    }

    const createdDonnee = await slonik.transaction(async (transactionConnection) => {
      const createdDonnee = await entryRepository.createDonnee(
        reshapeInputDonneeUpsertData(input),
        transactionConnection
      );

      if (behaviorIds?.length) {
        await entryBehaviorRepository.insertDonneeWithComportements(
          parseInt(createdDonnee.id),
          behaviorIds.map((behavior) => parseInt(behavior)),
          transactionConnection
        );
      }

      if (environmentIds?.length) {
        await entryEnvironmentRepository.insertDonneeWithMilieux(
          parseInt(createdDonnee.id),
          environmentIds.map((environment) => parseInt(environment)),
          transactionConnection
        );
      }

      return createdDonnee;
    });

    return createdDonnee;
  };

  const updateDonnee = async (id: string, input: UpsertEntryInput, loggedUser: LoggedUser | null): Promise<Donnee> => {
    validateAuthorization(loggedUser);

    const { behaviorIds, environmentIds } = input;

    // Check if an exact same donnee already exists or not
    const existingDonnee = await entryRepository.findExistingDonnee({
      ...reshapeInputDonneeUpsertData(input),
      behaviorIds,
      environmentIds,
    });

    if (existingDonnee && existingDonnee.id !== id) {
      // The donnee already exists so we return an error
      throw new OucaError("OUCA0004", {
        code: "OUCA0004",
        message: `Cette donnée existe déjà (ID = ${existingDonnee.id}).`,
      });
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      const updatedDonnee = await slonik.transaction(async (transactionConnection) => {
        const updatedDonnee = await entryRepository.updateDonnee(
          parseInt(id),
          reshapeInputDonneeUpsertData(input),
          transactionConnection
        );

        await entryBehaviorRepository.deleteComportementsOfDonneeId(parseInt(id), transactionConnection);

        if (behaviorIds?.length) {
          await entryBehaviorRepository.insertDonneeWithComportements(
            parseInt(id),
            behaviorIds.map((behavior) => parseInt(behavior)),
            transactionConnection
          );
        }

        await entryEnvironmentRepository.deleteMilieuxOfDonneeId(parseInt(id), transactionConnection);

        if (environmentIds?.length) {
          await entryEnvironmentRepository.insertDonneeWithMilieux(
            parseInt(id),
            environmentIds.map((environment) => parseInt(environment)),
            transactionConnection
          );
        }

        return updatedDonnee;
      });

      return updatedDonnee;
    }
  };

  const deleteDonnee = async (id: number, loggedUser: LoggedUser | null): Promise<Donnee> => {
    validateAuthorization(loggedUser);

    const deletedDonnee = await slonik.transaction(async (transactionConnection) => {
      // First get the corresponding inventaire
      const inventaire = await inventoryRepository.findInventaireByDonneeId(id, transactionConnection);

      if (loggedUser.role !== "admin" && inventaire?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }

      // Delete the actual donnee
      const deletedDonnee = await entryRepository.deleteDonneeById(id, transactionConnection);

      return deletedDonnee;
    });

    return deletedDonnee;
  };

  return {
    findDonnee,
    findAllDonnees,
    findPaginatedDonnees,
    getDonneesCount,
    findDonneeNavigationData,
    findLastDonneeId,
    findNextRegroupement,
    createDonnee,
    updateDonnee,
    deleteDonnee,
  };
};

export type DonneeService = ReturnType<typeof buildDonneeService>;
