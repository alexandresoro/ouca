import { mock } from "jest-mock-extended";
import { SearchDonneeCriteria } from "../../graphql/generated/graphql-types";
import * as timeUtils from "../../utils/time-utils";
import { buildSearchDonneeCriteria } from "./donnee-utils";

const parseISO8601AsUTCDate = jest.spyOn(timeUtils, "parseISO8601AsUTCDate");

test("should build correct structure when input is null", () => {
  const searchCriteria: SearchDonneeCriteria | null = null;

  const result = buildSearchDonneeCriteria(searchCriteria);

  expect(result).toBeUndefined();
});

test("should build correct structure when input is empty", () => {
  const searchCriteria: SearchDonneeCriteria = {};

  const result = buildSearchDonneeCriteria(searchCriteria);

  expect(result).toBeUndefined();
});

test("should build correct structure when input is partially filled", () => {
  const searchCriteria: SearchDonneeCriteria = {
    id: 3,
  };

  const result = buildSearchDonneeCriteria(searchCriteria);

  expect(result).toEqual({
    ageId: {
      in: undefined,
    },
    commentaire: {
      contains: undefined,
    },
    distance: undefined,
    espece: {
      classeId: {
        in: undefined,
      },
    },
    especeId: {
      in: undefined,
    },
    estimationDistanceId: {
      in: undefined,
    },
    estimationNombreId: {
      in: undefined,
    },
    id: searchCriteria?.id,
    inventaire: {
      date: {
        gte: undefined,
        lte: undefined,
      },
      duree: undefined,
      heure: undefined,
      lieuDit: {
        commune: {
          departementId: {
            in: undefined,
          },
        },
        communeId: {
          in: undefined,
        },
      },
      lieuDitId: {
        in: undefined,
      },
      observateurId: {
        in: undefined,
      },
      temperature: undefined,
    },
    nombre: undefined,
    regroupement: undefined,
    sexeId: {
      in: undefined,
    },
  });
});

test("should build correct structure when input is complete", () => {
  const searchCriteria = mock<SearchDonneeCriteria>();
  const fromDate = mock<Date>();
  const toDate = mock<Date>();

  parseISO8601AsUTCDate.mockReturnValueOnce(fromDate).mockReturnValueOnce(toDate);

  const result = buildSearchDonneeCriteria(searchCriteria);

  expect(result).toEqual({
    ageId: {
      in: searchCriteria.ages,
    },
    commentaire: {
      contains: searchCriteria.commentaire,
    },
    distance: searchCriteria.distance,
    donnee_comportement: {
      some: {
        comportement: {
          nicheur: {
            in: searchCriteria.nicheurs,
          },
        },
        comportement_id: {
          in: searchCriteria.comportements,
        },
      },
    },
    donnee_milieu: {
      some: {
        milieu_id: {
          in: searchCriteria.milieux,
        },
      },
    },
    espece: {
      classeId: {
        in: searchCriteria.classes,
      },
    },
    especeId: {
      in: searchCriteria.especes,
    },
    estimationDistanceId: {
      in: searchCriteria.estimationsDistance,
    },
    estimationNombreId: {
      in: searchCriteria.estimationsNombre,
    },
    id: searchCriteria?.id,
    inventaire: {
      date: {
        gte: fromDate,
        lte: toDate,
      },
      duree: searchCriteria.duree,
      heure: searchCriteria.heure,
      inventaire_associe: {
        some: {
          observateur_id: {
            in: searchCriteria.associes,
          },
        },
      },
      inventaire_meteo: {
        some: {
          meteo_id: {
            in: searchCriteria.meteos,
          },
        },
      },
      lieuDit: {
        commune: {
          departementId: {
            in: searchCriteria.departements,
          },
        },
        communeId: {
          in: searchCriteria.communes,
        },
      },
      lieuDitId: {
        in: searchCriteria.lieuxdits,
      },
      observateurId: {
        in: searchCriteria.observateurs,
      },
      temperature: searchCriteria.temperature,
    },
    nombre: searchCriteria.nombre,
    regroupement: searchCriteria.regroupement,
    sexeId: {
      in: searchCriteria.sexes,
    },
  });
});
