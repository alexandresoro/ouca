import { DatabaseRole } from "@prisma/client";

test("should create new observer ", /*async*/ () => {
  const observerData = {
    data: {
      libelle: "Bob"
    }
  };

  const user = {
    id: "a",
    role: DatabaseRole.contributor
  };

  // await upsertObservateur(observerData, user);

  // expect(prismaMock.observateur.create).toHaveBeenCalledTimes(1);
  // expect(prismaMock.observateur.create).toHaveBeenLastCalledWith({
  //   data: {
  //     ...observerData.data,
  //     ownerId: user.id
  //   }
  // });
});
