import { type Logger } from "pino";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { type MutationUpsertMilieuArgs, type QueryMilieuxArgs } from "../../graphql/generated/graphql-types.js";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository.js";
import { type Milieu, type MilieuCreateInput } from "../../repositories/milieu/milieu-repository-types.js";
import { type MilieuRepository } from "../../repositories/milieu/milieu-repository.js";
import { type LoggedUser } from "../../types/User.js";
import { COLUMN_LIBELLE } from "../../utils/constants.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";
import { getSqlPagination } from "./entities-utils.js";

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

  const createMilieu = async (input: MutationUpsertMilieuArgs, loggedUser: LoggedUser | null): Promise<Milieu> => {
    validateAuthorization(loggedUser);

    const { data } = input;

    try {
      const upsertedMilieu = await milieuRepository.createMilieu({
        ...data,
        owner_id: loggedUser.id,
      });

      return upsertedMilieu;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
  };

  const updateMilieu = async (
    id: number,
    input: MutationUpsertMilieuArgs,
    loggedUser: LoggedUser | null
  ): Promise<Milieu> => {
    validateAuthorization(loggedUser);

    const { data } = input;

    // Check that the user is allowed to modify the existing data
    if (loggedUser?.role !== "admin") {
      const existingData = await milieuRepository.findMilieuById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        throw new OucaError("OUCA0001");
      }
    }

    try {
      const upsertedMilieu = await milieuRepository.updateMilieu(id, data);

      return upsertedMilieu;
    } catch (e) {
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new OucaError("OUCA0004", e);
      }
      throw e;
    }
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
    createMilieu,
    updateMilieu,
    deleteMilieu,
    createMilieux,
  };
};

export type MilieuService = ReturnType<typeof buildMilieuService>;
