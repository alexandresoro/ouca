import { DatabaseRole, Observateur, Prisma } from "@prisma/client";
import { mock } from "jest-mock-extended";
import { MutationUpsertObservateurArgs, QueryObservateursArgs } from "../../graphql/generated/graphql-types";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_LIBELLE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import { queryParametersToFindAllEntities } from "./entities-utils";
import {
  createObservateurs,
  deleteObservateur,
  findObservateur,
  findObservateurs,
  findObservateursByIds,
  findPaginatedObservateurs,
  getDonneesCountByObservateur,
  getObservateursCount,
  upsertObservateur,
} from "./observateur-service";

const prismaConstraintFailedError = {
  code: "P2002",
  message: "Prisma error message",
};

const prismaConstraintFailed = () => {
  throw new Prisma.PrismaClientKnownRequestError(
    prismaConstraintFailedError.message,
    prismaConstraintFailedError.code,
    ""
  );
};

describe("Find observer", () => {
  test("should handle a matching observer", async () => {
    const observerData = mock<Observateur>();
    const loggedUser = mock<LoggedUser>();

    prismaMock.observateur.findUnique.mockResolvedValueOnce(observerData);

    await findObservateur(observerData.id, loggedUser);

    expect(prismaMock.observateur.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: observerData.id,
      },
    });
  });

  test("should handle observer not found", async () => {
    prismaMock.observateur.findUnique.mockResolvedValueOnce(null);
    const loggedUser = mock<LoggedUser>();

    await expect(findObservateur(10, loggedUser)).resolves.toBe(null);

    expect(prismaMock.observateur.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: 10,
      },
    });
  });

  test("should throw an error when the no login details are provided", async () => {
    await expect(findObservateur(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.observateur.findUnique).not.toHaveBeenCalled();
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = mock<LoggedUser>();

    await getDonneesCountByObservateur(12, loggedUser);

    expect(prismaMock.donnee.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.donnee.count).toHaveBeenLastCalledWith({
      where: {
        inventaire: {
          observateurId: 12,
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getDonneesCountByObservateur(12, null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

test("Find observers by IDs", async () => {
  const observersData = [mock<Observateur>(), mock<Observateur>(), mock<Observateur>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.observateur.findMany.mockResolvedValueOnce(observersData);

  await findObservateursByIds(
    observersData.map((obs) => obs.id),
    loggedUser
  );

  expect(prismaMock.observateur.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      id: {
        in: observersData.map((obs) => obs.id),
      },
    },
  });
});

test("Find all observers", async () => {
  const observersData = [mock<Observateur>(), mock<Observateur>(), mock<Observateur>()];
  const loggedUser = mock<LoggedUser>();

  prismaMock.observateur.findMany.mockResolvedValueOnce(observersData);

  await findObservateurs(loggedUser);

  expect(prismaMock.observateur.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.findMany).toHaveBeenLastCalledWith({
    ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
    where: {
      libelle: {
        contains: undefined,
      },
    },
  });
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const observersData = [mock<Observateur>(), mock<Observateur>(), mock<Observateur>()];
    const loggedUser = mock<LoggedUser>();

    prismaMock.observateur.findMany.mockResolvedValueOnce(observersData);

    await findPaginatedObservateurs(loggedUser);

    expect(prismaMock.observateur.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      orderBy: {},
      where: {},
    });
  });

  test("should handle params when retrieving paginated observers ", async () => {
    const observersData = [mock<Observateur>(), mock<Observateur>(), mock<Observateur>()];
    const loggedUser = mock<LoggedUser>();

    const searchParams: QueryObservateursArgs = {
      orderBy: "libelle",
      sortOrder: "desc",
      searchParams: {
        q: "Bob",
        pageNumber: 0,
        pageSize: 10,
      },
    };

    prismaMock.observateur.findMany.mockResolvedValueOnce([observersData[0]]);

    await findPaginatedObservateurs(loggedUser, searchParams);

    expect(prismaMock.observateur.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.findMany).toHaveBeenLastCalledWith({
      ...queryParametersToFindAllEntities(COLUMN_LIBELLE),
      orderBy: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [searchParams.orderBy!]: searchParams.sortOrder,
      },
      skip: searchParams.searchParams?.pageNumber,
      take: searchParams.searchParams?.pageSize,
      where: {
        libelle: {
          contains: searchParams.searchParams?.q,
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(findPaginatedObservateurs(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getObservateursCount(loggedUser);

    expect(prismaMock.observateur.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.count).toHaveBeenLastCalledWith({
      where: {},
    });
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = mock<LoggedUser>();

    await getObservateursCount(loggedUser, "test");

    expect(prismaMock.observateur.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.count).toHaveBeenLastCalledWith({
      where: {
        libelle: {
          contains: "test",
        },
      },
    });
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(getObservateursCount(null)).rejects.toEqual(new OucaError("OUCA0001"));
  });
});

describe("Update of an observer", () => {
  test("should be allowed when requested by an admin", async () => {
    const observerData = mock<MutationUpsertObservateurArgs>();

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    await upsertObservateur(observerData, loggedUser);

    expect(prismaMock.observateur.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.update).toHaveBeenLastCalledWith({
      data: observerData.data,
      where: {
        id: observerData.id,
      },
    });
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = mock<Observateur>({
      ownerId: "notAdmin",
    });

    const observerData = mock<MutationUpsertObservateurArgs>();

    const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

    prismaMock.observateur.findFirst.mockResolvedValueOnce(existingData);

    await upsertObservateur(observerData, loggedUser);

    expect(prismaMock.observateur.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.update).toHaveBeenLastCalledWith({
      data: observerData.data,
      where: {
        id: observerData.id,
      },
    });
  });

  test("should throw an error when requested by an use that is nor owner nor admin ", async () => {
    const existingData = mock<Observateur>({
      ownerId: "notAdmin",
    });

    const observerData = mock<MutationUpsertObservateurArgs>();

    const user = {
      id: "Bob",
      role: DatabaseRole.contributor,
    };

    prismaMock.observateur.findFirst.mockResolvedValueOnce(existingData);

    await expect(upsertObservateur(observerData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

    expect(prismaMock.observateur.update).not.toHaveBeenCalled();
  });

  test("should throw an error when trying to update to an observer that exists", async () => {
    const observerData = mock<MutationUpsertObservateurArgs>({
      id: 12,
    });

    const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

    prismaMock.observateur.update.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertObservateur(observerData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.observateur.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.update).toHaveBeenLastCalledWith({
      data: observerData.data,
      where: {
        id: observerData.id,
      },
    });
  });
});

describe("Creation of an observer", () => {
  test("should create new observer", async () => {
    const observerData = mock<MutationUpsertObservateurArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    await upsertObservateur(observerData, loggedUser);

    expect(prismaMock.observateur.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.create).toHaveBeenLastCalledWith({
      data: {
        ...observerData.data,
        ownerId: loggedUser.id,
      },
    });
  });

  test("should throw an error when trying to create an observer that already exists", async () => {
    const observerData = mock<MutationUpsertObservateurArgs>({
      id: undefined,
    });

    const loggedUser = mock<LoggedUser>({ id: "a" });

    prismaMock.observateur.create.mockImplementation(prismaConstraintFailed);

    await expect(() => upsertObservateur(observerData, loggedUser)).rejects.toThrowError(
      new OucaError("OUCA0004", prismaConstraintFailedError)
    );

    expect(prismaMock.observateur.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.create).toHaveBeenLastCalledWith({
      data: {
        ...observerData.data,
        ownerId: loggedUser.id,
      },
    });
  });
});

describe("Deletion of an observer", () => {
  test("should handle the deletion of an owned observer", async () => {
    const loggedUser: LoggedUser = {
      id: "12",
      role: DatabaseRole.contributor,
    };

    const observer = mock<Observateur>({
      ownerId: loggedUser.id,
    });

    prismaMock.observateur.findFirst.mockResolvedValueOnce(observer);

    await deleteObservateur(11, loggedUser);

    expect(prismaMock.observateur.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should handle the deletion of any observer if admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.admin,
    });

    prismaMock.observateur.findFirst.mockResolvedValueOnce(mock<Observateur>());

    await deleteObservateur(11, loggedUser);

    expect(prismaMock.observateur.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.observateur.delete).toHaveBeenLastCalledWith({
      where: {
        id: 11,
      },
    });
  });

  test("should return an error when trying to delete a non-owned observer as non-admin", async () => {
    const loggedUser = mock<LoggedUser>({
      role: DatabaseRole.contributor,
    });

    prismaMock.observateur.findFirst.mockResolvedValueOnce(mock<Observateur>());

    await expect(deleteObservateur(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

    expect(prismaMock.observateur.delete).not.toHaveBeenCalled();
  });

  test("should throw an error when the requester is not logged", async () => {
    await expect(deleteObservateur(11, null)).rejects.toEqual(new OucaError("OUCA0001"));
    expect(prismaMock.observateur.delete).not.toHaveBeenCalled();
  });
});

test("Create multiple observers", async () => {
  const observersData = [
    mock<Omit<Prisma.ObservateurCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.ObservateurCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.ObservateurCreateManyInput, "ownerId">>(),
  ];

  const loggedUser = mock<LoggedUser>();

  await createObservateurs(observersData, loggedUser);

  expect(prismaMock.observateur.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.createMany).toHaveBeenLastCalledWith({
    data: observersData.map((observer) => {
      return {
        ...observer,
        ownerId: loggedUser.id,
      };
    }),
  });
});
