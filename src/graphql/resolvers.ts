import { AgesPaginatedResult, ClassesPaginatedResult, CommunesPaginatedResult, ComportementsPaginatedResult, DepartementsPaginatedResult, EspecesPaginatedResult, EstimationsDistancePaginatedResult, EstimationsNombrePaginatedResult, LieuxDitsPaginatedResult, MeteosPaginatedResult, MilieuxPaginatedResult, ObservateursPaginatedResult, Resolvers, Settings, SexesPaginatedResult, Version } from "../model/graphql";
import { findAges } from "../services/entities/age-service";
import { findClasses } from "../services/entities/classe-service";
import { findCommunes } from "../services/entities/commune-service";
import { findComportements } from "../services/entities/comportement-service";
import { findAppConfiguration, persistUserSettings } from "../services/entities/configuration-service";
import { findDepartements } from "../services/entities/departement-service";
import { findEspeces } from "../services/entities/espece-service";
import { findEstimationsDistance } from "../services/entities/estimation-distance-service";
import { findEstimationsNombre } from "../services/entities/estimation-nombre-service";
import { findLieuxDits } from "../services/entities/lieu-dit-service";
import { findMeteos } from "../services/entities/meteo-service";
import { findMilieux } from "../services/entities/milieu-service";
import { findObservateurs } from "../services/entities/observateur-service";
import { findSexes } from "../services/entities/sexe-service";
import { findVersion } from "../services/entities/version-service";

const resolvers: Resolvers = {
  Query: {
    ages: async (_source, args): Promise<AgesPaginatedResult> => {
      return findAges(args, true);
    },
    classes: async (_source, args): Promise<ClassesPaginatedResult> => {
      return findClasses(args, true);
    },
    communes: async (_source, args): Promise<CommunesPaginatedResult> => {
      return findCommunes(args, true);
    },
    comportements: async (_source, args): Promise<ComportementsPaginatedResult> => {
      return findComportements(args, true);
    },
    departements: async (_source, args): Promise<DepartementsPaginatedResult> => {
      return findDepartements(args, true);
    },
    especes: async (_source, args): Promise<EspecesPaginatedResult> => {
      return findEspeces(args, true);
    },
    estimationsDistance: async (_source, args): Promise<EstimationsDistancePaginatedResult> => {
      return findEstimationsDistance(args, true);
    },
    estimationsNombre: async (_source, args): Promise<EstimationsNombrePaginatedResult> => {
      return findEstimationsNombre(args, true);
    },
    lieuxdits: async (_source, args): Promise<LieuxDitsPaginatedResult> => {
      return findLieuxDits(args, true);
    },
    meteos: async (_source, args): Promise<MeteosPaginatedResult> => {
      return findMeteos(args, true);
    },
    milieux: async (_source, args): Promise<MilieuxPaginatedResult> => {
      return findMilieux(args, true);
    },
    observateurs: async (_source, args): Promise<ObservateursPaginatedResult> => {
      return findObservateurs(args, true);
    },
    sexes: async (_source, args): Promise<SexesPaginatedResult> => {
      return findSexes(args, true);
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