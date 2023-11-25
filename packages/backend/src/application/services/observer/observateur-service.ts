import { type AgeCreateInput } from "@domain/age/age.js";
import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type ObserverRepository } from "@interfaces/observer-repository-interface.js";
import { type Observer, type ObserverSimple } from "@ou-ca/common/api/entities/observer";
import { type ObserversSearchParams, type UpsertObserverInput } from "@ou-ca/common/api/observer";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type DonneeRepository } from "../../../repositories/donnee/donnee-repository.js";
import { type InventaireRepository } from "../../../repositories/inventaire/inventaire-repository.js";
import { enrichEntityWithEditableStatus, getSqlPagination } from "../../../services/entities/entities-utils.js";
import { COLUMN_LIBELLE } from "../../../utils/constants.js";
import { validateAuthorization } from "../authorization/authorization-utils.js";

type ObservateurServiceDependencies = {
  inventaireRepository: InventaireRepository;
  observerRepository: ObserverRepository;
  donneeRepository: DonneeRepository;
};

export const buildObservateurService = ({
  observerRepository,
  inventaireRepository,
  donneeRepository,
}: ObservateurServiceDependencies) => {
  const findObservateur = async (id: number, loggedUser: LoggedUser | null): Promise<Observer | null> => {
    validateAuthorization(loggedUser);

    const observer = await observerRepository.findObserverById(id);
    return enrichEntityWithEditableStatus(observer, loggedUser);
  };

  /**
   * @deprecated
   */
  const getInventoriesCountByObserver = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return inventaireRepository.getCountByObserver(parseInt(id));
  };

  /**
   * @deprecated
   */
  const getDonneesCountByObservateur = async (id: string, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByObservateurId(parseInt(id));
  };

  const findObservateurOfInventaireId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<ObserverSimple | null> => {
    validateAuthorization(loggedUser);

    const observer = await observerRepository.findObserverByInventoryId(inventaireId);
    return enrichEntityWithEditableStatus(observer, loggedUser);
  };

  const findAssociesIdsOfInventaireId = async (inventaireId: number): Promise<string[]> => {
    const associesIds = await observerRepository
      .findAssociatesOfInventoryId(inventaireId)
      .then((associes) => associes.map(({ id }) => id));

    return [...associesIds];
  };

  const findAssociesOfInventaireId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<ObserverSimple[]> => {
    validateAuthorization(loggedUser);

    const associes = await observerRepository.findAssociatesOfInventoryId(inventaireId);

    const enrichedAssociates = associes.map((associate) => {
      return enrichEntityWithEditableStatus(associate, loggedUser);
    });

    return [...enrichedAssociates];
  };

  const findAllObservateurs = async (): Promise<ObserverSimple[]> => {
    const observateurs = await observerRepository.findObservers({
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
  ): Promise<ObserverSimple[]> => {
    validateAuthorization(loggedUser);

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const observateurs = await observerRepository.findObservers({
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

    return observerRepository.getCount(q);
  };

  const createObservateur = async (input: UpsertObserverInput, loggedUser: LoggedUser | null): Promise<Observer> => {
    validateAuthorization(loggedUser);

    // Create a new observer
    try {
      const createdObservateur = await observerRepository.createObserver({
        ...input,
        ownerId: loggedUser?.id,
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
      const existingData = await observerRepository.findObserverById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing observer
    try {
      const updatedObservateur = await observerRepository.updateObserver(id, input);

      return enrichEntityWithEditableStatus(updatedObservateur, loggedUser);
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteObservateur = async (id: number, loggedUser: LoggedUser | null): Promise<ObserverSimple | null> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await observerRepository.findObserverById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    const deletedObserver = await observerRepository.deleteObserverById(id);
    return deletedObserver ? enrichEntityWithEditableStatus(deletedObserver, loggedUser) : null;
  };

  const createObservateurs = async (
    observateurs: Omit<AgeCreateInput, "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly ObserverSimple[]> => {
    const createdObservers = await observerRepository.createObservers(
      observateurs.map((observateur) => {
        return { ...observateur, ownerId: loggedUser.id };
      })
    );

    const enrichedCreatedObservers = createdObservers.map((observer) => {
      return enrichEntityWithEditableStatus(observer, loggedUser);
    });

    return enrichedCreatedObservers;
  };

  return {
    findObservateur,
    /**
     * @deprecated
     */
    getInventoriesCountByObserver,
    /**
     * @deprecated
     */
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
