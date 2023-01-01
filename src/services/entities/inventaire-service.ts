import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import {
  type MutationUpsertInventaireArgs,
  type UpsertInventaireFailureReason,
} from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type InventaireAssocieRepository } from "../../repositories/inventaire-associe/inventaire-associe-repository";
import { type InventaireMeteoRepository } from "../../repositories/inventaire-meteo/inventaire-meteo-repository";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository";
import { type Inventaire } from "../../repositories/inventaire/inventaire-repository-types";
import { type LoggedUser } from "../../types/User";
import { validateAuthorization } from "./authorization-utils";
import { reshapeInputInventaireUpsertData } from "./inventaire-service-reshape";

type InventaireServiceDependencies = {
  logger: Logger;
  slonik: DatabasePool;
  inventaireRepository: InventaireRepository;
  inventaireAssocieRepository: InventaireAssocieRepository;
  inventaireMeteoRepository: InventaireMeteoRepository;
  donneeRepository: DonneeRepository;
};

export const buildInventaireService = ({
  slonik,
  inventaireRepository,
  inventaireAssocieRepository,
  inventaireMeteoRepository,
  donneeRepository,
}: InventaireServiceDependencies) => {
  const findInventaire = async (id: number, loggedUser: LoggedUser | null): Promise<Inventaire | null> => {
    validateAuthorization(loggedUser);

    const inventaire = await inventaireRepository.findInventaireById(id);

    return inventaire;
  };

  const findInventaireOfDonneeId = async (
    donneeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Inventaire | null> => {
    validateAuthorization(loggedUser);

    return inventaireRepository.findInventaireByDonneeId(donneeId);
  };

  const findAllInventaires = async (): Promise<Inventaire[]> => {
    const inventaires = await inventaireRepository.findInventaires();

    return [...inventaires];
  };

  const upsertInventaire = async (
    args: MutationUpsertInventaireArgs,
    loggedUser: LoggedUser | null
  ): Promise<Inventaire> => {
    validateAuthorization(loggedUser);

    const { id, data, migrateDonneesIfMatchesExistingInventaire = false } = args;
    const { associesIds, meteosIds } = data;

    // Check if an exact same inventaire already exists or not
    const existingInventaire = await inventaireRepository.findExistingInventaire({
      ...reshapeInputInventaireUpsertData(data),
      associesIds: associesIds ?? [],
      meteosIds: meteosIds ?? [],
    });

    if (existingInventaire) {
      // The inventaire we wish to upsert has already an existing equivalent
      // So now it depends on what we wished to do initially

      if (id && !migrateDonneesIfMatchesExistingInventaire) {
        // This is the tricky case
        // We had an existing inventaire A that we expected to update
        // Meanwhile we found that the new values correspond to another already inventaire B
        // So we should not update inventaire A but we should provide as feedback that we did not update it
        // because it is already corresponding to B.
        // With this information, it is up to the caller to react accordingly
        // (e.g. ask all donnees from inventaire B to be moved to A),
        // but this is not up to this upsert method to take this initiave
        const upsertInventaireFailureReason: UpsertInventaireFailureReason = {
          inventaireExpectedToBeUpdated: id,
          correspondingInventaireFound: existingInventaire.id,
        };
        return Promise.reject(upsertInventaireFailureReason);
      }

      if (id) {
        // In that case, the user explicitely requested that the donnees of inventaire A
        // should now be linked to inventaire B if matches

        // We update the inventaire ID for the donnees and we delete the duplicated inventaire
        await slonik.transaction(async (transactionConnection) => {
          await donneeRepository.updateAssociatedInventaire(id, existingInventaire.id, transactionConnection);
          await inventaireRepository.deleteInventaireById(id, transactionConnection);
        });
      }

      // We wished to create an inventaire but we already found one,
      // so we won't create anything and simply return the existing one
      return existingInventaire;
    } else {
      // The inventaire we wish to upsert does not have an equivalent existing one
      // In that case, we proceed as a classic upsert

      if (id) {
        // Update an existing inventaire
        const updatedInventaire = await slonik.transaction(async (transactionConnection) => {
          const updatedInventaire = await inventaireRepository.updateInventaire(
            id,
            reshapeInputInventaireUpsertData(data, loggedUser.id),
            transactionConnection
          );

          await inventaireAssocieRepository.deleteAssociesOfInventaireId(id, transactionConnection);

          if (associesIds?.length) {
            await inventaireAssocieRepository.insertInventaireWithAssocies(id, associesIds, transactionConnection);
          }

          await inventaireMeteoRepository.deleteMeteosOfInventaireId(id, transactionConnection);

          if (meteosIds?.length) {
            await inventaireMeteoRepository.insertInventaireWithMeteos(id, meteosIds, transactionConnection);
          }

          return updatedInventaire;
        });

        return updatedInventaire;
      } else {
        // Create a new inventaire
        const createdInventaire = await slonik.transaction(async (transactionConnection) => {
          const createdInventaire = await inventaireRepository.createInventaire(
            reshapeInputInventaireUpsertData(data, loggedUser.id),
            transactionConnection
          );

          if (associesIds?.length) {
            await inventaireAssocieRepository.insertInventaireWithAssocies(
              createdInventaire.id,
              associesIds,
              transactionConnection
            );
          }

          if (meteosIds?.length) {
            await inventaireMeteoRepository.insertInventaireWithMeteos(
              createdInventaire.id,
              meteosIds,
              transactionConnection
            );
          }

          return createdInventaire;
        });

        return createdInventaire;
      }
    }
  };

  return {
    findInventaire,
    findInventaireOfDonneeId,
    findAllInventaires,
    upsertInventaire,
  };
};

export type InventaireService = ReturnType<typeof buildInventaireService>;
