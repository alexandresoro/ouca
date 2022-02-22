import { DatabaseRole } from "@prisma/client";
import { prismaMock } from "../../sql/prisma-mock";
import { upsertObservateur } from "./observateur-service";

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
