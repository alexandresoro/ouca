import { DatabaseRole, Donnee, Espece, Prisma } from "@prisma/client";
import { mock, mockDeep } from "jest-mock-extended";
import { SearchDonneeCriteria } from "../../graphql/generated/graphql-types";
import { MutationUpsertEspeceArgs, QueryPaginatedEspecesArgs } from "../../model/graphql";
import { prismaMock } from "../../sql/prisma-mock";
import { LoggedUser } from "../../types/LoggedUser";
import { COLUMN_CODE } from "../../utils/constants";
import { OucaError } from "../../utils/errors";
import * as entitiesUtils from "./entities-utils";
import {
  createEspeces,
  deleteEspece,
  findEspece,
  findEspeceOfDonneeId,
  findEspeces,
  findPaginatedEspeces,
  upsertEspece
} from "./espece-service";

const isEntityReadOnly = jest.spyOn(entitiesUtils, "isEntityReadOnly");

const prismaConstraintFailedError = {
  code: "P2002",
  message: "Prisma error message"
};

const prismaConstraintFailed = () => {
  throw new Prisma.PrismaClientKnownRequestError(
    prismaConstraintFailedError.message,
    prismaConstraintFailedError.code,
    ""
  );
};

test("should call readonly status when retrieving one species ", async () => {
  const speciesData = mock<Espece>();

  prismaMock.espece.findUnique.mockResolvedValueOnce(speciesData);

  await findEspece(speciesData.id);

  expect(prismaMock.espece.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: speciesData.id
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle species not found ", async () => {
  prismaMock.espece.findUnique.mockResolvedValueOnce(null);

  await expect(findEspece(10)).resolves.toBe(null);

  expect(prismaMock.espece.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 10
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
});

test("should call readonly status when retrieving species by data ID ", async () => {
  const speciesData = mock<Espece>({
    id: 256
  });

  const data = mockDeep<Prisma.Prisma__DonneeClient<Donnee>>();
  data.espece.mockResolvedValueOnce(speciesData);

  prismaMock.donnee.findUnique.mockReturnValueOnce(data);

  const species = await findEspeceOfDonneeId(43);

  expect(prismaMock.donnee.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.donnee.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
  expect(species?.id).toEqual(256);
});

test("should handle species not found when retrieving species by data ID ", async () => {
  const data = mockDeep<Prisma.Prisma__DonneeClient<Donnee>>();
  data.espece.mockResolvedValueOnce(null);

  prismaMock.donnee.findUnique.mockReturnValueOnce(data);

  const species = await findEspeceOfDonneeId(43);

  expect(prismaMock.donnee.findUnique).toHaveBeenCalledTimes(1);
  expect(prismaMock.donnee.findUnique).toHaveBeenLastCalledWith({
    where: {
      id: 43
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(0);
  expect(species).toBeNull();
});

test("should call readonly status when retrieving species by params ", async () => {
  const commonResultEspece = mock<Espece>();
  const codeSpeciesData = [mock<Espece>(), mock<Espece>(), commonResultEspece];
  const libelleSpeciesData = [mock<Espece>(), commonResultEspece];

  prismaMock.espece.findMany.mockResolvedValueOnce(codeSpeciesData);
  prismaMock.espece.findMany.mockResolvedValueOnce(libelleSpeciesData);

  await findEspeces();

  expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(2);
  expect(prismaMock.espece.findMany).toHaveBeenNthCalledWith(1, {
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      AND: [
        {
          code: {
            startsWith: undefined
          }
        },
        {}
      ]
    },
    take: undefined
  });
  expect(prismaMock.espece.findMany).toHaveBeenNthCalledWith(2, {
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_CODE),
    where: {
      AND: [{}, {}]
    },
    take: undefined
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(codeSpeciesData.length + libelleSpeciesData.length - 1);
});

test("should call readonly status when retrieving paginated species", async () => {
  const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];

  prismaMock.espece.findMany.mockResolvedValueOnce(speciesData);

  await findPaginatedEspeces();

  expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_CODE),
    include: {
      classe: {
        select: {
          id: true,
          libelle: true
        }
      }
    },
    orderBy: undefined,
    where: { AND: [{}, {}] }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(speciesData.length);
});

test("should handle params when retrieving paginated species ", async () => {
  const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];

  const searchParams: QueryPaginatedEspecesArgs = {
    orderBy: "code",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10
    },
    includeCounts: false
  };

  prismaMock.espece.findMany.mockResolvedValueOnce([speciesData[0]]);

  await findPaginatedEspeces(searchParams);

  expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_CODE),
    include: {
      classe: {
        select: {
          id: true,
          libelle: true
        }
      }
    },
    orderBy: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [searchParams.orderBy!]: searchParams.sortOrder
    },
    skip: searchParams.searchParams?.pageNumber,
    take: searchParams.searchParams?.pageSize,
    where: {
      AND: [
        {
          OR: [
            {
              code: {
                contains: searchParams.searchParams?.q
              }
            },
            {
              nomFrancais: {
                contains: searchParams.searchParams?.q
              }
            },
            {
              nomLatin: {
                contains: searchParams.searchParams?.q
              }
            }
          ]
        },
        {}
      ]
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should handle params and search criteria when retrieving paginated species ", async () => {
  const speciesData = [mock<Espece>(), mock<Espece>(), mock<Espece>()];

  const searchParams: QueryPaginatedEspecesArgs = {
    orderBy: "code",
    sortOrder: "desc",
    searchParams: {
      q: "Bob",
      pageNumber: 0,
      pageSize: 10
    },
    includeCounts: false
  };

  const searchCriteria: SearchDonneeCriteria = {
    id: 3,
    ages: [5, 7],
    associes: [4, 6],
    classes: [2],
    commentaire: "Bob",
    communes: [1, 2, 3],
    comportements: [7, 9],
    departements: [6],
    distance: 4000,
    duree: "00:12",
    especes: [23, 8],
    estimationsDistance: [5],
    estimationsNombre: [9],
    fromDate: "2022-04-02",
    heure: "15:45",
    lieuxdits: [3, 11, 67],
    meteos: [6, 1],
    milieux: [8, 22],
    nicheurs: ["possible", "probable"],
    nombre: 570,
    observateurs: [3, 11],
    regroupement: 5,
    sexes: [3],
    temperature: 37,
    toDate: "2022-04-09"
  };

  prismaMock.espece.findMany.mockResolvedValueOnce([speciesData[0]]);

  await findPaginatedEspeces(searchParams, searchCriteria);

  expect(prismaMock.espece.findMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.findMany).toHaveBeenLastCalledWith({
    ...entitiesUtils.queryParametersToFindAllEntities(COLUMN_CODE),
    include: {
      classe: {
        select: {
          id: true,
          libelle: true
        }
      }
    },
    orderBy: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [searchParams.orderBy!]: searchParams.sortOrder
    },
    skip: searchParams.searchParams?.pageNumber,
    take: searchParams.searchParams?.pageSize,
    where: {
      AND: [
        {
          OR: [
            {
              code: {
                contains: searchParams.searchParams?.q
              }
            },
            {
              nomFrancais: {
                contains: searchParams.searchParams?.q
              }
            },
            {
              nomLatin: {
                contains: searchParams.searchParams?.q
              }
            }
          ]
        },
        {
          classeId: {
            in: searchCriteria.classes
          },
          donnee: {
            some: {
              ageId: {
                in: searchCriteria.ages
              },
              commentaire: {
                contains: searchCriteria.commentaire
              },
              distance: searchCriteria.distance,
              donnee_comportement: {
                some: {
                  comportement: {
                    nicheur: {
                      in: searchCriteria.nicheurs
                    }
                  },
                  comportement_id: {
                    in: searchCriteria.comportements
                  }
                }
              },
              donnee_milieu: {
                some: {
                  milieu_id: {
                    in: searchCriteria.milieux
                  }
                }
              },
              estimationDistanceId: {
                in: searchCriteria.estimationsDistance
              },
              estimationNombreId: {
                in: searchCriteria.estimationsNombre
              },
              id: searchCriteria?.id,
              inventaire: {
                date: {
                  gte: new Date(Date.UTC(2022, 3, 2)),
                  lte: new Date(Date.UTC(2022, 3, 9))
                },
                duree: searchCriteria.duree,
                heure: searchCriteria.heure,
                inventaire_associe: {
                  some: {
                    observateur_id: {
                      in: searchCriteria.associes
                    }
                  }
                },
                inventaire_meteo: {
                  some: {
                    meteo_id: {
                      in: searchCriteria.meteos
                    }
                  }
                },
                lieuDit: {
                  commune: {
                    departementId: {
                      in: searchCriteria.departements
                    }
                  },
                  communeId: {
                    in: searchCriteria.communes
                  }
                },
                lieuDitId: {
                  in: searchCriteria.lieuxdits
                },
                observateurId: {
                  in: searchCriteria.observateurs
                },
                temperature: searchCriteria.temperature
              },
              nombre: searchCriteria.nombre,
              regroupement: searchCriteria.regroupement,
              sexeId: {
                in: searchCriteria.sexes
              }
            }
          },
          id: {
            in: searchCriteria.especes
          }
        }
      ]
    }
  });
  expect(isEntityReadOnly).toHaveBeenCalledTimes(1);
});

test("should update an existing species as an admin ", async () => {
  const speciesData = mock<MutationUpsertEspeceArgs>();

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  await upsertEspece(speciesData, loggedUser);

  expect(prismaMock.espece.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.update).toHaveBeenLastCalledWith({
    data: speciesData.data,
    where: {
      id: speciesData.id
    }
  });
});

test("should update an existing species if owner ", async () => {
  const existingData = mock<Espece>({
    ownerId: "notAdmin"
  });

  const speciesData = mock<MutationUpsertEspeceArgs>();

  const loggedUser = mock<LoggedUser>({ id: "notAdmin" });

  prismaMock.espece.findFirst.mockResolvedValueOnce(existingData);

  await upsertEspece(speciesData, loggedUser);

  expect(prismaMock.espece.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.update).toHaveBeenLastCalledWith({
    data: speciesData.data,
    where: {
      id: speciesData.id
    }
  });
});

test("should throw an error when updating an existing species and nor owner nor admin ", async () => {
  const existingData = mock<Espece>({
    ownerId: "notAdmin"
  });

  const speciesData = mock<MutationUpsertEspeceArgs>();

  const user = {
    id: "Bob",
    role: DatabaseRole.contributor
  };

  prismaMock.espece.findFirst.mockResolvedValueOnce(existingData);

  await expect(upsertEspece(speciesData, user)).rejects.toThrowError(new OucaError("OUCA0001"));

  expect(prismaMock.espece.update).toHaveBeenCalledTimes(0);
});

test("should throw an error when trying to update a species that exists", async () => {
  const speciesData = mock<MutationUpsertEspeceArgs>({
    id: 12
  });

  const loggedUser = mock<LoggedUser>({ role: DatabaseRole.admin });

  prismaMock.espece.update.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertEspece(speciesData, loggedUser)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.espece.update).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.update).toHaveBeenLastCalledWith({
    data: speciesData.data,
    where: {
      id: speciesData.id
    }
  });
});

test("should create new species ", async () => {
  const speciesData = mock<MutationUpsertEspeceArgs>({
    id: undefined
  });

  const loggedUser = mock<LoggedUser>({ id: "a" });

  await upsertEspece(speciesData, loggedUser);

  expect(prismaMock.espece.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.create).toHaveBeenLastCalledWith({
    data: {
      ...speciesData.data,
      ownerId: loggedUser.id
    }
  });
});

test("should throw an error when trying to create a species that exists", async () => {
  const speciesData = mock<MutationUpsertEspeceArgs>({
    id: undefined
  });

  const loggedUser = mock<LoggedUser>({ id: "a" });

  prismaMock.espece.create.mockImplementation(prismaConstraintFailed);

  await expect(() => upsertEspece(speciesData, loggedUser)).rejects.toThrowError(
    new OucaError("OUCA0004", prismaConstraintFailedError)
  );

  expect(prismaMock.espece.create).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.create).toHaveBeenLastCalledWith({
    data: {
      ...speciesData.data,
      ownerId: loggedUser.id
    }
  });
});

test("should be able to delete an owned species", async () => {
  const loggedUser: LoggedUser = {
    id: "12",
    role: DatabaseRole.contributor
  };

  const species = mock<Espece>({
    ownerId: loggedUser.id
  });

  prismaMock.espece.findFirst.mockResolvedValueOnce(species);

  await deleteEspece(11, loggedUser);

  expect(prismaMock.espece.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should be able to delete any species if admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.admin
  });

  prismaMock.espece.findFirst.mockResolvedValueOnce(mock<Espece>());

  await deleteEspece(11, loggedUser);

  expect(prismaMock.espece.delete).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.delete).toHaveBeenLastCalledWith({
    where: {
      id: 11
    }
  });
});

test("should return an error when deleting a non-owned species as non-admin", async () => {
  const loggedUser = mock<LoggedUser>({
    role: DatabaseRole.contributor
  });

  prismaMock.espece.findFirst.mockResolvedValueOnce(mock<Espece>());

  await expect(deleteEspece(11, loggedUser)).rejects.toEqual(new OucaError("OUCA0001"));

  expect(prismaMock.espece.delete).toHaveBeenCalledTimes(0);
});

test("should create new species", async () => {
  const speciesData = [
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>(),
    mock<Omit<Prisma.EspeceCreateManyInput, "ownerId">>()
  ];

  const loggedUser = mock<LoggedUser>();

  await createEspeces(speciesData, loggedUser);

  expect(prismaMock.espece.createMany).toHaveBeenCalledTimes(1);
  expect(prismaMock.espece.createMany).toHaveBeenLastCalledWith({
    data: speciesData.map((species) => {
      return {
        ...species,
        ownerId: loggedUser.id
      };
    })
  });
});
