import { type InventoriesSearchParams, type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type InventaireAssocieRepository } from "../../repositories/inventaire-associe/inventaire-associe-repository.js";
import { type InventaireMeteoRepository } from "../../repositories/inventaire-meteo/inventaire-meteo-repository.js";
import { type Inventaire } from "../../repositories/inventaire/inventaire-repository-types.js";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { type LieuditRepository } from "../../repositories/lieudit/lieudit-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { logger } from "../../utils/logger.js";
import { validateAuthorization } from "./authorization-utils.js";
import { getSqlPagination } from "./entities-utils.js";
import { reshapeInputInventaireUpsertData } from "./inventaire-service-reshape.js";

type InventaireServiceDependencies = {
  logger: Logger;
  slonik: DatabasePool;
  inventaireRepository: InventaireRepository;
  inventaireAssocieRepository: InventaireAssocieRepository;
  inventaireMeteoRepository: InventaireMeteoRepository;
  donneeRepository: DonneeRepository;
  lieuditRepository: LieuditRepository;
};

export const buildInventaireService = ({
  slonik,
  inventaireRepository,
  inventaireAssocieRepository,
  inventaireMeteoRepository,
  donneeRepository,
  lieuditRepository,
}: InventaireServiceDependencies) => {
  const findInventaire = async (id: number, loggedUser: LoggedUser | null): Promise<Inventaire | null> => {
    validateAuthorization(loggedUser);

    const inventaire = await inventaireRepository.findInventaireById(id);

    return inventaire;
  };

  const findInventoryIndex = async (id: number, loggedUser: LoggedUser | null): Promise<number | null> => {
    validateAuthorization(loggedUser);
    return inventaireRepository.findInventoryIndex(id);
  };

  const findInventaireOfDonneeId = async (
    donneeId: string | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Inventaire | null> => {
    validateAuthorization(loggedUser);

    return inventaireRepository.findInventaireByDonneeId(donneeId ? parseInt(donneeId) : undefined);
  };

  const findAllInventaires = async (): Promise<Inventaire[]> => {
    const inventaires = await inventaireRepository.findInventaires();

    return [...inventaires];
  };

  const findPaginatedInventaires = async (
    loggedUser: LoggedUser | null,
    options: InventoriesSearchParams
  ): Promise<Inventaire[]> => {
    validateAuthorization(loggedUser);

    const { orderBy: orderByField, sortOrder, pageSize, pageNumber } = options;

    const inventories = await inventaireRepository.findInventaires({
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

    return inventaireRepository.getCount();
  };

  const createInventaire = async (input: UpsertInventoryInput, loggedUser: LoggedUser | null): Promise<Inventaire> => {
    validateAuthorization(loggedUser);

    const { associateIds, weatherIds } = input;

    const locality = await lieuditRepository.findLieuditById(parseInt(input.localityId));
    if (!locality) {
      logger.warn(
        {
          localityId: input.localityId,
        },
        `Corresponding locality for ID=${input.localityId} not found`
      );
      return Promise.reject("");
    }

    // Check if an exact same inventaire already exists or not
    const existingInventaire = await inventaireRepository.findExistingInventaire({
      ...reshapeInputInventaireUpsertData(input, locality),
      associateIds,
      weatherIds,
    });

    if (existingInventaire) {
      // We wished to create an inventaire but we already found one,
      // so we won't create anything and simply return the existing one
      return existingInventaire;
    } else {
      // The inventaire we wish to create does not have an equivalent existing one
      // In that case, we proceed as a classic create

      // Create a new inventaire
      const createdInventaire = await slonik.transaction(async (transactionConnection) => {
        const createdInventaire = await inventaireRepository.createInventaire(
          reshapeInputInventaireUpsertData(input, locality, loggedUser.id),
          transactionConnection
        );

        if (associateIds?.length) {
          await inventaireAssocieRepository.insertInventaireWithAssocies(
            parseInt(createdInventaire.id),
            associateIds.map((associateId) => parseInt(associateId)),
            transactionConnection
          );
        }

        if (weatherIds?.length) {
          await inventaireMeteoRepository.insertInventaireWithMeteos(
            parseInt(createdInventaire.id),
            weatherIds.map((weatherId) => parseInt(weatherId)),
            transactionConnection
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
    loggedUser: LoggedUser | null
  ): Promise<Inventaire> => {
    validateAuthorization(loggedUser);

    const { migrateDonneesIfMatchesExistingInventaire = false, ...inputData } = input;
    const { associateIds, weatherIds } = inputData;

    const locality = await lieuditRepository.findLieuditById(parseInt(input.localityId));
    if (!locality) {
      logger.warn(
        {
          localityId: input.localityId,
        },
        `Corresponding locality for ID=${input.localityId} not found`
      );
      return Promise.reject("");
    }

    // Check if an exact same inventaire already exists or not
    const existingInventaire = await inventaireRepository.findExistingInventaire({
      ...reshapeInputInventaireUpsertData(inputData, locality),
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
        await donneeRepository.updateAssociatedInventaire(id, parseInt(existingInventaire.id), transactionConnection);
        await inventaireRepository.deleteInventaireById(id, transactionConnection);
      });

      // We wished to create an inventaire but we already found one,
      // so we won't create anything and simply return the existing one
      return existingInventaire;
    } else {
      // The inventaire we wish to update does not have an equivalent existing one
      // In that case, we proceed as a classic update

      // Update an existing inventaire
      const updatedInventaire = await slonik.transaction(async (transactionConnection) => {
        const updatedInventaire = await inventaireRepository.updateInventaire(
          id,
          reshapeInputInventaireUpsertData(inputData, locality, loggedUser.id),
          transactionConnection
        );

        await inventaireAssocieRepository.deleteAssociesOfInventaireId(id, transactionConnection);

        if (associateIds?.length) {
          await inventaireAssocieRepository.insertInventaireWithAssocies(
            id,
            associateIds.map((associateId) => parseInt(associateId)),
            transactionConnection
          );
        }

        await inventaireMeteoRepository.deleteMeteosOfInventaireId(id, transactionConnection);

        if (weatherIds?.length) {
          await inventaireMeteoRepository.insertInventaireWithMeteos(
            id,
            weatherIds.map((weatherId) => parseInt(weatherId)),
            transactionConnection
          );
        }

        return updatedInventaire;
      });

      return updatedInventaire;
    }
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
  };
};

export type InventaireService = ReturnType<typeof buildInventaireService>;
