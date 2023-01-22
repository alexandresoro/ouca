import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import {
  type DonneeNavigationData,
  type InputDonnee,
  type MutationUpsertDonneeArgs,
  type PaginatedSearchDonneesResultResultArgs,
  type SearchDonneeCriteria,
} from "../../graphql/generated/graphql-types.js";
import { type DonneeComportementRepository } from "../../repositories/donnee-comportement/donnee-comportement-repository.js";
import { type DonneeMilieuRepository } from "../../repositories/donnee-milieu/donnee-milieu-repository.js";
import { type Donnee } from "../../repositories/donnee/donnee-repository-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository.js";
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
    options: PaginatedSearchDonneesResultResultArgs = {}
  ): Promise<Donnee[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, searchCriteria, orderBy: orderByField, sortOrder } = options;

    const donnees = await donneeRepository.findDonnees({
      searchCriteria,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...donnees];
  };

  const getDonneesCount = async (
    loggedUser: LoggedUser | null,
    searchCriteria?: SearchDonneeCriteria | null
  ): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCount(searchCriteria);
  };

  const findDonneeNavigationData = async (
    loggedUser: LoggedUser | null,
    donneeId: number | undefined
  ): Promise<DonneeNavigationData> => {
    validateAuthorization(loggedUser);

    if (donneeId == null) {
      return {
        index: 0,
      };
    }
    const [previousDonneeId, nextDonneeId, index] = await Promise.all([
      donneeRepository.findPreviousDonneeId(donneeId),
      donneeRepository.findNextDonneeId(donneeId),
      donneeRepository.findDonneeIndex(donneeId),
    ]);

    return {
      index,
      previousDonneeId,
      nextDonneeId,
    };
  };

  const findLastDonneeId = async (loggedUser: LoggedUser | null): Promise<number | null> => {
    validateAuthorization(loggedUser);

    const latestDonneeId = await donneeRepository.findLatestDonneeId();

    return latestDonneeId;
  };

  const findNextRegroupement = async (loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    const latestRegroupement = await donneeRepository.findLatestRegroupement();
    return (latestRegroupement ?? 0) + 1;
  };

  const upsertDonnee = async (args: MutationUpsertDonneeArgs, loggedUser: LoggedUser | null): Promise<Donnee> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;
    const { comportementsIds, milieuxIds } = data;

    // Check if an exact same donnee already exists or not
    const existingDonnee = await donneeRepository.findExistingDonnee({
      ...reshapeInputDonneeUpsertData(data),
      comportementsIds: comportementsIds ?? [],
      milieuxIds: milieuxIds ?? [],
    });

    if (existingDonnee && existingDonnee.id !== id) {
      // The donnee already exists so we return an error
      throw new OucaError("OUCA0004", {
        code: "OUCA0004",
        message: `Cette donnée existe déjà (ID = ${existingDonnee.id}).`,
      });
    } else {
      if (id) {
        const updatedDonnee = await slonik.transaction(async (transactionConnection) => {
          const updatedDonnee = await donneeRepository.updateDonnee(
            id,
            reshapeInputDonneeUpsertData(data),
            transactionConnection
          );

          await donneeComportementRepository.deleteComportementsOfDonneeId(id, transactionConnection);

          if (comportementsIds?.length) {
            await donneeComportementRepository.insertDonneeWithComportements(
              id,
              comportementsIds,
              transactionConnection
            );
          }

          await donneeMilieuRepository.deleteMilieuxOfDonneeId(id, transactionConnection);

          if (milieuxIds?.length) {
            await donneeMilieuRepository.insertDonneeWithMilieux(id, milieuxIds, transactionConnection);
          }

          return updatedDonnee;
        });

        return updatedDonnee;
      } else {
        return createDonnee(data);
      }
    }
  };

  const createDonnee = async (donnee: InputDonnee): Promise<Donnee> => {
    const { comportementsIds, milieuxIds } = donnee;

    const createdDonnee = await slonik.transaction(async (transactionConnection) => {
      const createdDonnee = await donneeRepository.createDonnee(
        reshapeInputDonneeUpsertData(donnee),
        transactionConnection
      );

      if (comportementsIds?.length) {
        await donneeComportementRepository.insertDonneeWithComportements(
          createdDonnee.id,
          comportementsIds,
          transactionConnection
        );
      }

      if (milieuxIds?.length) {
        await donneeMilieuRepository.insertDonneeWithMilieux(createdDonnee.id, milieuxIds, transactionConnection);
      }

      return createdDonnee;
    });

    return createdDonnee;
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
    upsertDonnee,
    createDonnee,
    deleteDonnee,
  };
};

export type DonneeService = ReturnType<typeof buildDonneeService>;
