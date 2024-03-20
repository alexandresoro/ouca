import type {
  Inventory,
  InventoryDeleteFailureReason,
  InventoryFindManyInput,
  InventoryUpdateFailureReason,
  InventoryUpsertFailureReason,
} from "@domain/inventory/inventory.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { InventoriesSearchParams, UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type Result, err, ok } from "neverthrow";
import type { DatabasePool } from "slonik";
import { getSqlPagination } from "../../application/services/entities-utils.js";
import type { DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import type { InventaireAssocieRepository } from "../../repositories/inventaire-associe/inventaire-associe-repository.js";
import type { InventaireMeteoRepository } from "../../repositories/inventaire-meteo/inventaire-meteo-repository.js";
import type { Inventaire } from "../../repositories/inventaire/inventaire-repository-types.js";
import type { InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { logger } from "../../utils/logger.js";
import { reshapeInputInventoryUpsertData } from "./inventory-service-reshape.js";

type InventoryServiceDependencies = {
  slonik: DatabasePool;
  inventoryRepository: InventoryRepository;
  inventoryRepositoryLegacy: InventaireRepository;
  inventoryAssociateRepository: InventaireAssocieRepository;
  inventoryWeatherRepository: InventaireMeteoRepository;
  entryRepository: DonneeRepository;
  localityRepository: LocalityRepository;
};

export const buildInventoryService = ({
  slonik,
  inventoryRepository,
  inventoryRepositoryLegacy,
  inventoryAssociateRepository,
  inventoryWeatherRepository,
  entryRepository,
  localityRepository,
}: InventoryServiceDependencies) => {
  const findInventory = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Inventory | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const inventory = await inventoryRepository.findInventoryById(id);

    return ok(inventory);
  };

  const findInventoryIndex = async (
    id: number,
    order: {
      orderBy: NonNullable<InventoryFindManyInput["orderBy"]>;
      sortOrder: NonNullable<InventoryFindManyInput["sortOrder"]>;
    },
    loggedUser: LoggedUser | null,
  ): Promise<Result<number | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await inventoryRepositoryLegacy.findInventoryIndex(id, order));
  };

  const findInventoryOfEntryId = async (
    entryId: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Inventory | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await inventoryRepository.findInventoryByEntryId(entryId));
  };

  const findAllInventories = async (): Promise<Inventaire[]> => {
    const inventories = await inventoryRepositoryLegacy.findInventaires();

    return [...inventories];
  };

  const findPaginatedInventories = async (
    loggedUser: LoggedUser | null,
    options: InventoriesSearchParams,
  ): Promise<Result<Inventaire[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { orderBy: orderByField, sortOrder, pageSize, pageNumber } = options;

    const inventories = await inventoryRepositoryLegacy.findInventaires({
      ...getSqlPagination({
        pageNumber,
        pageSize,
      }),
      orderBy: orderByField,
      sortOrder,
    });

    return ok([...inventories]);
  };

  const getInventoriesCount = async (loggedUser: LoggedUser | null): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await inventoryRepository.getCount());
  };

  const createInventory = async (
    input: UpsertInventoryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Inventaire, InventoryUpsertFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { associateIds, weatherIds } = input;

    const locality = await localityRepository.findLocalityById(Number.parseInt(input.localityId));
    if (!locality) {
      logger.warn(
        {
          localityId: input.localityId,
        },
        `Corresponding locality for ID=${input.localityId} not found`,
      );
      return err("requiredDataNotFound");
    }

    // Check if an exact same inventory already exists or not
    const existingInventory = await inventoryRepositoryLegacy.findExistingInventaire({
      ...reshapeInputInventoryUpsertData(input, locality),
      associateIds,
      weatherIds,
    });

    if (existingInventory) {
      // We wished to create an inventaire but we already found one,
      // so we won't create anything and simply return the existing one
      return ok(existingInventory);
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      // The inventory we wish to create does not have an equivalent existing one
      // In that case, we proceed as a classic create

      // Create a new inventory
      const createdInventory = await slonik.transaction(async (transactionConnection) => {
        const createdInventaire = await inventoryRepositoryLegacy.createInventaire(
          reshapeInputInventoryUpsertData(input, locality, loggedUser.id),
          transactionConnection,
        );

        if (associateIds?.length) {
          await inventoryAssociateRepository.insertInventaireWithAssocies(
            Number.parseInt(createdInventaire.id),
            associateIds.map((associateId) => Number.parseInt(associateId)),
            transactionConnection,
          );
        }

        if (weatherIds?.length) {
          await inventoryWeatherRepository.insertInventaireWithMeteos(
            Number.parseInt(createdInventaire.id),
            weatherIds.map((weatherId) => Number.parseInt(weatherId)),
            transactionConnection,
          );
        }

        return createdInventaire;
      });

      return ok(createdInventory);
    }
  };

  const updateInventory = async (
    id: number,
    input: UpsertInventoryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Inventaire, InventoryUpdateFailureReason>> => {
    if (!loggedUser) {
      return err({ type: "notAllowed" });
    }

    const { migrateDonneesIfMatchesExistingInventaire = false, ...inputData } = input;
    const { associateIds, weatherIds } = inputData;

    const locality = await localityRepository.findLocalityById(Number.parseInt(input.localityId));
    if (!locality) {
      logger.warn(
        {
          localityId: input.localityId,
        },
        `Corresponding locality for ID=${input.localityId} not found`,
      );
      return err({ type: "requiredDataNotFound" });
    }

    // Check if an exact same inventory already exists or not
    const existingInventory = await inventoryRepositoryLegacy.findExistingInventaire({
      ...reshapeInputInventoryUpsertData(inputData, locality),
      associateIds,
      weatherIds,
    });

    if (existingInventory) {
      // The inventaire we wish to upsert has already an existing equivalent
      // So now it depends on what we wished to do initially

      if (!migrateDonneesIfMatchesExistingInventaire) {
        // This is the tricky case
        // We had an existing inventory A that we expected to update
        // Meanwhile we found that the new values correspond to another already inventory B
        // So we should not update inventory A but we should provide as feedback that we did not update it
        // because it is already corresponding to B.
        // With this information, it is up to the caller to react accordingly
        // (e.g. ask all donnees from inventory B to be moved to A),
        // but this is not up to this upsert method to take this initiave
        return err({
          type: "similarInventoryAlreadyExists",
          correspondingInventoryFound: existingInventory.id,
        });
      }

      // In that case, the user explicitely requested that the donnees of inventory A
      // should now be linked to inventory B if matches

      // We update the inventory ID for the donnees and we delete the duplicated inventory
      await slonik.transaction(async (transactionConnection) => {
        await entryRepository.updateAssociatedInventaire(
          id,
          Number.parseInt(existingInventory.id),
          transactionConnection,
        );
        await inventoryRepository.deleteInventoryById(`${id}`);
      });

      // We wished to create an inventory but we already found one,
      // so we won't create anything and simply return the existing one
      return ok(existingInventory);
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      // The inventory we wish to update does not have an equivalent existing one
      // In that case, we proceed as a classic update

      // Update an existing inventory
      const updatedInventory = await slonik.transaction(async (transactionConnection) => {
        const updatedInventaire = await inventoryRepositoryLegacy.updateInventaire(
          id,
          reshapeInputInventoryUpsertData(inputData, locality, loggedUser.id),
          transactionConnection,
        );

        await inventoryAssociateRepository.deleteAssociesOfInventaireId(id, transactionConnection);

        if (associateIds?.length) {
          await inventoryAssociateRepository.insertInventaireWithAssocies(
            id,
            associateIds.map((associateId) => Number.parseInt(associateId)),
            transactionConnection,
          );
        }

        await inventoryWeatherRepository.deleteMeteosOfInventaireId(id, transactionConnection);

        if (weatherIds?.length) {
          await inventoryWeatherRepository.insertInventaireWithMeteos(
            id,
            weatherIds.map((weatherId) => Number.parseInt(weatherId)),
            transactionConnection,
          );
        }

        return updatedInventaire;
      });

      return ok(updatedInventory);
    }
  };

  const deleteInventory = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Inventory | null, InventoryDeleteFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing inventory
    if (loggedUser?.role !== "admin") {
      const existingInventory = await inventoryRepository.findInventoryById(Number.parseInt(id));

      if (existingInventory?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const deletedInventoryResult = await slonik.transaction(async (transactionConnection) => {
      const entriesOfInventory = await entryRepository.getCountByInventaireId(
        Number.parseInt(id),
        transactionConnection,
      );

      if (entriesOfInventory > 0) {
        return err("inventoryStillInUse");
      }
      return ok(await inventoryRepository.deleteInventoryById(id));
    });

    if (deletedInventoryResult.isErr()) {
      return err(deletedInventoryResult.error as InventoryDeleteFailureReason);
    }

    return deletedInventoryResult;
  };

  return {
    findInventory,
    findInventoryIndex,
    findInventoryOfEntryId,
    findAllInventories,
    findPaginatedInventories,
    getInventoriesCount,
    createInventory,
    updateInventory,
    deleteInventory,
  };
};

export type InventoryService = ReturnType<typeof buildInventoryService>;
