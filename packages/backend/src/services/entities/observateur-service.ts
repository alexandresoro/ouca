import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  type MutationUpsertObservateurArgs,
  type QueryObservateursArgs,
} from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import {
  type Observateur,
  type ObservateurCreateInput,
} from "../../repositories/observateur/observateur-repository-types.js";
import { type ObservateurRepository } from "../../repositories/observateur/observateur-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { getSqlPagination } from "./entities-utils.js";

type ObservateurServiceDependencies = {
  logger: Logger;
  observateurRepository: ObservateurRepository;
  donneeRepository: DonneeRepository;
};

export const buildObservateurService = ({
  observateurRepository,
  donneeRepository,
}: ObservateurServiceDependencies) => {
  const findObservateur = async (id: number, loggedUser: LoggedUser | null): Promise<Observateur | null> => {
    validateAuthorization(loggedUser);

    return observateurRepository.findObservateurById(id);
  };

  const getDonneesCountByObservateur = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByObservateurId(id);
  };

  const findObservateurOfInventaireId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Observateur | null> => {
    validateAuthorization(loggedUser);

    return observateurRepository.findObservateurByInventaireId(inventaireId);
  };

  const findAssociesIdsOfInventaireId = async (inventaireId: number): Promise<number[]> => {
    const associesIds = await observateurRepository
      .findAssociesOfInventaireId(inventaireId)
      .then((associes) => associes.map(({ id }) => id));

    return [...associesIds];
  };

  const findAssociesOfInventaireId = async (
    inventaireId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Observateur[]> => {
    validateAuthorization(loggedUser);

    const associes = await observateurRepository.findAssociesOfInventaireId(inventaireId);

    return [...associes];
  };

  const findAllObservateurs = async (): Promise<Observateur[]> => {
    const observateurs = await observateurRepository.findObservateurs({
      orderBy: COLUMN_LIBELLE,
    });

    return [...observateurs];
  };

  const findPaginatedObservateurs = async (
    loggedUser: LoggedUser | null,
    options: QueryObservateursArgs = {}
  ): Promise<Observateur[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, orderBy: orderByField, sortOrder } = options;

    const observateurs = await observateurRepository.findObservateurs({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...observateurs];
  };

  const getObservateursCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return observateurRepository.getCount(q);
  };

  const createObservateur = async (
    input: MutationUpsertObservateurArgs,
    loggedUser: LoggedUser | null
  ): Promise<Observateur> => {
    validateAuthorization(loggedUser);

    const { data } = input;

    // Create a new observer
    try {
      const upsertedObservateur = await observateurRepository.createObservateur({
        ...data,
        owner_id: loggedUser?.id,
      });

      return upsertedObservateur;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateObservateur = async (
    id: number,
    input: MutationUpsertObservateurArgs,
    loggedUser: LoggedUser | null
  ): Promise<Observateur> => {
    validateAuthorization(loggedUser);

    const { data } = input;

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await observateurRepository.findObservateurById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    // Update an existing observer
    try {
      const upsertedObservateur = await observateurRepository.updateObservateur(id, data);

      return upsertedObservateur;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const deleteObservateur = async (id: number, loggedUser: LoggedUser | null): Promise<Observateur> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser.role !== "admin") {
      const existingData = await observateurRepository.findObservateurById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return observateurRepository.deleteObservateurById(id);
  };

  const createObservateurs = async (
    observateurs: Omit<ObservateurCreateInput, "owner_id">[],
    loggedUser: LoggedUser
  ): Promise<readonly Observateur[]> => {
    return observateurRepository.createObservateurs(
      observateurs.map((observateur) => {
        return { ...observateur, owner_id: loggedUser.id };
      })
    );
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
