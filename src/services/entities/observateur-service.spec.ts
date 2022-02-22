import { DatabaseRole } from "@prisma/client";
import { prismaMock } from "../../sql/prisma-mock";
import { OucaError } from "../../utils/errors";
import { upsertObservateur } from "./observateur-service";

test("should update an existing observer as an admin ", async () => {
  const observerData = {
    id: 12,
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.admin
  };

  await upsertObservateur(observerData, user);

  expect(prismaMock.observateur.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.update).toHaveBeenLastCalledWith({
    data: observerData.data,
    where: {
      id: observerData.id
    }
  });
});

test("should update an existing observer if owner ", async () => {
  const existingData = {
    id: 12,
    libelle: "Alice",
    ownerId: "notAdmin"
  };

  const observerData = {
    id: 12,
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "notAdmin",
    role: DatabaseRole.contributor
  };

  prismaMock.observateur.findFirst.mockResolvedValueOnce(existingData);

  await upsertObservateur(observerData, user);

  expect(prismaMock.observateur.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.update).toHaveBeenLastCalledWith({
    data: observerData.data,
    where: {
      id: observerData.id
    }
  });
});

test("should throw an error when updating an existing observer and nor owner nor admin ", async () => {
  const existingData = {
    id: 12,
    libelle: "Alice",
    ownerId: "notAdmin"
  };

  const observerData = {
    id: 12,
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor
  };

  prismaMock.observateur.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertObservateur(observerData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.observateur.update).toHaveBeenCalledTimes(0);
});

test("should create new observer ", async () => {
  const observerData = {
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.contributor
  };

  await upsertObservateur(observerData, user);

  expect(prismaMock.observateur.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.observateur.create).toHaveBeenLastCalledWith({
    data: {
      ...observerData.data,
      ownerId: user.id
    }
  });
});
