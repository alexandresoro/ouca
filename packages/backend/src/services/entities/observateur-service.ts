import { type ObserversSearchParams, type UpsertObserverInput } from "@ou-ca/common/api/observer";
import { type Observer } from "@ou-ca/common/entities/observer";
import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type ObservateurCreateInput } from "../../repositories/observateur/observateur-repository-types.js";
import { type ObservateurRepository } from "../../repositories/observateur/observateur-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "./entities-utils.js";

type ObservateurServiceDependencies = {
  logger: Logger;
  observateurRepository: ObservateurRepository;
  donneeRepository: DonneeRepository;
};

export const buildObservateurService = ({
  observateurRepository,
  donneeRepository,
}: ObservateurServiceDependencies) => {
  const findObservateur = async (id: number, loggedUser: LoggedUser | null): Promise<Observer | null> => {
    validateAuthorization(loggedUser);

    const observer = await observateurRepository.findObservateurById(id);
    return enrichEntityWithEditableStatus(observer, loggedUser);
  };

  const getDonneesCountByObservateur = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByObservateurId(parseInt(id));
  };

  const findObservateurOfInventaireId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Observer | null> => {
    validateAuthorization(loggedUser);

    const observer = await observateurRepository.findObservateurByInventaireId(inventaireId);
    return enrichEntityWithEditableStatus(observer, loggedUser);
  };

  const findAssociesIdsOfInventaireId = async (inventaireId: number): Promise<string[]> => {
    const associesIds = await observateurRepository
      .findAssociesOfInventaireId(inventaireId)
      .then((associes) => associes.map(({ id }) => id));

    return [...associesIds];
  };

  const findAssociesOfInventaireId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Observer[]> => {
    validateAuthorization(loggedUser);

    const associes = await observateurRepository.findAssociesOfInventaireId(inventaireId);

    const enrichedAssociates = associes.map((associate) => {
      return enrichEntityWithEditableStatus(associate, loggedUser);
    });

    return [...enrichedAssociates];
  };

  const findAllObservateurs = async (): Promise<Observer[]> => {
    const observateurs = await observateurRepository.findObservateurs({
      orderBy: COLUMN_LIBELLE,
    });

    const enrichedObservers = observateurs.map((observer) => {
      return enrichEntityWithEditableStatus(observer, null);
    });

    return [...enrichedObservers];
  };

  const findPaginatedObservateurs = async (
    loggedUser: LoggedUser | null,
    options: ObserversSearchParams
  ): Promise<Observer[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const observateurs = await observateurRepository.findObservateurs({
      q,
      ...getSqlPagination(pagination),
      orderBy: orderByField,
      sortOrder,
    });

    const enrichedObservers = observateurs.map((observer) => {
      return enrichEntityWithEditableStatus(observer, loggedUser);
    });

    return [...enrichedObservers];
  };

  const getObservateursCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return observateurRepository.getCount(q);
  };

  const createObservateur = async (input: UpsertObserverInput, loggedUser: LoggedUser | null): Promise<Observer> => {
    validateAuthorization(loggedUser);

    // Create a new observer
    try {
      const createdObservateur = await observateurRepository.createObservateur({
        ...input,
        owner_id: loggedUser?.id,
      });

      return enrichEntityWithEditableStatus(createdObservateur, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateObservateur = async (
    id: number,
    input: UpsertObserverInput,
    loggedUser: LoggedUser | null
  ): Promise<Observer> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await observateurRepository.findObservateurById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing observer
    try {
      const updatedObservateur = await observateurRepository.updateObservateur(id, input);

      return enrichEntityWithEditableStatus(updatedObservateur, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteObservateur = async (id: number, loggedUser: LoggedUser | null): Promise<Observer> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await observateurRepository.findObservateurById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedObserver = await observateurRepository.deleteObservateurById(id);
    return enrichEntityWithEditableStatus(deletedObserver, loggedUser);
  };

  const createObservateurs = async (
    observateurs: Omit<ObservateurCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Observer[]> => {
    const createdObservers = await observateurRepository.createObservateurs(
      observateurs.map((observateur) => {
        return { ...observateur, owner_id: loggedUser.id };
      })
    );

    const enrichedCreatedObservers = createdObservers.map((observer) => {
      return enrichEntityWithEditableStatus(observer, loggedUser);
    });

    return enrichedCreatedObservers;
  };

  return {
    findObservateur,
    getDonneesCountByObservateur,
    findObservateurOfInventaireId,
    findAssociesOfInventaireId,
    findAssociesIdsOfInventaireId,
    findAllObservateurs,
    findPaginatedObservateurs,
    getObservateursCount,
    createObservateur,
    updateObservateur,
    deleteObservateur,
    createObservateurs,
  };
};

export type ObservateurService = ReturnType<typeof buildObservateurService>;
