import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type InventoriesSearchParams, type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type DatabasePool } from "slonik";
import { validateAuthorization } from "../../application/services/authorization/authorization-utils.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type InventaireAssocieRepository } from "../../repositories/inventaire-associe/inventaire-associe-repository.js";
import { type InventaireMeteoRepository } from "../../repositories/inventaire-meteo/inventaire-meteo-repository.js";
import {
  type Inventaire,
  type InventaireFindManyInput,
} from "../../repositories/inventaire/inventaire-repository-types.js";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { logger } from "../../utils/logger.js";
import { getSqlPagination } from "./entities-utils.js";
import { reshapeInputInventoryUpsertData } from "./inventaire-service-reshape.js";

type InventaireServiceDependencies = {
  slonik: DatabasePool;
  inventoryRepository: InventaireRepository;
  inventoryAssociateRepository: InventaireAssocieRepository;
  inventoryWeatherRepository: InventaireMeteoRepository;
  entryRepository: DonneeRepository;
  localityRepository: LieuditRepository;
};

export const buildInventaireService = ({
  slonik,
  inventoryRepository,
  inventoryAssociateRepository,
  inventoryWeatherRepository,
  entryRepository,
  localityRepository,
}: InventaireServiceDependencies) => {
  const findInventaire = async (id: number, loggedUser: LoggedUser | null): Promise<Inventaire | null> => {
    validateAuthorization(loggedUser);

    const inventaire = await inventoryRepository.findInventaireById(id);

    return inventaire;
  };

  const findInventoryIndex = async (
    id: number,
    order: {
      orderBy: NonNullable<InventaireFindManyInput["orderBy"]>;
      sortOrder: NonNullable<InventaireFindManyInput["sortOrder"]>;
    },
    loggedUser: LoggedUser | null,
  ): Promise<number | null> => {
    validateAuthorization(loggedUser);
    return inventoryRepository.findInventoryIndex(id, order);
  };

  const findInventaireOfDonneeId = async (
    entryId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Inventaire | null> => {
    validateAuthorization(loggedUser);

    return inventoryRepository.findInventaireByDonneeId(entryId ? Number.parseInt(entryId) : undefined);
  };

  const findAllInventaires = async (): Promise<Inventaire[]> => {
    const inventaires = await inventoryRepository.findInventaires();

    return [...inventaires];
  };

  const findPaginatedInventaires = async (
    loggedUser: LoggedUser | null,
    options: InventoriesSearchParams,
  ): Promise<Inventaire[]> => {
    validateAuthorization(loggedUser);

    const { orderBy: orderByField, sortOrder, pageSize, pageNumber } = options;

    const inventories = await inventoryRepository.findInventaires({
      ...getSqlPagination({
        pageNumber,
        pageSize,
      }),
      orderBy: orderByField,
      sortOrder,
    });

    return [...inventories];
  };

  const getInventairesCount = async (loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return inventoryRepository.getCount();
  };

  const createInventaire = async (input: UpsertInventoryInput, loggedUser: LoggedUser | null): Promise<Inventaire> => {
    validateAuthorization(loggedUser);

    const { associateIds, weatherIds } = input;

    const locality = await localityRepository.findLieuditById(Number.parseInt(input.localityId));
    if (!locality) {
      logger.warn(
        {
          localityId: input.localityId,
        },
        `Corresponding locality for ID=${input.localityId} not found`,
      );
      return Promise.reject("");
    }

    // Check if an exact same inventaire already exists or not
    const existingInventaire = await inventoryRepository.findExistingInventaire({
      ...reshapeInputInventoryUpsertData(input, locality),
      associateIds,
      weatherIds,
    });

    if (existingInventaire) {
      // We wished to create an inventaire but we already found one,
      // so we won't create anything and simply return the existing one
      return existingInventaire;
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      // The inventaire we wish to create does not have an equivalent existing one
      // In that case, we proceed as a classic create

      // Create a new inventaire
      const createdInventaire = await slonik.transaction(async (transactionConnection) => {
        const createdInventaire = await inventoryRepository.createInventaire(
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

      return createdInventaire;
    }
  };

  const updateInventaire = async (
    id: number,
    input: UpsertInventoryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Inventaire> => {
    validateAuthorization(loggedUser);

    const { migrateDonneesIfMatchesExistingInventaire = false, ...inputData } = input;
    const { associateIds, weatherIds } = inputData;

    const locality = await localityRepository.findLieuditById(Number.parseInt(input.localityId));
    if (!locality) {
      logger.warn(
        {
          localityId: input.localityId,
        },
        `Corresponding locality for ID=${input.localityId} not found`,
      );
      return Promise.reject("");
    }

    // Check if an exact same inventaire already exists or not
    const existingInventaire = await inventoryRepository.findExistingInventaire({
      ...reshapeInputInventoryUpsertData(inputData, locality),
      associateIds,
      weatherIds,
    });

    if (existingInventaire) {
      // The inventaire we wish to upsert has already an existing equivalent
      // So now it depends on what we wished to do initially

      if (!migrateDonneesIfMatchesExistingInventaire) {
        // This is the tricky case
        // We had an existing inventaire A that we expected to update
        // Meanwhile we found that the new values correspond to another already inventaire B
        // So we should not update inventaire A but we should provide as feedback that we did not update it
        // because it is already corresponding to B.
        // With this information, it is up to the caller to react accordingly
        // (e.g. ask all donnees from inventaire B to be moved to A),
        // but this is not up to this upsert method to take this initiave
        const upsertInventaireFailureReason = {
          inventaireExpectedToBeUpdated: id,
          correspondingInventaireFound: existingInventaire.id,
        };
        return Promise.reject(upsertInventaireFailureReason);
      }

      // In that case, the user explicitely requested that the donnees of inventaire A
      // should now be linked to inventaire B if matches

      // We update the inventaire ID for the donnees and we delete the duplicated inventaire
      await slonik.transaction(async (transactionConnection) => {
        await entryRepository.updateAssociatedInventaire(
          id,
          Number.parseInt(existingInventaire.id),
          transactionConnection,
        );
        await inventoryRepository.deleteInventaireById(id, transactionConnection);
      });

      // We wished to create an inventaire but we already found one,
      // so we won't create anything and simply return the existing one
      return existingInventaire;
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      // The inventaire we wish to update does not have an equivalent existing one
      // In that case, we proceed as a classic update

      // Update an existing inventaire
      const updatedInventaire = await slonik.transaction(async (transactionConnection) => {
        const updatedInventaire = await inventoryRepository.updateInventaire(
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

      return updatedInventaire;
    }
  };

  const deleteInventory = async (id: string, loggedUser: LoggedUser | null): Promise<Inventaire> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing inventory
    if (loggedUser?.role !== "admin") {
      const existingInventory = await inventoryRepository.findInventaireById(Number.parseInt(id));

      if (existingInventory?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedInventory = await slonik.transaction(async (transactionConnection) => {
      const entriesOfInventory = await entryRepository.getCountByInventaireId(
        Number.parseInt(id),
        transactionConnection,
      );

      if (entriesOfInventory > 0) {
        throw new OucaError("OUCA0005");
      }
      return inventoryRepository.deleteInventaireById(Number.parseInt(id), transactionConnection);
    });

    return deletedInventory;
  };

  return {
    findInventaire,
    findInventoryIndex,
    findInventaireOfDonneeId,
    findAllInventaires,
    findPaginatedInventaires,
    getInventairesCount,
    createInventaire,
    updateInventaire,
    deleteInventory,
  };
};

export type InventaireService = ReturnType<typeof buildInventaireService>;
