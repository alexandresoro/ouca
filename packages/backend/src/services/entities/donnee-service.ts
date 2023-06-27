import { type EntriesSearchParams, type UpsertEntryInput } from "@ou-ca/common/api/entry";
import { type EntryNavigation } from "@ou-ca/common/entities/entry";
import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import { type DonneeComportementRepository } from "../../repositories/donnee-comportement/donnee-comportement-repository.js";
import { type DonneeMilieuRepository } from "../../repositories/donnee-milieu/donnee-milieu-repository.js";
import { type Donnee } from "../../repositories/donnee/donnee-repository-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
import { reshapeSearchCriteria } from "../../repositories/search-criteria.js";
import { type LoggedUser } from "../../types/User.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { reshapeInputDonneeUpsertData } from "./donnee-service-reshape.js";
import { getSqlPagination } from "./entities-utils.js";

type DonneeServiceDependencies = {
  logger: Logger;
  slonik: DatabasePool;
  inventaireRepository: InventaireRepository;
  donneeRepository: DonneeRepository;
  donneeComportementRepository: DonneeComportementRepository;
  donneeMilieuRepository: DonneeMilieuRepository;
};

export const buildDonneeService = ({
  slonik,
  inventaireRepository,
  donneeRepository,
  donneeComportementRepository,
  donneeMilieuRepository,
}: DonneeServiceDependencies) => {
  const findDonnee = async (id: number, loggedUser: LoggedUser | null): Promise<Donnee | null> => {
    validateAuthorization(loggedUser);

    return donneeRepository.findDonneeById(id);
  };

  // Be careful when calling it, it will retrieve a lot of data!
  const findAllDonnees = async (): Promise<Donnee[]> => {
    const donnees = await donneeRepository.findDonnees();

    return [...donnees];
  };

  const findPaginatedDonnees = async (
    loggedUser: LoggedUser | null,
    options: Omit<EntriesSearchParams, "pageNumber" | "pageSize"> & Partial<{ pageNumber: number; pageSize: number }>
  ): Promise<Donnee[]> => {
    validateAuthorization(loggedUser);

    const { orderBy: orderByField, sortOrder, pageSize, pageNumber, ...searchCriteria } = options;

    const reshapedSearchCriteria = reshapeSearchCriteria(searchCriteria);

    const donnees = await donneeRepository.findDonnees({
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

    return donneeRepository.getCount(reshapedSearchCriteria);
  };

  const findDonneeNavigationData = async (loggedUser: LoggedUser | null, entryId: string): Promise<EntryNavigation> => {
    validateAuthorization(loggedUser);

    const [previousEntryId, nextEntryId, index] = await Promise.all([
      donneeRepository.findPreviousDonneeId(parseInt(entryId)),
      donneeRepository.findNextDonneeId(parseInt(entryId)),
      donneeRepository.findDonneeIndex(parseInt(entryId)),
    ]);

    return {
      index,
      previousEntryId: previousEntryId != null ? `${previousEntryId}` : null,
      nextEntryId: nextEntryId != null ? `${nextEntryId}` : null,
    };
  };

  const findLastDonneeId = async (loggedUser: LoggedUser | null): Promise<string | null> => {
    validateAuthorization(loggedUser);

    const latestDonneeId = await donneeRepository.findLatestDonneeId();

    return latestDonneeId;
  };

  const findNextRegroupement = async (loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    const latestRegroupement = await donneeRepository.findLatestRegroupement();
    return (latestRegroupement ?? 0) + 1;
  };

  const createDonnee = async (input: UpsertEntryInput, loggedUser: LoggedUser | null): Promise<Donnee> => {
    validateAuthorization(loggedUser);

    const { behaviorIds, environmentIds } = input;

    // Check if an exact same donnee already exists or not
    const existingDonnee = await donneeRepository.findExistingDonnee({
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
      const createdDonnee = await donneeRepository.createDonnee(
        reshapeInputDonneeUpsertData(input),
        transactionConnection
      );

      if (behaviorIds?.length) {
        await donneeComportementRepository.insertDonneeWithComportements(
          parseInt(createdDonnee.id),
          behaviorIds,
          transactionConnection
        );
      }

      if (environmentIds?.length) {
        await donneeMilieuRepository.insertDonneeWithMilieux(
          parseInt(createdDonnee.id),
          environmentIds,
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
    const existingDonnee = await donneeRepository.findExistingDonnee({
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
    } else {
      const updatedDonnee = await slonik.transaction(async (transactionConnection) => {
        const updatedDonnee = await donneeRepository.updateDonnee(
          parseInt(id),
          reshapeInputDonneeUpsertData(input),
          transactionConnection
        );

        await donneeComportementRepository.deleteComportementsOfDonneeId(parseInt(id), transactionConnection);

        if (behaviorIds?.length) {
          await donneeComportementRepository.insertDonneeWithComportements(
            parseInt(id),
            behaviorIds,
            transactionConnection
          );
        }

        await donneeMilieuRepository.deleteMilieuxOfDonneeId(parseInt(id), transactionConnection);

        if (environmentIds?.length) {
          await donneeMilieuRepository.insertDonneeWithMilieux(parseInt(id), environmentIds, transactionConnection);
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
      const inventaire = await inventaireRepository.findInventaireByDonneeId(id, transactionConnection);

      if (loggedUser.role !== "admin" && inventaire?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }

      // Delete the actual donnee
      const deletedDonnee = await donneeRepository.deleteDonneeById(id, transactionConnection);

      if (!inventaire) {
        return deletedDonnee;
      }

      // Check how many donnees the inventaire has after the deletion
      const nbDonneesOfInventaire = await donneeRepository.getCountByInventaireId(inventaire.id, transactionConnection);

      if (nbDonneesOfInventaire === 0) {
        // If the inventaire has no more donnees then we remove the inventaire
        await inventaireRepository.deleteInventaireById(inventaire.id, transactionConnection);
      }

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
