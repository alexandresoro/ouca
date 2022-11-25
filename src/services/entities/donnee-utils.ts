import { type Prisma } from "@prisma/client";
import { type SearchDonneeCriteria } from "../../graphql/generated/graphql-types";
import { parseISO8601AsUTCDate } from "../../utils/time-utils";

export const buildSearchDonneeCriteria = (
  searchCriteria: SearchDonneeCriteria | null | undefined
): Prisma.DonneeWhereInput | undefined => {
  return searchCriteria && Object.keys(searchCriteria).length
    ? {
        id: searchCriteria?.id ?? undefined,
        inventaire: {
          observateurId: {
            in: searchCriteria?.observateurs ?? undefined,
          },
          ...(searchCriteria?.associes
            ? {
                inventaire_associe: {
                  some: {
                    observateur_id: {
                      in: searchCriteria?.associes,
                    },
                  },
                },
              }
            : {}),
          temperature: searchCriteria?.temperature ?? undefined,
          date: {
            gte: searchCriteria?.fromDate ? parseISO8601AsUTCDate(searchCriteria.fromDate) : undefined,
            lte: searchCriteria?.toDate ? parseISO8601AsUTCDate(searchCriteria.toDate) : undefined,
          },
          heure: searchCriteria?.heure ?? undefined,
          duree: searchCriteria?.duree ?? undefined,
          lieuDitId: {
            in: searchCriteria?.lieuxdits ?? undefined,
          },
          lieuDit: {
            communeId: {
              in: searchCriteria?.communes ?? undefined,
            },
            commune: {
              departementId: {
                in: searchCriteria?.departements ?? undefined,
              },
            },
          },
          ...(searchCriteria?.meteos
            ? {
                inventaire_meteo: {
                  some: {
                    meteo_id: {
                      in: searchCriteria?.meteos,
                    },
                  },
                },
              }
            : {}),
        },
        especeId: {
          in: searchCriteria?.especes ?? undefined,
        },
        espece: {
          classeId: {
            in: searchCriteria?.classes ?? undefined,
          },
        },
        nombre: searchCriteria?.nombre ?? undefined,
        estimationNombreId: {
          in: searchCriteria?.estimationsNombre ?? undefined,
        },
        sexeId: {
          in: searchCriteria?.sexes ?? undefined,
        },
        ageId: {
          in: searchCriteria?.ages ?? undefined,
        },
        distance: searchCriteria?.distance ?? undefined,
        estimationDistanceId: {
          in: searchCriteria?.estimationsDistance ?? undefined,
        },
        regroupement: searchCriteria?.regroupement ?? undefined,
        ...(searchCriteria?.comportements || searchCriteria?.nicheurs
          ? {
              donnee_comportement: {
                some: {
                  ...(searchCriteria?.comportements
                    ? {
                        comportement_id: {
                          in: searchCriteria?.comportements,
                        },
                      }
                    : {}),
                  ...(searchCriteria?.nicheurs
                    ? {
                        comportement: {
                          nicheur: {
                            in: searchCriteria?.nicheurs,
                          },
                        },
                      }
                    : {}),
                },
              },
            }
          : {}),
        ...(searchCriteria?.milieux
          ? {
              donnee_milieu: {
                some: {
                  milieu_id: {
                    in: searchCriteria?.milieux,
                  },
                },
              },
            }
          : {}),
        commentaire: {
          contains: searchCriteria?.commentaire ?? undefined,
        },
      }
    : undefined;
};
