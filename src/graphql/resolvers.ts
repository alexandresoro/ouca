import { Commune as CommuneEntity, DatabaseRole, Espece as EspeceEntity } from "@prisma/client";
import { ApolloError, AuthenticationError, ForbiddenError } from "apollo-server-core";
import { FastifyReply } from "fastify";
import { Age, AgesPaginatedResult, AgeWithSpecimensCount, Classe, ClassesPaginatedResult, Commune, CommunesPaginatedResult, Comportement, ComportementsPaginatedResult, Departement, DepartementsPaginatedResult, Donnee, DonneeNavigationData, Espece, EspecesPaginatedResult, EstimationDistance, EstimationNombre, EstimationsDistancePaginatedResult, EstimationsNombrePaginatedResult, ImportStatus, Inventaire, LieuDit, LieuxDitsPaginatedResult, Meteo, MeteosPaginatedResult, Milieu, MilieuxPaginatedResult, Observateur, ObservateursPaginatedResult, Resolvers, Settings, Sexe, SexesPaginatedResult, SexeWithSpecimensCount, UpsertInventaireFailureReason, UserInfo, Version } from "../model/graphql";
import { executeDatabaseMigration } from "../services/database-migration/database-migration.service";
import { resetDatabase } from "../services/database/reset-database";
import { saveDatabaseRequest } from "../services/database/save-database";
import { deleteAge, findAge, findAges, findPaginatedAges, upsertAge } from "../services/entities/age-service";
import { deleteClasse, findClasse, findClasseOfEspeceId, findClasses, findPaginatedClasses, upsertClasse } from "../services/entities/classe-service";
import { deleteCommune, findCommune, findCommuneOfLieuDitId, findCommunes, findPaginatedCommunes, upsertCommune } from "../services/entities/commune-service";
import { deleteComportement, findComportement, findComportements, findComportementsByIds, findPaginatedComportements, upsertComportement } from "../services/entities/comportement-service";
import { findAppConfiguration, persistUserSettings } from "../services/entities/configuration-service";
import { deleteDepartement, findDepartement, findDepartementOfCommuneId, findDepartements, findPaginatedDepartements, upsertDepartement } from "../services/entities/departement-service";
import { countSpecimensByAgeForEspeceId, countSpecimensBySexeForEspeceId, deleteDonnee, DonneeWithRelations, findDonnee, findDonneeNavigationData, findLastDonneeId, findNextRegroupement, findPaginatedDonneesByCriteria, upsertDonnee } from "../services/entities/donnee-service";
import { deleteEspece, findEspece, findEspeceOfDonneeId, findEspeces, findPaginatedEspeces, upsertEspece } from "../services/entities/espece-service";
import { deleteEstimationDistance, findEstimationDistance, findEstimationsDistance, findPaginatedEstimationsDistance, upsertEstimationDistance } from "../services/entities/estimation-distance-service";
import { deleteEstimationNombre, findEstimationNombre, findEstimationsNombre, findPaginatedEstimationsNombre, upsertEstimationNombre } from "../services/entities/estimation-nombre-service";
import { findInventaire, findInventaireOfDonneeId, InventaireWithRelations, upsertInventaire } from "../services/entities/inventaire-service";
import { deleteLieuDit, findLieuDit, findLieuDitOfInventaireId, findLieuxDits, findPaginatedLieuxDits, LieuDitWithCoordinatesAsNumber, upsertLieuDit } from "../services/entities/lieu-dit-service";
import { deleteMeteo, findMeteo, findMeteos, findMeteosByIds, findPaginatedMeteos, upsertMeteo } from "../services/entities/meteo-service";
import { deleteMilieu, findMilieu, findMilieux, findMilieuxByIds, findPaginatedMilieux, upsertMilieu } from "../services/entities/milieu-service";
import { deleteObservateur, findObservateur, findObservateurs, findObservateursByIds, findPaginatedObservateurs, upsertObservateur } from "../services/entities/observateur-service";
import { deleteSexe, findPaginatedSexes, findSexe, findSexes, upsertSexe } from "../services/entities/sexe-service";
import { findVersion } from "../services/entities/version-service";
import { generateAgesExport, generateClassesExport, generateCommunesExport, generateComportementsExport, generateDepartementsExport, generateDonneesExport, generateEspecesExport, generateEstimationsDistanceExport, generateEstimationsNombreExport, generateLieuxDitsExport, generateMeteosExport, generateMilieuxExport, generateObservateursExport, generateSexesExport } from "../services/export-entites";
import { getImportStatus } from "../services/import-manager";
import { createAndAddSignedTokenAsCookie, deleteTokenCookie } from "../services/token-service";
import { createUser, deleteUser, getUser, getUsersCount, loginUser, updateUser } from "../services/user-service";
import { seedDatabase } from "../sql/seed";
import { logger } from "../utils/logger";

type Context = {
  request: unknown,
  reply: FastifyReply,
  userId: string | null,
  username: string | null,
  role: string | null
}

const validateUserAuthentication = (context: Context): void => {
  if (!context?.userId) {
    throw new AuthenticationError("User is not authenticated.")
  }
}

const resolvers: Resolvers<Context> = {
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
    specimenCountByAge: (_source, args): Promise<AgeWithSpecimensCount[]> => {
      return countSpecimensByAgeForEspeceId(args?.especeId);
    },
    specimenCountBySexe: (_source, args): Promise<SexeWithSpecimensCount[]> => {
      return countSpecimensBySexeForEspeceId(args?.especeId);
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
    paginatedSearchEspeces: async (_source, args): Promise<{
      count: number
    }> => {
      const { searchCriteria, ...rest } = args ?? {};
      return findPaginatedEspeces(rest, true, searchCriteria);
    },
    paginatedSearchDonnees: async (_source, args): Promise<{
      count: number
    }> => {
      return findPaginatedDonneesByCriteria(args);
    },
    importStatus: async (_source, args): Promise<ImportStatus> => {
      return getImportStatus(args.importId);
    },
    exportAges: async (): Promise<string> => {
      return generateAgesExport();
    },
    exportClasses: async (): Promise<string> => {
      return generateClassesExport();
    },
    exportCommunes: async (): Promise<string> => {
      return generateCommunesExport();
    },
    exportComportements: async (): Promise<string> => {
      return generateComportementsExport();
    },
    exportDepartements: async (): Promise<string> => {
      return generateDepartementsExport();
    },
    exportEstimationsDistance: async (): Promise<string> => {
      return generateEstimationsDistanceExport();
    },
    exportEstimationsNombre: async (): Promise<string> => {
      return generateEstimationsNombreExport();
    },
    exportDonnees: async (_source, args): Promise<string> => {
      return generateDonneesExport(args?.searchCriteria);
    },
    exportEspeces: async (): Promise<string> => {
      return generateEspecesExport();
    },
    exportLieuxDits: async (): Promise<string> => {
      return generateLieuxDitsExport();
    },
    exportMeteos: async (): Promise<string> => {
      return generateMeteosExport();
    },
    exportMilieux: async (): Promise<string> => {
      return generateMilieuxExport();
    },
    exportObservateurs: async (): Promise<string> => {
      return generateObservateursExport();
    },
    exportSexes: async (): Promise<string> => {
      return generateSexesExport();
    },
    dumpDatabase: async (): Promise<string> => {
      return saveDatabaseRequest();
    },
    settings: async (): Promise<Settings> => {
      return findAppConfiguration();
    },
    version: async (): Promise<Version> => {
      return findVersion();
    }
  },
  Mutation: {
    deleteAge: async (_source, args): Promise<number> => {
      return deleteAge(args.id).then(({ id }) => id);
    },
    deleteClasse: async (_source, args): Promise<number> => {
      return deleteClasse(args.id).then(({ id }) => id);
    },
    deleteCommune: async (_source, args): Promise<number> => {
      return deleteCommune(args.id).then(({ id }) => id);
    },
    deleteComportement: async (_source, args): Promise<number> => {
      return deleteComportement(args.id).then(({ id }) => id);
    },
    deleteDepartement: async (_source, args): Promise<number> => {
      return deleteDepartement(args.id).then(({ id }) => id);
    },
    deleteDonnee: async (_source, args): Promise<number> => {
      return deleteDonnee(args.id).then(({ id }) => id);
    },
    deleteEspece: async (_source, args): Promise<number> => {
      return deleteEspece(args.id).then(({ id }) => id);
    },
    deleteEstimationDistance: async (_source, args): Promise<number> => {
      return deleteEstimationDistance(args.id).then(({ id }) => id);
    },
    deleteEstimationNombre: async (_source, args): Promise<number> => {
      return deleteEstimationNombre(args.id).then(({ id }) => id);
    },
    deleteLieuDit: async (_source, args): Promise<number> => {
      return deleteLieuDit(args.id).then(({ id }) => id);
    },
    deleteMeteo: async (_source, args): Promise<number> => {
      return deleteMeteo(args.id).then(({ id }) => id);
    },
    deleteMilieu: async (_source, args): Promise<number> => {
      return deleteMilieu(args.id).then(({ id }) => id);
    },
    deleteObservateur: async (_source, args): Promise<number> => {
      return deleteObservateur(args.id).then(({ id }) => id);
    },
    deleteSexe: async (_source, args): Promise<number> => {
      return deleteSexe(args.id).then(({ id }) => id);
    },
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
    upsertDonnee: async (_source, args): Promise<{
      failureReason?: string,
      donnee?: DonneeWithRelations
    }> => {
      try {
        const upsertedDonnee = await upsertDonnee(args);
        return {
          donnee: upsertedDonnee
        }
      } catch (error) {
        const failureReason = error as string;
        return {
          failureReason
        }
      }
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
    upsertInventaire: async (_source, args): Promise<{
      failureReason?: UpsertInventaireFailureReason,
      inventaire?: InventaireWithRelations
    }> => {
      try {
        const upsertedInventaire = await upsertInventaire(args);
        return {
          inventaire: upsertedInventaire
        }
      } catch (error) {
        const failureReason = error as UpsertInventaireFailureReason;
        return {
          failureReason
        }
      }
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
    },
    initializeDatabase: async (): Promise<boolean> => {
      await seedDatabase();
      return true;
    },
    resetDatabase: async (): Promise<boolean> => {
      await resetDatabase();
      return true;
    },
    updateDatabase: async (): Promise<boolean> => {
      await executeDatabaseMigration();
      return true;
    },
    userSignup: async (_source, args, context): Promise<UserInfo> => {
      // Only an administrator can create new accounts
      // Except when no accounts at all exist:
      // In that case, the first created account is an admin
      const usersCount = await getUsersCount();

      let userInfo;
      if (usersCount === 0) {
        userInfo = await createUser(args.signupData, DatabaseRole.admin);
      } else {
        validateUserAuthentication(context);
        if (context?.role !== DatabaseRole.admin) {
          throw new ForbiddenError("User account creation is not allowed for the current user")
        }
        userInfo = await createUser(args.signupData, args?.role ?? DatabaseRole.contributor);
      }

      if (userInfo) {
        await createAndAddSignedTokenAsCookie(context.reply, userInfo)

        logger.info(`User ${userInfo?.username} has been created`);
      }
      return userInfo;
    },
    userLogin: async (_source, args, context): Promise<UserInfo> => {
      const userInfo = await loginUser(args.loginData);

      if (userInfo) {
        await createAndAddSignedTokenAsCookie(context.reply, userInfo)

        logger.debug(`User ${userInfo?.username} logged in`);

        return userInfo;
      }

      throw new AuthenticationError("Authentication failed");
    },
    userRefresh: async (_source, args, context): Promise<UserInfo> => {
      validateUserAuthentication(context);

      const userInfo = await getUser(context.userId);
      if (userInfo) {
        await createAndAddSignedTokenAsCookie(context.reply, userInfo);
        return userInfo;
      }

      return null;
    },
    userLogout: async (_source, args, context): Promise<boolean> => {
      validateUserAuthentication(context);
      await deleteTokenCookie(context.reply);

      logger.debug(`User ${context.username} logged out`);

      return true;
    },
    userEdit: async (_source, args, context): Promise<UserInfo> => {
      validateUserAuthentication(context);

      // Only a user can delete itself
      if (context.userId === args?.id) {
        const updatedUser = await updateUser(args.id, args.editUserData);

        if (updatedUser) {
          await createAndAddSignedTokenAsCookie(context.reply, updatedUser);
        }

        return updatedUser;
      }

      throw new ForbiddenError("User modification is only allowed from the user itself")
    },
    userDelete: async (_source, args, context): Promise<boolean> => {
      validateUserAuthentication(context);

      // Only a user can delete itself
      // With admin role, admin can delete anyone
      if ((context.userId === args?.id) || (context.role === DatabaseRole.admin)) {
        await deleteUser(args.id);

        if (context.userId === args?.id) {
          await deleteTokenCookie(context.reply);

        }

        logger.info(`User with id ${args.id} has been deleted. Request has been initiated by ${context.username}`);

        return true;
      }

      throw new ApolloError("User deletion request failed");
    },
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