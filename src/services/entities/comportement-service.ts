import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import {
  type MutationUpsertComportementArgs,
  type QueryComportementsArgs,
} from "../../graphql/generated/graphql-types";
import { type ComportementRepository } from "../../repositories/comportement/comportement-repository";
import {
  type Comportement,
  type ComportementCreateInput,
} from "../../repositories/comportement/comportement-repository-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type LoggedUser } from "../../types/User";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination } from "./entities-utils";

type ComportementServiceDependencies = {
  logger: Logger;
  comportementRepository: ComportementRepository;
  donneeRepository: DonneeRepository;
};

export const buildComportementService = ({
  comportementRepository,
  donneeRepository,
}: ComportementServiceDependencies) => {
  const findComportement = async (id: number, loggedUser: LoggedUser | null): Promise<Comportement | null> => {
    validateAuthorization(loggedUser);

    return comportementRepository.findComportementById(id);
  };

  const getDonneesCountByComportement = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByComportementId(id);
  };

  const findAllComportements = async (): Promise<Comportement[]> => {
    const comportements = await comportementRepository.findComportements({
      orderBy: COLUMN_CODE,
    });

    return [...comportements];
  };

  const findPaginatedComportements = async (
    loggedUser: LoggedUser | null,
    options: QueryComportementsArgs = {}
  ): Promise<Comportement[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, orderBy: orderByField, sortOrder } = options;

    const comportements = await comportementRepository.findComportements({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...comportements];
  };

  const getComportementsCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return comportementRepository.getCount(q);
  };

  const upsertComportement = async (
    args: MutationUpsertComportementArgs,
    loggedUser: LoggedUser | null
  ): Promise<Comportement> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedComportement: Comportement;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser?.role !== "admin") {
        const existingData = await comportementRepository.findComportementById(id);

        if (existingData?.ownerId !== loggedUser?.id) {
          throw new OucaError("OUCA0001");
        }
      }

      try {
        upsertedComportement = await comportementRepository.updateComportement(id, data);
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      try {
        upsertedComportement = await comportementRepository.createComportement({
          ...data,
          owner_id: loggedUser.id,
        });
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    }

    return upsertedComportement;
  };

  const deleteComportement = async (id: number, loggedUser: LoggedUser | null): Promise<Comportement> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await comportementRepository.findComportementById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return comportementRepository.deleteComportementById(id);
  };

  const createComportements = async (
    comportements: Omit<ComportementCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly Comportement[]> => {
    return comportementRepository.createComportements(
      comportements.map((comportement) => {
        return { ...comportement, owner_id: loggedUser.id };
      })
    );
  };

  return {
    findComportement,
    getDonneesCountByComportement,
    findAllComportements,
    findPaginatedComportements,
    getComportementsCount,
    upsertComportement,
    deleteComportement,
    createComportements,
  };
};

export type ComportementService = ReturnType<typeof buildComportementService>;
