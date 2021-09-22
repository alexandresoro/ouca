import { AgesPaginatedResult, ClassesPaginatedResult, CommunesPaginatedResult, ComportementsPaginatedResult, DepartementsPaginatedResult, EspecesPaginatedResult, EstimationsDistancePaginatedResult, EstimationsNombrePaginatedResult, LieuxDitsPaginatedResult, MeteosPaginatedResult, MilieuxPaginatedResult, ObservateursPaginatedResult, Resolvers, Settings, SexesPaginatedResult, Version } from "../model/graphql";
import { findPaginatedAges } from "../services/entities/age-service";
import { findPaginatedClasses } from "../services/entities/classe-service";
import { findPaginatedCommunes } from "../services/entities/commune-service";
import { findPaginatedComportements } from "../services/entities/comportement-service";
import { findAppConfiguration, persistUserSettings } from "../services/entities/configuration-service";
import { findPaginatedDepartements } from "../services/entities/departement-service";
import { findPaginatedEspeces } from "../services/entities/espece-service";
import { findPaginatedEstimationsDistance } from "../services/entities/estimation-distance-service";
import { findPaginatedEstimationsNombre } from "../services/entities/estimation-nombre-service";
import { findPaginatedLieuxDits } from "../services/entities/lieu-dit-service";
import { findPaginatedMeteos } from "../services/entities/meteo-service";
import { findPaginatedMilieux } from "../services/entities/milieu-service";
import { findPaginatedObservateurs } from "../services/entities/observateur-service";
import { findPaginatedSexes } from "../services/entities/sexe-service";
import { findVersion } from "../services/entities/version-service";

const resolvers: Resolvers = {
  Query: {
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