import type { EntryUpsertFailureReason } from "@domain/entry/entry.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
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
import { reshapeInputEntryUpsertDataLegacy } from "./donnee-service-reshape.js";

type DonneeServiceDependencies = {
  slonik: DatabasePool;
  inventoryRepository: InventoryRepository;
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
  const findDonnee = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Donnee | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.findDonneeById(id));
  };

  // Be careful when calling it, it will retrieve a lot of data!
  const findAllDonnees = async (): Promise<Donnee[]> => {
    const donnees = await entryRepository.findDonnees();

    return [...donnees];
  };

  const findPaginatedDonnees = async (
    loggedUser: LoggedUser | null,
    options: Omit<EntriesSearchParams, "pageNumber" | "pageSize"> & Partial<{ pageNumber: number; pageSize: number }>,
  ): Promise<Result<Donnee[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

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

    return ok([...donnees]);
  };

  const getDonneesCount = async (
    loggedUser: LoggedUser | null,
    options: EntriesSearchParams,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const reshapedSearchCriteria = reshapeSearchCriteria(options);

    return ok(await entryRepository.getCount(reshapedSearchCriteria));
  };

  const findNextRegroupement = async (loggedUser: LoggedUser | null): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const latestRegroupement = await entryRepository.findLatestRegroupement();
    return ok((latestRegroupement ?? 0) + 1);
  };

  const createDonnee = async (
    input: UpsertEntryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Donnee, EntryUpsertFailureReason>> => {
    if (!loggedUser) {
      return err({ type: "notAllowed" });
    }

    const { behaviorIds, environmentIds } = input;

    // Check if an exact same donnee already exists or not
    const existingDonnee = await entryRepository.findExistingDonnee({
      ...reshapeInputEntryUpsertDataLegacy(input),
      behaviorIds,
      environmentIds,
    });

    if (existingDonnee) {
      // The donnee already exists so we return an error
      return err({
        type: "similarEntryAlreadyExists",
        correspondingEntryFound: `${existingDonnee.id}`,
      });
    }

    const createdDonnee = await slonik.transaction(async (transactionConnection) => {
      const createdDonnee = await entryRepository.createDonnee(
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

    return ok(createdDonnee);
  };

  const updateDonnee = async (
    id: string,
    input: UpsertEntryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Donnee, EntryUpsertFailureReason>> => {
    if (!loggedUser) {
      return err({ type: "notAllowed" });
    }

    const { behaviorIds, environmentIds } = input;

    // Check if an exact same donnee already exists or not
    const existingDonnee = await entryRepository.findExistingDonnee({
      ...reshapeInputEntryUpsertDataLegacy(input),
      behaviorIds,
      environmentIds,
    });

    if (existingDonnee && existingDonnee.id !== id) {
      return err({
        type: "similarEntryAlreadyExists",
        correspondingEntryFound: `${existingDonnee.id}`,
      });
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      const updatedDonnee = await slonik.transaction(async (transactionConnection) => {
        const updatedDonnee = await entryRepository.updateDonnee(
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

      return ok(updatedDonnee);
    }
  };

  const deleteDonnee = async (
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

    const deletedDonneeResult = await slonik.transaction(async (transactionConnection) => {
      // Delete the actual donnee
      const deletedDonnee = await entryRepository.deleteDonneeById(Number.parseInt(id), transactionConnection);

      return ok(deletedDonnee);
    });

    if (deletedDonneeResult.isErr()) {
      return err(deletedDonneeResult.error as AccessFailureReason);
    }

    return deletedDonneeResult;
  };

  return {
    findDonnee,
    findAllDonnees,
    findPaginatedDonnees,
    getDonneesCount,
    findNextRegroupement,
    createDonnee,
    updateDonnee,
    deleteDonnee,
  };
};

export type DonneeService = ReturnType<typeof buildDonneeService>;
