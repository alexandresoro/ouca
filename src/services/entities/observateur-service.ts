import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type MutationUpsertObservateurArgs, type QueryObservateursArgs } from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type ObservateurRepository } from "../../repositories/observateur/observateur-repository";
import {
  type Observateur,
  type ObservateurCreateInput,
} from "../../repositories/observateur/observateur-repository-types";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination } from "./entities-utils";

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

  const upsertObservateur = async (
    args: MutationUpsertObservateurArgs,
    loggedUser: LoggedUser | null
  ): Promise<Observateur> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedObservateur: Observateur;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser.role !== "admin") {
        const existingData = await observateurRepository.findObservateurById(id);

        if (existingData?.ownerId !== loggedUser.id) {
          throw new OucaError("OUCA0001");
        }
      }

      // Update an existing observer
      try {
        upsertedObservateur = await observateurRepository.updateObservateur(id, data);
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      // Create a new observer
      try {
        upsertedObservateur = await observateurRepository.createObservateur({
          ...data,
          owner_id: loggedUser?.id,
        });
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    }

    return upsertedObservateur;
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
    findAllObservateurs,
    findPaginatedObservateurs,
    getObservateursCount,
    upsertObservateur,
    deleteObservateur,
    createObservateurs,
  };
};

export type ObservateurService = ReturnType<typeof buildObservateurService>;
