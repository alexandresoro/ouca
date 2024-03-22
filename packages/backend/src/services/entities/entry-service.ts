import type { EntryUpsertFailureReason } from "@domain/entry/entry.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { EntryRepository } from "@interfaces/entry-repository-interface.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { EntriesSearchParams, UpsertEntryInput } from "@ou-ca/common/api/entry";
import { type Result, err, ok } from "neverthrow";
import type { DatabasePool } from "slonik";
import { getSqlPagination } from "../../application/services/entities-utils.js";
import type { DonneeComportementRepository } from "../../repositories/donnee-comportement/donnee-comportement-repository.js";
import type { DonneeMilieuRepository } from "../../repositories/donnee-milieu/donnee-milieu-repository.js";
import type { Donnee } from "../../repositories/donnee/donnee-repository-types.js";
import type { DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { reshapeSearchCriteria } from "../../repositories/search-criteria.js";
import { reshapeInputEntryUpsertDataLegacy } from "./entry-service-reshape.js";

type EntryServiceDependencies = {
  slonik: DatabasePool;
  inventoryRepository: InventoryRepository;
  entryRepository: EntryRepository;
  entryRepositoryLegacy: DonneeRepository;
  entryBehaviorRepository: DonneeComportementRepository;
  entryEnvironmentRepository: DonneeMilieuRepository;
};

export const buildEntryService = ({
  slonik,
  inventoryRepository,
  entryRepository,
  entryRepositoryLegacy,
  entryBehaviorRepository,
  entryEnvironmentRepository,
}: EntryServiceDependencies) => {
  const findEntry = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Donnee | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepositoryLegacy.findDonneeById(id));
  };

  // Be careful when calling it, it will retrieve a lot of data!
  const findAllEntries = async (): Promise<Donnee[]> => {
    const entries = await entryRepositoryLegacy.findDonnees();

    return [...entries];
  };

  const findPaginatedEntries = async (
    loggedUser: LoggedUser | null,
    options: Omit<EntriesSearchParams, "pageNumber" | "pageSize"> & Partial<{ pageNumber: number; pageSize: number }>,
  ): Promise<Result<Donnee[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { orderBy: orderByField, sortOrder, pageSize, pageNumber, ...searchCriteria } = options;

    const reshapedSearchCriteria = reshapeSearchCriteria(searchCriteria);

    const entries = await entryRepositoryLegacy.findDonnees({
      searchCriteria: reshapedSearchCriteria,
      ...getSqlPagination({
        pageNumber,
        pageSize,
      }),
      orderBy: orderByField,
      sortOrder,
    });

    return ok([...entries]);
  };

  const getEntriesCount = async (
    loggedUser: LoggedUser | null,
    options: EntriesSearchParams,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const reshapedSearchCriteria = reshapeSearchCriteria(options);

    return ok(await entryRepositoryLegacy.getCount(reshapedSearchCriteria));
  };

  const findNextGrouping = async (loggedUser: LoggedUser | null): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const latestRegroupement = await entryRepositoryLegacy.findLatestRegroupement();
    return ok((latestRegroupement ?? 0) + 1);
  };

  const createEntry = async (
    input: UpsertEntryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Donnee, EntryUpsertFailureReason>> => {
    if (!loggedUser) {
      return err({ type: "notAllowed" });
    }

    const { behaviorIds, environmentIds } = input;

    // Check if an exact same entry already exists or not
    const existingEntry = await entryRepositoryLegacy.findExistingDonnee({
      ...reshapeInputEntryUpsertDataLegacy(input),
      behaviorIds,
      environmentIds,
    });

    if (existingEntry) {
      // The entry already exists so we return an error
      return err({
        type: "similarEntryAlreadyExists",
        correspondingEntryFound: `${existingEntry.id}`,
      });
    }

    const createdEntry = await slonik.transaction(async (transactionConnection) => {
      const createdDonnee = await entryRepositoryLegacy.createDonnee(
        reshapeInputEntryUpsertDataLegacy(input),
        transactionConnection,
      );

      if (behaviorIds?.length) {
        await entryBehaviorRepository.insertDonneeWithComportements(
          Number.parseInt(createdDonnee.id),
          behaviorIds.map((behavior) => Number.parseInt(behavior)),
          transactionConnection,
        );
      }

      if (environmentIds?.length) {
        await entryEnvironmentRepository.insertDonneeWithMilieux(
          Number.parseInt(createdDonnee.id),
          environmentIds.map((environment) => Number.parseInt(environment)),
          transactionConnection,
        );
      }

      return createdDonnee;
    });

    return ok(createdEntry);
  };

  const updateEntry = async (
    id: string,
    input: UpsertEntryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Donnee, EntryUpsertFailureReason>> => {
    if (!loggedUser) {
      return err({ type: "notAllowed" });
    }

    const { behaviorIds, environmentIds } = input;

    // Check if an exact same entry already exists or not
    const existingEntry = await entryRepositoryLegacy.findExistingDonnee({
      ...reshapeInputEntryUpsertDataLegacy(input),
      behaviorIds,
      environmentIds,
    });

    if (existingEntry && existingEntry.id !== id) {
      return err({
        type: "similarEntryAlreadyExists",
        correspondingEntryFound: `${existingEntry.id}`,
      });
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      const updatedEntry = await slonik.transaction(async (transactionConnection) => {
        const updatedDonnee = await entryRepositoryLegacy.updateDonnee(
          Number.parseInt(id),
          reshapeInputEntryUpsertDataLegacy(input),
          transactionConnection,
        );

        await entryBehaviorRepository.deleteComportementsOfDonneeId(Number.parseInt(id), transactionConnection);

        if (behaviorIds?.length) {
          await entryBehaviorRepository.insertDonneeWithComportements(
            Number.parseInt(id),
            behaviorIds.map((behavior) => Number.parseInt(behavior)),
            transactionConnection,
          );
        }

        await entryEnvironmentRepository.deleteMilieuxOfDonneeId(Number.parseInt(id), transactionConnection);

        if (environmentIds?.length) {
          await entryEnvironmentRepository.insertDonneeWithMilieux(
            Number.parseInt(id),
            environmentIds.map((environment) => Number.parseInt(environment)),
            transactionConnection,
          );
        }

        return updatedDonnee;
      });

      return ok(updatedEntry);
    }
  };

  const deleteEntry = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Donnee, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // First get the corresponding inventaire
    const inventaire = await inventoryRepository.findInventoryByEntryId(id);

    if (loggedUser.role !== "admin" && inventaire?.ownerId !== loggedUser.id) {
      return err("notAllowed");
    }

    const deletedEntryResult = await slonik.transaction(async (transactionConnection) => {
      // Delete the actual entry
      const deletedEntry = await entryRepositoryLegacy.deleteDonneeById(Number.parseInt(id), transactionConnection);

      return ok(deletedEntry);
    });

    if (deletedEntryResult.isErr()) {
      return err(deletedEntryResult.error as AccessFailureReason);
    }

    return deletedEntryResult;
  };

  return {
    findEntry,
    findAllEntries,
    findPaginatedEntries,
    getEntriesCount,
    findNextGrouping,
    createEntry,
    updateEntry,
    deleteEntry,
  };
};

export type EntryService = ReturnType<typeof buildEntryService>;
