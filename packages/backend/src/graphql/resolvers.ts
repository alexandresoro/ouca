import { type IResolvers } from "mercurius";
import { type Donnee as DonneeEntity } from "../repositories/donnee/donnee-repository-types.js";
import { type Services } from "../services/services.js";
import {
  type Age,
  type Classe,
  type Commune,
  type CommunesPaginatedResult,
  type Comportement,
  type ComportementsPaginatedResult,
  type Departement,
  type DepartementsPaginatedResult,
  type Espece,
  type EstimationDistance,
  type EstimationNombre,
  type EstimationsDistancePaginatedResult,
  type EstimationsNombrePaginatedResult,
  type Inventaire,
  type LieuDit,
  type LieuxDitsPaginatedResult,
  type Meteo,
  type MeteosPaginatedResult,
  type Milieu,
  type MilieuxPaginatedResult,
  type Observateur,
  type ObservateursPaginatedResult,
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
      communes: async (
        _,
        args,
        { user }
      ): Promise<Omit<CommunesPaginatedResult, "data"> & { data?: Omit<Commune, "departement">[] }> => {
        const [data, count] = await Promise.all([
          communeService.findPaginatedCommunes(user, args),
          communeService.getCommunesCount(user, { q: args.searchParams?.q, departmentId: args.departmentId }),
        ]);
        return {
          data,
          count,
        };
      },
      comportements: async (_, args, { user }): Promise<ComportementsPaginatedResult> => {
        const [data, count] = await Promise.all([
          comportementService.findPaginatedComportements(user, args),
          comportementService.getComportementsCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      departements: async (_, args, { user }): Promise<DepartementsPaginatedResult> => {
        const [data, count] = await Promise.all([
          departementService.findPaginatedDepartements(user, args),
          departementService.getDepartementsCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
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
      estimationsDistance: async (_, args, { user }): Promise<EstimationsDistancePaginatedResult> => {
        const [data, count] = await Promise.all([
          estimationDistanceService.findPaginatedEstimationsDistance(user, args),
          estimationDistanceService.getEstimationsDistanceCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      estimationsNombre: async (_, args, { user }): Promise<EstimationsNombrePaginatedResult> => {
        const [data, count] = await Promise.all([
          estimationNombreService.findPaginatedEstimationsNombre(user, args),
          estimationNombreService.getEstimationsNombreCount(user, args?.searchParams?.q),
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
      meteos: async (_, args, { user }): Promise<MeteosPaginatedResult> => {
        const [data, count] = await Promise.all([
          meteoService.findPaginatedMeteos(user, args),
          meteoService.getMeteosCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      milieux: async (_, args, { user }): Promise<MilieuxPaginatedResult> => {
        const [data, count] = await Promise.all([
          milieuService.findPaginatedMilieux(user, args),
          milieuService.getMilieuxCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      observateurs: async (_, args, { user }): Promise<ObservateursPaginatedResult> => {
        const [data, count] = await Promise.all([
          observateurService.findPaginatedObservateurs(user, args),
          observateurService.getObservateursCount(user, args?.searchParams?.q),
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
      editable: isEntityEditableResolver(communeService.findCommune),
      nbLieuxDits: async (parent, args, { user }): Promise<number | null> => {
        if (!parent?.id) {
          return null;
        }
        return communeService.getLieuxDitsCountByCommune(parent.id, user);
      },
      nbDonnees: entityNbDonneesResolver(communeService.getDonneesCountByCommune),
      departement: async (parent, args, { user }): Promise<Departement | null> => {
        return departementService.findDepartementOfCommuneId(parent?.id, user);
      },
    },
    Comportement: {
      editable: isEntityEditableResolver(comportementService.findComportement),
      nbDonnees: entityNbDonneesResolver(comportementService.getDonneesCountByComportement),
    },
    Departement: {
      editable: isEntityEditableResolver(departementService.findDepartement),
      nbCommunes: async (parent, args, { user }): Promise<number | null> => {
        if (!parent?.id) {
          return null;
        }
        return departementService.getCommunesCountByDepartement(parent.id, user);
      },
      nbLieuxDits: async (parent, args, { user }): Promise<number | null> => {
        if (!parent?.id) {
          return null;
        }
        return departementService.getLieuxDitsCountByDepartement(parent.id, user);
      },
      nbDonnees: entityNbDonneesResolver(departementService.getDonneesCountByDepartement),
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
        return comportementService.findComportementsOfDonneeId(parent?.id, user);
      },
      espece: async (parent, args, { user }): Promise<Omit<Espece, "classe"> | null> => {
        return especeService.findEspeceOfDonneeId(parent?.id, user);
      },
      estimationDistance: async (parent, args, { user }): Promise<EstimationDistance | null> => {
        return estimationDistanceService.findEstimationDistanceOfDonneeId(parent?.id, user);
      },
      estimationNombre: async (parent, args, { user }): Promise<EstimationNombre | null> => {
        return estimationNombreService.findEstimationNombreOfDonneeId(parent?.id, user);
      },
      inventaire: async (
        parent,
        args,
        { user }
      ): Promise<Omit<Inventaire, "observateur" | "associes" | "lieuDit" | "meteos"> | null> => {
        return inventaireService.findInventaireOfDonneeId(parent?.id, user);
      },
      milieux: async (parent, args, { user }): Promise<Milieu[]> => {
        return milieuService.findMilieuxOfDonneeId(parent?.id, user);
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
    EstimationDistance: {
      editable: isEntityEditableResolver(estimationDistanceService.findEstimationDistance),
      nbDonnees: entityNbDonneesResolver(estimationDistanceService.getDonneesCountByEstimationDistance),
    },
    EstimationNombre: {
      editable: isEntityEditableResolver(estimationNombreService.findEstimationNombre),
      nbDonnees: entityNbDonneesResolver(estimationNombreService.getDonneesCountByEstimationNombre),
    },
    Inventaire: {
      observateur: async (parent, args, { user }): Promise<Observateur | null> => {
        return observateurService.findObservateurOfInventaireId(parent?.id, user);
      },
      associes: async (parent, args, { user }): Promise<Observateur[]> => {
        return observateurService.findAssociesOfInventaireId(parent?.id, user);
      },
      lieuDit: async (parent, args, { user }): Promise<Omit<LieuDit, "commune"> | null> => {
        return lieuditService.findLieuDitOfInventaireId(parent?.id, user);
      },
      meteos: async (parent, args, { user }): Promise<Meteo[]> => {
        return meteoService.findMeteosOfInventaireId(parent?.id, user);
      },
    },
    LieuDit: {
      editable: isEntityEditableResolver(lieuditService.findLieuDit),
      commune: async (parent, args, { user }): Promise<Omit<Commune, "departement"> | null> => {
        return communeService.findCommuneOfLieuDitId(parent?.id, user);
      },
      nbDonnees: entityNbDonneesResolver(lieuditService.getDonneesCountByLieuDit),
    },
    Meteo: {
      editable: isEntityEditableResolver(meteoService.findMeteo),
      nbDonnees: entityNbDonneesResolver(meteoService.getDonneesCountByMeteo),
    },
    Milieu: {
      editable: isEntityEditableResolver(milieuService.findMilieu),
      nbDonnees: entityNbDonneesResolver(milieuService.getDonneesCountByMilieu),
    },
    Observateur: {
      editable: isEntityEditableResolver(observateurService.findObservateur),
      nbDonnees: entityNbDonneesResolver(observateurService.getDonneesCountByObservateur),
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
