import { Age, AgesPaginatedResult, Classe, ClassesPaginatedResult, Commune, CommunesPaginatedResult, Comportement, ComportementsPaginatedResult, Departement, DepartementsPaginatedResult, Espece, EspecesPaginatedResult, EstimationDistance, EstimationNombre, EstimationsDistancePaginatedResult, EstimationsNombrePaginatedResult, LieuDit, LieuxDitsPaginatedResult, Meteo, MeteosPaginatedResult, Milieu, MilieuxPaginatedResult, Observateur, ObservateursPaginatedResult, Resolvers, Settings, Sexe, SexesPaginatedResult, Version } from "../model/graphql";
import { findAges, findPaginatedAges } from "../services/entities/age-service";
import { findClasses, findPaginatedClasses } from "../services/entities/classe-service";
import { findCommunes, findPaginatedCommunes } from "../services/entities/commune-service";
import { findComportements, findPaginatedComportements } from "../services/entities/comportement-service";
import { findAppConfiguration, persistUserSettings } from "../services/entities/configuration-service";
import { findDepartements, findPaginatedDepartements } from "../services/entities/departement-service";
import { findLastDonneeId } from "../services/entities/donnee-service";
import { findEspeces, findPaginatedEspeces } from "../services/entities/espece-service";
import { findEstimationDistance, findEstimationsDistance, findPaginatedEstimationsDistance } from "../services/entities/estimation-distance-service";
import { findEstimationNombre, findEstimationsNombre, findPaginatedEstimationsNombre } from "../services/entities/estimation-nombre-service";
import { findLieuxDits, findPaginatedLieuxDits } from "../services/entities/lieu-dit-service";
import { findMeteo, findMeteos, findMeteosByIds, findPaginatedMeteos } from "../services/entities/meteo-service";
import { findMilieux, findPaginatedMilieux } from "../services/entities/milieu-service";
import { findObservateur, findObservateurs, findObservateursByIds, findPaginatedObservateurs } from "../services/entities/observateur-service";
import { findPaginatedSexes, findSexes } from "../services/entities/sexe-service";
import { findVersion } from "../services/entities/version-service";

const resolvers: Resolvers = {
  Query: {
    estimationDistance: async (_source, args): Promise<EstimationDistance> => {
      return findEstimationDistance(args.id);
    },
    estimationNombre: async (_source, args): Promise<EstimationNombre> => {
      return findEstimationNombre(args.id);
    },
    meteo: async (_source, args): Promise<Meteo> => {
      return findMeteo(args.id);
    },
    meteoList: async (_source, args): Promise<Meteo[]> => {
      return findMeteosByIds(args.ids);
    },
    observateur: async (_source, args): Promise<Observateur> => {
      return findObservateur(args.id);
    },
    observateurList: async (_source, args): Promise<Observateur[]> => {
      return findObservateursByIds(args.ids);
    },
    ages: async (): Promise<Age[]> => {
      return findAges();
    },
    classes: async (): Promise<Classe[]> => {
      return findClasses();
    },
    communes: async (): Promise<Commune[]> => {
      return findCommunes();
    },
    comportements: async (): Promise<Comportement[]> => {
      return findComportements();
    },
    departements: async (): Promise<Departement[]> => {
      return findDepartements();
    },
    especes: async (): Promise<Espece[]> => {
      return findEspeces();
    },
    estimationsDistance: async (_source, args): Promise<EstimationDistance[]> => {
      return findEstimationsDistance(args?.params);
    },
    estimationsNombre: async (_source, args): Promise<EstimationNombre[]> => {
      return findEstimationsNombre(args?.params);
    },
    lieuxDits: async (): Promise<LieuDit[]> => {
      return findLieuxDits();
    },
    meteos: async (): Promise<Meteo[]> => {
      return findMeteos();
    },
    milieux: async (): Promise<Milieu[]> => {
      return findMilieux();
    },
    observateurs: async (_source, args): Promise<Observateur[]> => {
      return findObservateurs(args?.params);
    },
    sexes: async (): Promise<Sexe[]> => {
      return findSexes();
    },
    lastDonneeId: async (): Promise<number> => {
      return findLastDonneeId();
    },
    paginatedAges: async (_source, args): Promise<AgesPaginatedResult> => {
      return findPaginatedAges(args, true);
    },
    paginatedClasses: async (_source, args): Promise<ClassesPaginatedResult> => {
      return findPaginatedClasses(args, true);
    },
    paginatedCommunes: async (_source, args): Promise<CommunesPaginatedResult> => {
      return findPaginatedCommunes(args, true);
    },
    paginatedComportements: async (_source, args): Promise<ComportementsPaginatedResult> => {
      return findPaginatedComportements(args, true);
    },
    paginatedDepartements: async (_source, args): Promise<DepartementsPaginatedResult> => {
      return findPaginatedDepartements(args, true);
    },
    paginatedEspeces: async (_source, args): Promise<EspecesPaginatedResult> => {
      return findPaginatedEspeces(args, true);
    },
    paginatedEstimationsDistance: async (_source, args): Promise<EstimationsDistancePaginatedResult> => {
      return findPaginatedEstimationsDistance(args, true);
    },
    paginatedEstimationsNombre: async (_source, args): Promise<EstimationsNombrePaginatedResult> => {
      return findPaginatedEstimationsNombre(args, true);
    },
    paginatedLieuxdits: async (_source, args): Promise<LieuxDitsPaginatedResult> => {
      return findPaginatedLieuxDits(args, true);
    },
    paginatedMeteos: async (_source, args): Promise<MeteosPaginatedResult> => {
      return findPaginatedMeteos(args, true);
    },
    paginatedMilieux: async (_source, args): Promise<MilieuxPaginatedResult> => {
      return findPaginatedMilieux(args, true);
    },
    paginatedObservateurs: async (_source, args): Promise<ObservateursPaginatedResult> => {
      return findPaginatedObservateurs(args, true);
    },
    paginatedSexes: async (_source, args): Promise<SexesPaginatedResult> => {
      return findPaginatedSexes(args, true);
    },
    settings: async (): Promise<Settings> => {
      return findAppConfiguration();
    },
    version: async (): Promise<Version> => {
      return findVersion();
    }
  },
  Mutation: {
    updateSettings: async (_source, { appConfiguration }): Promise<Settings> => {
      return persistUserSettings(appConfiguration);
    }
  }
};

export default resolvers;