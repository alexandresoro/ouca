import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type MutationUpsertMilieuArgs, type QueryMilieuxArgs } from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type MilieuRepository } from "../../repositories/milieu/milieu-repository";
import { type Milieu, type MilieuCreateInput } from "../../repositories/milieu/milieu-repository-types";
import { type LoggedUser } from "../../types/User";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";
import { getSqlPagination } from "./entities-utils";

type MilieuServiceDependencies = {
  logger: Logger;
  milieuRepository: MilieuRepository;
  donneeRepository: DonneeRepository;
};

export const buildMilieuService = ({ milieuRepository, donneeRepository }: MilieuServiceDependencies) => {
  const findMilieu = async (id: number, loggedUser: LoggedUser | null): Promise<Milieu | null> => {
    validateAuthorization(loggedUser);

    return milieuRepository.findMilieuById(id);
  };

  const findMilieuxIdsOfDonneeId = async (donneeId: number): Promise<number[]> => {
    const milieuxIds = await milieuRepository
      .findMilieuxOfDonneeId(donneeId)
      .then((milieux) => milieux.map(({ id }) => id));

    return [...milieuxIds];
  };

  const findMilieuxOfDonneeId = async (
    donneeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Milieu[]> => {
    validateAuthorization(loggedUser);

    const milieux = await milieuRepository.findMilieuxOfDonneeId(donneeId);

    return [...milieux];
  };

  const getDonneesCountByMilieu = async (id: number, loggedUser: LoggedUser | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return donneeRepository.getCountByMilieuId(id);
  };

  const findAllMilieux = async (): Promise<Milieu[]> => {
    const milieux = await milieuRepository.findMilieux({
      orderBy: COLUMN_LIBELLE,
    });

    return [...milieux];
  };

  const findPaginatedMilieux = async (
    loggedUser: LoggedUser | null,
    options: QueryMilieuxArgs = {}
  ): Promise<Milieu[]> => {
    validateAuthorization(loggedUser);

    const { searchParams, orderBy: orderByField, sortOrder } = options;

    const milieux = await milieuRepository.findMilieux({
      q: searchParams?.q,
      ...getSqlPagination(searchParams),
      orderBy: orderByField,
      sortOrder,
    });

    return [...milieux];
  };

  const getMilieuxCount = async (loggedUser: LoggedUser | null, q?: string | null): Promise<number> => {
    validateAuthorization(loggedUser);

    return milieuRepository.getCount(q);
  };

  const upsertMilieu = async (args: MutationUpsertMilieuArgs, loggedUser: LoggedUser | null): Promise<Milieu> => {
    validateAuthorization(loggedUser);

    const { id, data } = args;

    let upsertedMilieu: Milieu;

    if (id) {
      // Check that the user is allowed to modify the existing data
      if (loggedUser?.role !== "admin") {
        const existingData = await milieuRepository.findMilieuById(id);

        if (existingData?.ownerId !== loggedUser?.id) {
          throw new OucaError("OUCA0001");
        }
      }

      try {
        upsertedMilieu = await milieuRepository.updateMilieu(id, data);
      } catch (e) {
        if (e instanceof UniqueIntegrityConstraintViolationError) {
          throw new OucaError("OUCA0004", e);
        }
        throw e;
      }
    } else {
      try {
        upsertedMilieu = await milieuRepository.createMilieu({
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

    return upsertedMilieu;
  };

  const deleteMilieu = async (id: number, loggedUser: LoggedUser | null): Promise<Milieu> => {
    validateAuthorization(loggedUser);

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await milieuRepository.findMilieuById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    return milieuRepository.deleteMilieuById(id);
  };

  const createMilieux = async (
    milieux: Omit<MilieuCreateInput[], "owner_id">,
    loggedUser: LoggedUser
  ): Promise<readonly Milieu[]> => {
    return milieuRepository.createMilieux(
      milieux.map((milieu) => {
        return { ...milieu, owner_id: loggedUser.id };
      })
    );
  };

  return {
    findMilieu,
    findMilieuxIdsOfDonneeId,
    findMilieuxOfDonneeId,
    getDonneesCountByMilieu,
    findAllMilieux,
    findPaginatedMilieux,
    getMilieuxCount,
    upsertMilieu,
    deleteMilieu,
    createMilieux,
  };
};

export type MilieuService = ReturnType<typeof buildMilieuService>;
