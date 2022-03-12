import { Commune as CommuneEntity, DatabaseRole, Espece as EspeceEntity } from "@prisma/client";
import { ApolloError, AuthenticationError, ForbiddenError } from "apollo-server-core";
import { resetDatabase } from "../services/database/reset-database";
import { saveDatabaseRequest } from "../services/database/save-database";
import { deleteAge, findAge, findAges, findPaginatedAges, upsertAge } from "../services/entities/age-service";
import {
  deleteClasse,
  findClasse,
  findClasseOfEspeceId,
  findClasses,
  findPaginatedClasses,
  upsertClasse
} from "../services/entities/classe-service";
import {
  deleteCommune,
  findCommune,
  findCommuneOfLieuDitId,
  findCommunes,
  findPaginatedCommunes,
  upsertCommune
} from "../services/entities/commune-service";
import {
  deleteComportement,
  findComportement,
  findComportements,
  findComportementsByIds,
  findPaginatedComportements,
  upsertComportement
} from "../services/entities/comportement-service";
import { findAppConfiguration, persistUserSettings } from "../services/entities/configuration-service";
import {
  deleteDepartement,
  findDepartement,
  findDepartementOfCommuneId,
  findDepartements,
  findPaginatedDepartements,
  upsertDepartement
} from "../services/entities/departement-service";
import {
  countSpecimensByAgeForEspeceId,
  countSpecimensBySexeForEspeceId,
  deleteDonnee,
  DonneeWithRelations,
  findDonnee,
  findDonneeNavigationData,
  findLastDonneeId,
  findNextRegroupement,
  findPaginatedDonneesByCriteria,
  upsertDonnee
} from "../services/entities/donnee-service";
import {
  deleteEspece,
  findEspece,
  findEspeceOfDonneeId,
  findEspeces,
  findPaginatedEspeces,
  upsertEspece
} from "../services/entities/espece-service";
import {
  deleteEstimationDistance,
  findEstimationDistance,
  findEstimationsDistance,
  findPaginatedEstimationsDistance,
  upsertEstimationDistance
} from "../services/entities/estimation-distance-service";
import {
  deleteEstimationNombre,
  findEstimationNombre,
  findEstimationsNombre,
  findPaginatedEstimationsNombre,
  upsertEstimationNombre
} from "../services/entities/estimation-nombre-service";
import {
  findInventaire,
  findInventaireOfDonneeId,
  InventaireWithRelations,
  upsertInventaire
} from "../services/entities/inventaire-service";
import {
  deleteLieuDit,
  findLieuDit,
  findLieuDitOfInventaireId,
  findLieuxDits,
  findPaginatedLieuxDits,
  LieuDitWithCoordinatesAsNumber,
  upsertLieuDit
} from "../services/entities/lieu-dit-service";
import {
  deleteMeteo,
  findMeteo,
  findMeteos,
  findMeteosByIds,
  findPaginatedMeteos,
  upsertMeteo
} from "../services/entities/meteo-service";
import {
  deleteMilieu,
  findMilieu,
  findMilieux,
  findMilieuxByIds,
  findPaginatedMilieux,
  upsertMilieu
} from "../services/entities/milieu-service";
import {
  deleteObservateur,
  findObservateur,
  findObservateurs,
  findObservateursByIds,
  findPaginatedObservateurs,
  upsertObservateur
} from "../services/entities/observateur-service";
import { deleteSexe, findPaginatedSexes, findSexe, findSexes, upsertSexe } from "../services/entities/sexe-service";
import {
  generateAgesExport,
  generateClassesExport,
  generateCommunesExport,
  generateComportementsExport,
  generateDepartementsExport,
  generateDonneesExport,
  generateEspecesExport,
  generateEstimationsDistanceExport,
  generateEstimationsNombreExport,
  generateLieuxDitsExport,
  generateMeteosExport,
  generateMilieuxExport,
  generateObservateursExport,
  generateSexesExport
} from "../services/export-entites";
import { getImportStatus } from "../services/import-manager";
import { createAndAddSignedTokenAsCookie, deleteTokenCookie } from "../services/token-service";
import { createUser, deleteUser, getUser, loginUser, updateUser } from "../services/user-service";
import { logger } from "../utils/logger";
import {
  Age,
  AgesPaginatedResult,
  AgeWithSpecimensCount,
  Classe,
  ClassesPaginatedResult,
  Commune,
  CommunesPaginatedResult,
  Comportement,
  ComportementsPaginatedResult,
  Departement,
  DepartementsPaginatedResult,
  Donnee,
  DonneeNavigationData,
  Espece,
  EspecesPaginatedResult,
  EstimationDistance,
  EstimationNombre,
  EstimationsDistancePaginatedResult,
  EstimationsNombrePaginatedResult,
  ImportStatus,
  Inventaire,
  LieuDit,
  LieuxDitsPaginatedResult,
  Meteo,
  MeteosPaginatedResult,
  Milieu,
  MilieuxPaginatedResult,
  Observateur,
  ObservateursPaginatedResult,
  Resolvers,
  Settings,
  Sexe,
  SexesPaginatedResult,
  SexeWithSpecimensCount,
  UpsertInventaireFailureReason,
  UserInfo
} from "./generated/graphql-types";
import { GraphQLContext } from "./graphql-context";

const USER_NOT_AUTHENTICATED = "User is not authenticated.";

const resolvers: Resolvers<GraphQLContext> = {
  Query: {
    age: async (_source, args, context): Promise<Age | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findAge(args.id, context.user);
    },
    classe: async (_source, args, context): Promise<Classe | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findClasse(args.id, context.user);
    },
    commune: async (_source, args, context): Promise<Omit<Commune, "departement"> | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findCommune(args.id);
    },
    comportement: async (_source, args, context): Promise<Comportement | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findComportement(args.id, context.user);
    },
    comportementList: async (_source, args, context): Promise<Comportement[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findComportementsByIds(args.ids, context.user);
    },
    departement: async (_source, args, context): Promise<Departement | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findDepartement(args.id, context.user);
    },
    donnee: (_source, args, context): { id: number } => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return {
        id: args.id
      };
    },
    espece: async (_source, args, context): Promise<Omit<Espece, "classe"> | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findEspece(args.id);
    },
    estimationDistance: async (_source, args, context): Promise<EstimationDistance | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findEstimationDistance(args.id, context.user);
    },
    estimationNombre: async (_source, args, context): Promise<EstimationNombre | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findEstimationNombre(args.id, context.user);
    },
    inventaire: async (_source, args, context): Promise<Omit<Inventaire, "lieuDit"> | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findInventaire(args.id);
    },
    lieuDit: async (_source, args, context): Promise<Omit<LieuDit, "commune"> | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findLieuDit(args.id);
    },
    meteo: async (_source, args, context): Promise<Meteo | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findMeteo(args.id, context.user);
    },
    meteoList: async (_source, args, context): Promise<Meteo[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findMeteosByIds(args.ids, context.user);
    },
    milieu: async (_source, args, context): Promise<Milieu | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findMilieu(args.id, context.user);
    },
    milieuList: async (_source, args, context): Promise<Milieu[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findMilieuxByIds(args.ids, context.user);
    },
    observateur: async (_source, args, context): Promise<Observateur | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findObservateur(args.id, context.user);
    },
    observateurList: async (_source, args, context): Promise<Observateur[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findObservateursByIds(args.ids, context.user);
    },
    sexe: async (_source, args, context): Promise<Sexe | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findSexe(args.id, context.user);
    },
    specimenCountByAge: (_source, args, context): Promise<AgeWithSpecimensCount[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return countSpecimensByAgeForEspeceId(args?.especeId);
    },
    specimenCountBySexe: (_source, args, context): Promise<SexeWithSpecimensCount[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return countSpecimensBySexeForEspeceId(args?.especeId);
    },
    ages: async (_source, args, context): Promise<Age[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findAges(args?.params, context.user);
    },
    classes: async (_source, args, context): Promise<Classe[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findClasses(args?.params, context.user);
    },
    communes: async (_source, args, context): Promise<Omit<Commune, "departement">[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findCommunes(args);
    },
    comportements: async (_source, args, context): Promise<Comportement[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findComportements(args?.params, context.user);
    },
    departements: async (_source, args, context): Promise<Departement[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findDepartements(args?.params, context.user);
    },
    especes: async (_source, args, context): Promise<Omit<Espece, "classe">[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findEspeces(args);
    },
    estimationsDistance: async (_source, args, context): Promise<EstimationDistance[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findEstimationsDistance(args?.params, context.user);
    },
    estimationsNombre: async (_source, args, context): Promise<EstimationNombre[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findEstimationsNombre(args?.params, context.user);
    },
    lieuxDits: async (_source, args, context): Promise<Omit<LieuDit, "commune">[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findLieuxDits(args);
    },
    meteos: async (_source, args, context): Promise<Meteo[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findMeteos(args?.params, context.user);
    },
    milieux: async (_source, args, context): Promise<Milieu[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findMilieux(args?.params, context.user);
    },
    observateurs: async (_source, args, context): Promise<Observateur[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findObservateurs(args?.params, context.user);
    },
    sexes: async (_source, args, context): Promise<Sexe[]> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findSexes(args?.params, context.user);
    },
    lastDonneeId: async (_source, args, context): Promise<number | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findLastDonneeId();
    },
    nextRegroupement: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findNextRegroupement();
    },
    paginatedAges: async (_source, args, context): Promise<AgesPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedAges(args, context.user);
    },
    paginatedClasses: async (_source, args, context): Promise<ClassesPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedClasses(args, context.user);
    },
    paginatedCommunes: async (_source, args, context): Promise<CommunesPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedCommunes(args);
    },
    paginatedComportements: async (_source, args, context): Promise<ComportementsPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedComportements(args, context.user);
    },
    paginatedDepartements: async (_source, args, context): Promise<DepartementsPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedDepartements(args, context.user);
    },
    paginatedEspeces: async (_source, args, context): Promise<EspecesPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedEspeces(args);
    },
    paginatedEstimationsDistance: async (_source, args, context): Promise<EstimationsDistancePaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedEstimationsDistance(args, context.user);
    },
    paginatedEstimationsNombre: async (_source, args, context): Promise<EstimationsNombrePaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedEstimationsNombre(args, context.user);
    },
    paginatedLieuxdits: async (_source, args, context): Promise<LieuxDitsPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedLieuxDits(args);
    },
    paginatedMeteos: async (_source, args, context): Promise<MeteosPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedMeteos(args, context.user);
    },
    paginatedMilieux: async (_source, args, context): Promise<MilieuxPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedMilieux(args, context.user);
    },
    paginatedObservateurs: async (_source, args, context): Promise<ObservateursPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedObservateurs(args, context.user);
    },
    paginatedSexes: async (_source, args, context): Promise<SexesPaginatedResult> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedSexes(args, context.user);
    },
    paginatedSearchEspeces: async (
      _source,
      args,
      context
    ): Promise<{
      count: number;
    }> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      const { searchCriteria, ...rest } = args ?? {};
      return findPaginatedEspeces(rest, searchCriteria);
    },
    paginatedSearchDonnees: async (
      _source,
      args,
      context
    ): Promise<{
      count: number;
    }> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findPaginatedDonneesByCriteria(args);
    },
    importStatus: async (_source, args, context): Promise<ImportStatus | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return getImportStatus(args.importId, context.user);
    },
    exportAges: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateAgesExport();
    },
    exportClasses: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateClassesExport();
    },
    exportCommunes: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateCommunesExport();
    },
    exportComportements: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateComportementsExport();
    },
    exportDepartements: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateDepartementsExport();
    },
    exportEstimationsDistance: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateEstimationsDistanceExport();
    },
    exportEstimationsNombre: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateEstimationsNombreExport();
    },
    exportDonnees: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateDonneesExport(args?.searchCriteria);
    },
    exportEspeces: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateEspecesExport();
    },
    exportLieuxDits: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateLieuxDitsExport();
    },
    exportMeteos: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateMeteosExport();
    },
    exportMilieux: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateMilieuxExport();
    },
    exportObservateurs: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateObservateursExport();
    },
    exportSexes: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return generateSexesExport();
    },
    dumpDatabase: async (_source, args, context): Promise<string> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      if (context.user.role !== DatabaseRole.admin) {
        throw new ForbiddenError("Database dump is not allowed for the current user");
      }
      return saveDatabaseRequest();
    },
    settings: async (_source, args, context): Promise<Settings | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return findAppConfiguration(context.user);
    }
  },
  Mutation: {
    deleteAge: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteAge(args.id, context.user).then(({ id }) => id);
    },
    deleteClasse: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteClasse(args.id, context.user).then(({ id }) => id);
    },
    deleteCommune: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteCommune(args.id).then(({ id }) => id);
    },
    deleteComportement: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteComportement(args.id, context.user).then(({ id }) => id);
    },
    deleteDepartement: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteDepartement(args.id, context.user).then(({ id }) => id);
    },
    deleteDonnee: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteDonnee(args.id).then(({ id }) => id);
    },
    deleteEspece: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteEspece(args.id).then(({ id }) => id);
    },
    deleteEstimationDistance: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteEstimationDistance(args.id, context.user).then(({ id }) => id);
    },
    deleteEstimationNombre: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteEstimationNombre(args.id, context.user).then(({ id }) => id);
    },
    deleteLieuDit: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteLieuDit(args.id).then(({ id }) => id);
    },
    deleteMeteo: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteMeteo(args.id, context.user).then(({ id }) => id);
    },
    deleteMilieu: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteMilieu(args.id, context.user).then(({ id }) => id);
    },
    deleteObservateur: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteObservateur(args.id, context.user).then(({ id }) => id);
    },
    deleteSexe: async (_source, args, context): Promise<number> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return deleteSexe(args.id, context.user).then(({ id }) => id);
    },
    upsertAge: async (_source, args, context): Promise<Age> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertAge(args, context.user);
    },
    upsertClasse: async (_source, args, context): Promise<Classe> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertClasse(args, context.user);
    },
    upsertCommune: async (_source, args, context): Promise<CommuneEntity> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertCommune(args, context.user);
    },
    upsertComportement: async (_source, args, context): Promise<Comportement> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertComportement(args, context.user);
    },
    upsertDepartement: async (_source, args, context): Promise<Departement> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertDepartement(args, context.user);
    },
    upsertDonnee: async (
      _source,
      args,
      context
    ): Promise<{
      failureReason?: string;
      donnee?: DonneeWithRelations;
    }> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      try {
        const upsertedDonnee = await upsertDonnee(args);
        return {
          donnee: upsertedDonnee
        };
      } catch (error) {
        const failureReason = error as string;
        return {
          failureReason
        };
      }
    },
    upsertEspece: async (_source, args, context): Promise<EspeceEntity> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertEspece(args, context.user);
    },
    upsertEstimationDistance: async (_source, args, context): Promise<EstimationDistance> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertEstimationDistance(args, context.user);
    },
    upsertEstimationNombre: async (_source, args, context): Promise<EstimationNombre> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertEstimationNombre(args, context.user);
    },
    upsertInventaire: async (
      _source,
      args,
      context
    ): Promise<{
      failureReason?: UpsertInventaireFailureReason;
      inventaire?: InventaireWithRelations;
    }> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      try {
        const upsertedInventaire = await upsertInventaire(args, context.user);
        return {
          inventaire: upsertedInventaire
        };
      } catch (error) {
        const failureReason = error as UpsertInventaireFailureReason;
        return {
          failureReason
        };
      }
    },
    upsertLieuDit: async (_source, args, context): Promise<LieuDitWithCoordinatesAsNumber> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertLieuDit(args, context.user);
    },
    upsertMeteo: async (_source, args, context): Promise<Meteo> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertMeteo(args, context.user);
    },
    upsertMilieu: async (_source, args, context): Promise<Milieu> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertMilieu(args, context.user);
    },
    upsertObservateur: async (_source, args, context): Promise<Observateur> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertObservateur(args, context.user);
    },
    upsertSexe: async (_source, args, context): Promise<Sexe> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return upsertSexe(args, context.user);
    },
    updateSettings: async (_source, { appConfiguration }, context): Promise<Settings> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      return persistUserSettings(appConfiguration, context.user);
    },
    resetDatabase: async (_source, args, context): Promise<boolean> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      if (context.user.role !== DatabaseRole.admin) {
        throw new ForbiddenError("Database reset is not allowed for the current user");
      }
      await resetDatabase();
      return true;
    },
    userSignup: async (_source, args, context): Promise<UserInfo> => {
      return createUser(args.signupData, DatabaseRole.admin, context.user);
    },
    userLogin: async (_source, args, context): Promise<UserInfo> => {
      const userInfo = await loginUser(args.loginData);

      if (userInfo) {
        await createAndAddSignedTokenAsCookie(context.reply, userInfo);

        logger.debug(`User ${userInfo?.username} logged in`);

        return userInfo;
      }

      throw new AuthenticationError("Authentication failed");
    },
    userRefresh: async (_source, args, context): Promise<UserInfo | null> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);

      const userInfo = await getUser(context.user.id);
      if (userInfo) {
        await createAndAddSignedTokenAsCookie(context.reply, userInfo);
        return userInfo;
      }

      return null;
    },
    userLogout: async (_source, args, context): Promise<boolean> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);
      await deleteTokenCookie(context.reply);

      logger.debug(`User ID ${context.user.id} logged out`);

      return true;
    },
    userEdit: async (_source, args, context): Promise<UserInfo> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);

      try {
        const updatedUser = await updateUser(args.id, args.editUserData, context.user);

        if (updatedUser?.id === context.user?.id) {
          await createAndAddSignedTokenAsCookie(context.reply, updatedUser);
        }
        return updatedUser;
      } catch (e) {
        throw new ForbiddenError("User modification is only allowed from the user itself");
      }
    },
    userDelete: async (_source, args, context): Promise<boolean> => {
      if (!context?.user) throw new AuthenticationError(USER_NOT_AUTHENTICATED);

      try {
        await deleteUser(args.id, context.user);
      } catch (e) {
        throw new ApolloError("User deletion request failed");
      }

      if (args?.id === context.user?.id) {
        await deleteTokenCookie(context.reply);
      }

      return true;
    }
  },
  Commune: {
    departement: async (parent, args, context): Promise<Departement | null> => {
      return findDepartementOfCommuneId(parent?.id, context.user);
    }
  },
  Donnee: {
    espece: async (parent): Promise<Omit<Espece, "classe"> | null> => {
      const espece = await findEspeceOfDonneeId(parent?.id);
      return findEspece(espece?.id);
    },
    inventaire: async (parent): Promise<Omit<Inventaire, "lieuDit"> | null> => {
      const inventaire = await findInventaireOfDonneeId(parent?.id);
      return findInventaire(inventaire?.id);
    }
  },
  DonneeResult: {
    donnee: async (parent): Promise<Omit<Donnee, "inventaire" | "espece"> | null> => {
      return findDonnee(parent?.id);
    },
    navigation: async (parent): Promise<DonneeNavigationData> => {
      return findDonneeNavigationData(parent?.id);
    }
  },
  Inventaire: {
    lieuDit: async (parent): Promise<Omit<LieuDit, "commune"> | null> => {
      const lieuDit = await findLieuDitOfInventaireId(parent?.id);
      return findLieuDit(lieuDit?.id);
    }
  },
  LieuDit: {
    commune: async (parent): Promise<Omit<Commune, "departement"> | null> => {
      return findCommuneOfLieuDitId(parent?.id);
    }
  },
  Espece: {
    classe: async (parent, args, context): Promise<Classe | null> => {
      return findClasseOfEspeceId(parent?.id, context.user);
    }
  }
};

export default resolvers;
