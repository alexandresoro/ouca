import { type IResolvers } from "mercurius";
import { type Donnee as DonneeEntity } from "../repositories/donnee/donnee-repository-types.js";
import { type Services } from "../services/services.js";
import {
  type Age,
  type Classe,
  type Commune,
  type Comportement,
  type Departement,
  type Espece,
  type EstimationDistance,
  type EstimationNombre,
  type Inventaire,
  type LieuDit,
  type LieuxDitsPaginatedResult,
  type Meteo,
  type Milieu,
  type Observateur,
  type Sexe,
} from "./generated/graphql-types.js";
import { entityNbDonneesResolver, isEntityEditableResolver } from "./resolvers-helper.js";

export const buildResolvers = ({
  ageService,
  classeService,
  communeService,
  comportementService,
  departementService,
  donneeService,
  especeService,
  estimationDistanceService,
  estimationNombreService,
  inventaireService,
  lieuditService,
  meteoService,
  milieuService,
  observateurService,
  sexeService,
}: Services): IResolvers => {
  return {
    Query: {
      especes: async (_, args, { user }): Promise<{ data: Omit<Espece, "classe">[]; count: number }> => {
        const [data, count] = await Promise.all([
          especeService.findPaginatedEspeces(user, args),
          especeService.getEspecesCount(user, { q: args?.searchParams?.q, searchCriteria: args?.searchCriteria }),
        ]);
        return {
          data,
          count,
        };
      },
      lieuxDits: async (
        _,
        args,
        { user }
      ): Promise<Omit<LieuxDitsPaginatedResult, "data"> & { data?: Omit<LieuDit, "commune">[] }> => {
        const [data, count] = await Promise.all([
          lieuditService.findPaginatedLieuxDits(user, args),
          lieuditService.getLieuxDitsCount(user, { q: args.searchParams?.q, townId: args.townId }),
        ]);
        return {
          data,
          count,
        };
      },
      searchDonnees: (): Record<string, never> => {
        return {};
      },
    },
    Commune: {
      departement: async (parent, args, { user }): Promise<Departement | null> => {
        const department = await departementService.findDepartementOfCommuneId(
          parent?.id ? `${parent.id}` : undefined,
          user
        );
        if (!department) {
          return null;
        }
        return {
          ...department,
          id: parseInt(department.id),
        };
      },
    },
    Donnee: {
      age: async (parent, args, { user }): Promise<Age | null> => {
        const age = await ageService.findAgeOfDonneeId(parent?.id, user);
        if (!age) {
          return null;
        }
        return {
          ...age,
          id: parseInt(age.id),
        };
      },
      comportements: async (parent, args, { user }): Promise<Comportement[]> => {
        const behaviors = await comportementService.findComportementsOfDonneeId(parent?.id, user);
        return behaviors.map((behavior) => {
          return {
            ...behavior,
            id: parseInt(behavior.id),
          };
        });
      },
      espece: async (parent, args, { user }): Promise<Omit<Espece, "classe"> | null> => {
        return especeService.findEspeceOfDonneeId(parent?.id, user);
      },
      estimationDistance: async (parent, args, { user }): Promise<EstimationDistance | null> => {
        const distanceEstimate = await estimationDistanceService.findEstimationDistanceOfDonneeId(parent?.id, user);
        if (!distanceEstimate) {
          return null;
        }
        return {
          ...distanceEstimate,
          id: parseInt(distanceEstimate.id),
        };
      },
      estimationNombre: async (parent, args, { user }): Promise<EstimationNombre | null> => {
        const numberEstimate = await estimationNombreService.findEstimationNombreOfDonneeId(parent?.id, user);
        if (!numberEstimate) {
          return null;
        }
        return {
          ...numberEstimate,
          id: parseInt(numberEstimate.id),
        };
      },
      inventaire: async (
        parent,
        args,
        { user }
      ): Promise<Omit<Inventaire, "observateur" | "associes" | "lieuDit" | "meteos"> | null> => {
        return inventaireService.findInventaireOfDonneeId(parent?.id, user);
      },
      milieux: async (parent, args, { user }): Promise<Milieu[]> => {
        const environments = await milieuService.findMilieuxOfDonneeId(parent?.id, user);
        return environments.map((environment) => {
          return {
            ...environment,
            id: parseInt(environment.id),
          };
        });
      },
      sexe: async (parent, args, { user }): Promise<Sexe | null> => {
        const sex = await sexeService.findSexeOfDonneeId(parent?.id, user);
        if (!sex) {
          return null;
        }
        return {
          ...sex,
          id: parseInt(sex.id),
        };
      },
    },
    Espece: {
      editable: isEntityEditableResolver(especeService.findEspece),
      classe: async (parent, args, { user }): Promise<Classe | null> => {
        const speciesClass = await classeService.findClasseOfEspeceId(parent?.id, user);
        if (!speciesClass) {
          return null;
        }
        return {
          ...speciesClass,
          id: parseInt(speciesClass.id),
        };
      },
      nbDonnees: entityNbDonneesResolver(especeService.getDonneesCountByEspece),
    },
    Inventaire: {
      observateur: async (parent, args, { user }): Promise<Observateur | null> => {
        const observer = await observateurService.findObservateurOfInventaireId(parent?.id, user);
        if (!observer) {
          return null;
        }
        return {
          ...observer,
          id: parseInt(observer.id),
        };
      },
      associes: async (parent, args, { user }): Promise<Observateur[]> => {
        const associates = await observateurService.findAssociesOfInventaireId(parent?.id, user);
        return associates.map((associate) => {
          return {
            ...associate,
            id: parseInt(associate.id),
          };
        });
      },
      lieuDit: async (parent, args, { user }): Promise<Omit<LieuDit, "commune"> | null> => {
        return lieuditService.findLieuDitOfInventaireId(parent?.id, user);
      },
      meteos: async (parent, args, { user }): Promise<Meteo[]> => {
        const weathers = await meteoService.findMeteosOfInventaireId(parent?.id, user);
        return weathers.map((weather) => {
          return {
            ...weather,
            id: parseInt(weather.id),
          };
        });
      },
    },
    LieuDit: {
      editable: isEntityEditableResolver(lieuditService.findLieuDit),
      commune: async (parent, args, { user }): Promise<Omit<Commune, "departement"> | null> => {
        const town = await communeService.findCommuneOfLieuDitId(parent?.id, user);
        if (!town) {
          return null;
        }
        return {
          ...town,
          id: parseInt(town.id),
        };
      },
      nbDonnees: entityNbDonneesResolver(lieuditService.getDonneesCountByLieuDit),
    },
    PaginatedSearchDonneesResult: {
      result: async (_, args, { user }): Promise<DonneeEntity[]> => {
        return donneeService.findPaginatedDonnees(user, args);
      },
      count: async (_, { searchCriteria }, { user }): Promise<number> => {
        return donneeService.getDonneesCount(user, searchCriteria);
      },
    },
  };
};
