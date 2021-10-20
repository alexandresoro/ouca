import { Commune as CommuneEntity, Espece as EspeceEntity } from "@prisma/client";
import { Age, AgesPaginatedResult, Classe, ClassesPaginatedResult, Commune, CommunesPaginatedResult, Comportement, ComportementsPaginatedResult, Departement, DepartementsPaginatedResult, Donnee, DonneeNavigationData, Espece, EspecesPaginatedResult, EstimationDistance, EstimationNombre, EstimationsDistancePaginatedResult, EstimationsNombrePaginatedResult, Inventaire, LieuDit, LieuxDitsPaginatedResult, Meteo, MeteosPaginatedResult, Milieu, MilieuxPaginatedResult, Observateur, ObservateursPaginatedResult, Resolvers, Settings, Sexe, SexesPaginatedResult, Version } from "../model/graphql";
import { findAge, findAges, findPaginatedAges, upsertAge } from "../services/entities/age-service";
import { findClasse, findClasseOfEspeceId, findClasses, findPaginatedClasses, upsertClasse } from "../services/entities/classe-service";
import { findCommune, findCommuneOfLieuDitId, findCommunes, findPaginatedCommunes, upsertCommune } from "../services/entities/commune-service";
import { findComportement, findComportements, findComportementsByIds, findPaginatedComportements, upsertComportement } from "../services/entities/comportement-service";
import { findAppConfiguration, persistUserSettings } from "../services/entities/configuration-service";
import { findDepartement, findDepartementOfCommuneId, findDepartements, findPaginatedDepartements, upsertDepartement } from "../services/entities/departement-service";
import { findDonnee, findDonneeNavigationData, findLastDonneeId, findNextRegroupement } from "../services/entities/donnee-service";
import { findEspece, findEspeceOfDonneeId, findEspeces, findPaginatedEspeces, upsertEspece } from "../services/entities/espece-service";
import { findEstimationDistance, findEstimationsDistance, findPaginatedEstimationsDistance, upsertEstimationDistance } from "../services/entities/estimation-distance-service";
import { findEstimationNombre, findEstimationsNombre, findPaginatedEstimationsNombre, upsertEstimationNombre } from "../services/entities/estimation-nombre-service";
import { findInventaire, findInventaireOfDonneeId } from "../services/entities/inventaire-service";
import { findLieuDit, findLieuDitOfInventaireId, findLieuxDits, findPaginatedLieuxDits, LieuDitWithCoordinatesAsNumber, upsertLieuDit } from "../services/entities/lieu-dit-service";
import { findMeteo, findMeteos, findMeteosByIds, findPaginatedMeteos, upsertMeteo } from "../services/entities/meteo-service";
import { findMilieu, findMilieux, findMilieuxByIds, findPaginatedMilieux, upsertMilieu } from "../services/entities/milieu-service";
import { findObservateur, findObservateurs, findObservateursByIds, findPaginatedObservateurs, upsertObservateur } from "../services/entities/observateur-service";
import { findPaginatedSexes, findSexe, findSexes, upsertSexe } from "../services/entities/sexe-service";
import { findVersion } from "../services/entities/version-service";

const resolvers: Resolvers = {
  Query: {
    age: async (_source, args): Promise<Age> => {
      return findAge(args.id);
    },
    classe: async (_source, args): Promise<Classe> => {
      return findClasse(args.id);
    },
    commune: async (_source, args): Promise<Omit<Commune, 'departement'>> => {
      return findCommune(args.id);
    },
    comportement: async (_source, args): Promise<Comportement> => {
      return findComportement(args.id);
    },
    comportementList: async (_source, args): Promise<Comportement[]> => {
      return findComportementsByIds(args.ids);
    },
    departement: async (_source, args): Promise<Departement> => {
      return findDepartement(args.id);
    },
    donnee: (_source, args): { id: number } => {
      return {
        id: args.id,
      };
    },
    espece: async (_source, args): Promise<Omit<Espece, 'classe'>> => {
      return findEspece(args.id);
    },
    estimationDistance: async (_source, args): Promise<EstimationDistance> => {
      return findEstimationDistance(args.id);
    },
    estimationNombre: async (_source, args): Promise<EstimationNombre> => {
      return findEstimationNombre(args.id);
    },
    inventaire: async (_source, args): Promise<Omit<Inventaire, 'lieuDit'>> => {
      return findInventaire(args.id);
    },
    lieuDit: async (_source, args): Promise<Omit<LieuDit, 'commune'>> => {
      return findLieuDit(args.id);
    },
    meteo: async (_source, args): Promise<Meteo> => {
      return findMeteo(args.id);
    },
    meteoList: async (_source, args): Promise<Meteo[]> => {
      return findMeteosByIds(args.ids);
    },
    milieu: async (_source, args): Promise<Milieu> => {
      return findMilieu(args.id);
    },
    milieuList: async (_source, args): Promise<Milieu[]> => {
      return findMilieuxByIds(args.ids);
    },
    observateur: async (_source, args): Promise<Observateur> => {
      return findObservateur(args.id);
    },
    observateurList: async (_source, args): Promise<Observateur[]> => {
      return findObservateursByIds(args.ids);
    },
    sexe: async (_source, args): Promise<Sexe> => {
      return findSexe(args.id);
    },
    ages: async (_source, args): Promise<Age[]> => {
      return findAges(args?.params);
    },
    classes: async (_source, args): Promise<Classe[]> => {
      return findClasses(args?.params);
    },
    communes: async (_source, args): Promise<Omit<Commune, 'departement'>[]> => {
      return findCommunes(args);
    },
    comportements: async (_source, args): Promise<Comportement[]> => {
      return findComportements(args?.params);
    },
    departements: async (_source, args): Promise<Departement[]> => {
      return findDepartements(args?.params);
    },
    especes: async (_source, args): Promise<Omit<Espece, 'classe'>[]> => {
      return findEspeces(args);
    },
    estimationsDistance: async (_source, args): Promise<EstimationDistance[]> => {
      return findEstimationsDistance(args?.params);
    },
    estimationsNombre: async (_source, args): Promise<EstimationNombre[]> => {
      return findEstimationsNombre(args?.params);
    },
    lieuxDits: async (_source, args): Promise<Omit<LieuDit, 'commune'>[]> => {
      return findLieuxDits(args);
    },
    meteos: async (): Promise<Meteo[]> => {
      return findMeteos();
    },
    milieux: async (_source, args): Promise<Milieu[]> => {
      return findMilieux(args?.params);
    },
    observateurs: async (_source, args): Promise<Observateur[]> => {
      return findObservateurs(args?.params);
    },
    sexes: async (_source, args): Promise<Sexe[]> => {
      return findSexes(args?.params);
    },
    lastDonneeId: async (): Promise<number> => {
      return findLastDonneeId();
    },
    nextRegroupement: async (): Promise<number> => {
      return findNextRegroupement();
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
    upsertAge: async (_source, args): Promise<Age> => {
      return upsertAge(args);
    },
    upsertClasse: async (_source, args): Promise<Classe> => {
      return upsertClasse(args);
    },
    upsertCommune: async (_source, args): Promise<CommuneEntity> => {
      return upsertCommune(args);
    },
    upsertComportement: async (_source, args): Promise<Comportement> => {
      return upsertComportement(args);
    },
    upsertDepartement: async (_source, args): Promise<Departement> => {
      return upsertDepartement(args);
    },
    upsertEspece: async (_source, args): Promise<EspeceEntity> => {
      return upsertEspece(args);
    },
    upsertEstimationDistance: async (_source, args): Promise<EstimationDistance> => {
      return upsertEstimationDistance(args);
    },
    upsertEstimationNombre: async (_source, args): Promise<EstimationNombre> => {
      return upsertEstimationNombre(args);
    },
    upsertLieuDit: async (_source, args): Promise<LieuDitWithCoordinatesAsNumber> => {
      return upsertLieuDit(args);
    },
    upsertMeteo: async (_source, args): Promise<Meteo> => {
      return upsertMeteo(args);
    },
    upsertMilieu: async (_source, args): Promise<Milieu> => {
      return upsertMilieu(args);
    },
    upsertObservateur: async (_source, args): Promise<Observateur> => {
      return upsertObservateur(args);
    },
    upsertSexe: async (_source, args): Promise<Sexe> => {
      return upsertSexe(args);
    },
    updateSettings: async (_source, { appConfiguration }): Promise<Settings> => {
      return persistUserSettings(appConfiguration);
    }
  },
  Commune: {
    departement: async (parent): Promise<Departement> => {
      return findDepartementOfCommuneId(parent?.id);
    }
  },
  Donnee: {
    espece: async (parent): Promise<Omit<Espece, 'classe'>> => {
      const espece = await findEspeceOfDonneeId(parent?.id);
      return findEspece(espece?.id);
    },
    inventaire: async (parent): Promise<Omit<Inventaire, 'lieuDit'>> => {
      const inventaire = await findInventaireOfDonneeId(parent?.id);
      return findInventaire(inventaire?.id);
    }
  },
  DonneeResult: {
    donnee: async (parent): Promise<Omit<Donnee, 'inventaire' | 'espece'>> => {
      return findDonnee(parent?.id);
    },
    navigation: async (parent): Promise<DonneeNavigationData> => {
      return findDonneeNavigationData(parent?.id);
    }
  },
  Inventaire: {
    lieuDit: async (parent): Promise<Omit<LieuDit, 'commune'>> => {
      const lieuDit = await findLieuDitOfInventaireId(parent?.id);
      return findLieuDit(lieuDit?.id);
    },
  },
  LieuDit: {
    commune: async (parent): Promise<Omit<Commune, 'departement'>> => {
      return findCommuneOfLieuDitId(parent?.id);
    }
  },
  Espece: {
    classe: async (parent): Promise<Classe> => {
      return findClasseOfEspeceId(parent?.id);
    }
  }
};

export default resolvers;