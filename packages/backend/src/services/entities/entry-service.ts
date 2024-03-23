import type { Entry, EntryUpsertFailureReason } from "@domain/entry/entry.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { EntryRepository } from "@interfaces/entry-repository-interface.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { EntriesSearchParams, UpsertEntryInput } from "@ou-ca/common/api/entry";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../../application/services/entities-utils.js";
import type { Donnee } from "../../repositories/donnee/donnee-repository-types.js";
import type { DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { reshapeSearchCriteria } from "../../repositories/search-criteria.js";
import { reshapeInputEntryUpsertData, reshapeInputEntryUpsertDataLegacy } from "./entry-service-reshape.js";

type EntryServiceDependencies = {
  inventoryRepository: InventoryRepository;
  entryRepository: EntryRepository;
  entryRepositoryLegacy: DonneeRepository;
};

export const buildEntryService = ({
  inventoryRepository,
  entryRepository,
  entryRepositoryLegacy,
}: EntryServiceDependencies) => {
  const findEntry = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Entry | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.findEntryById(id));
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

    const { orderBy, sortOrder, pageSize, pageNumber, ...searchCriteria } = options;

    return ok(await entryRepository.getCount(searchCriteria));
  };

  const findNextGrouping = async (loggedUser: LoggedUser | null): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const latestRegroupement = await entryRepository.findLatestGrouping();
    return ok((latestRegroupement ?? 0) + 1);
  };

  const createEntry = async (
    input: UpsertEntryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Entry, EntryUpsertFailureReason>> => {
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

    const createdEntry = await entryRepository.createEntry(reshapeInputEntryUpsertData(input));

    return ok(createdEntry);
  };

  const updateEntry = async (
    id: string,
    input: UpsertEntryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Entry, EntryUpsertFailureReason>> => {
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
    }

    const updatedEntry = await entryRepository.updateEntry(id, reshapeInputEntryUpsertData(input));

    return ok(updatedEntry);
  };

  const deleteEntry = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Entry | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // First get the corresponding inventaire
    const inventaire = await inventoryRepository.findInventoryByEntryId(id);

    if (loggedUser.role !== "admin" && inventaire?.ownerId !== loggedUser.id) {
      return err("notAllowed");
    }

    const deletedEntry = await entryRepository.deleteEntryById(id);

    return ok(deletedEntry);
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
