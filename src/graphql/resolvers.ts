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
    age: async (_source, args, context): Promise<Age> => {
      validateUserAuthentication(context);
      return findAge(args.id);
    },
    classe: async (_source, args, context): Promise<Classe> => {
      validateUserAuthentication(context);
      return findClasse(args.id);
    },
    commune: async (_source, args, context): Promise<Omit<Commune, 'departement'>> => {
      validateUserAuthentication(context);
      return findCommune(args.id);
    },
    comportement: async (_source, args, context): Promise<Comportement> => {
      validateUserAuthentication(context);
      return findComportement(args.id);
    },
    comportementList: async (_source, args, context): Promise<Comportement[]> => {
      validateUserAuthentication(context);
      return findComportementsByIds(args.ids);
    },
    departement: async (_source, args, context): Promise<Departement> => {
      validateUserAuthentication(context);
      return findDepartement(args.id);
    },
    donnee: (_source, args, context): { id: number } => {
      validateUserAuthentication(context);
      return {
        id: args.id,
      };
    },
    espece: async (_source, args, context): Promise<Omit<Espece, 'classe'>> => {
      validateUserAuthentication(context);
      return findEspece(args.id);
    },
    estimationDistance: async (_source, args, context): Promise<EstimationDistance> => {
      validateUserAuthentication(context);
      return findEstimationDistance(args.id);
    },
    estimationNombre: async (_source, args, context): Promise<EstimationNombre> => {
      validateUserAuthentication(context);
      return findEstimationNombre(args.id);
    },
    inventaire: async (_source, args, context): Promise<Omit<Inventaire, 'lieuDit'>> => {
      validateUserAuthentication(context);
      return findInventaire(args.id);
    },
    lieuDit: async (_source, args, context): Promise<Omit<LieuDit, 'commune'>> => {
      validateUserAuthentication(context);
      return findLieuDit(args.id);
    },
    meteo: async (_source, args, context): Promise<Meteo> => {
      validateUserAuthentication(context);
      return findMeteo(args.id);
    },
    meteoList: async (_source, args, context): Promise<Meteo[]> => {
      validateUserAuthentication(context);
      return findMeteosByIds(args.ids);
    },
    milieu: async (_source, args, context): Promise<Milieu> => {
      validateUserAuthentication(context);
      return findMilieu(args.id);
    },
    milieuList: async (_source, args, context): Promise<Milieu[]> => {
      validateUserAuthentication(context);
      return findMilieuxByIds(args.ids);
    },
    observateur: async (_source, args, context): Promise<Observateur> => {
      validateUserAuthentication(context);
      return findObservateur(args.id);
    },
    observateurList: async (_source, args, context): Promise<Observateur[]> => {
      validateUserAuthentication(context);
      return findObservateursByIds(args.ids);
    },
    sexe: async (_source, args, context): Promise<Sexe> => {
      validateUserAuthentication(context);
      return findSexe(args.id);
    },
    specimenCountByAge: (_source, args, context): Promise<AgeWithSpecimensCount[]> => {
      validateUserAuthentication(context);
      return countSpecimensByAgeForEspeceId(args?.especeId);
    },
    specimenCountBySexe: (_source, args, context): Promise<SexeWithSpecimensCount[]> => {
      validateUserAuthentication(context);
      return countSpecimensBySexeForEspeceId(args?.especeId);
    },
    ages: async (_source, args, context): Promise<Age[]> => {
      validateUserAuthentication(context);
      return findAges(args?.params);
    },
    classes: async (_source, args, context): Promise<Classe[]> => {
      validateUserAuthentication(context);
      return findClasses(args?.params);
    },
    communes: async (_source, args, context): Promise<Omit<Commune, 'departement'>[]> => {
      validateUserAuthentication(context);
      return findCommunes(args);
    },
    comportements: async (_source, args, context): Promise<Comportement[]> => {
      validateUserAuthentication(context);
      return findComportements(args?.params);
    },
    departements: async (_source, args, context): Promise<Departement[]> => {
      validateUserAuthentication(context);
      return findDepartements(args?.params);
    },
    especes: async (_source, args, context): Promise<Omit<Espece, 'classe'>[]> => {
      validateUserAuthentication(context);
      return findEspeces(args);
    },
    estimationsDistance: async (_source, args, context): Promise<EstimationDistance[]> => {
      validateUserAuthentication(context);
      return findEstimationsDistance(args?.params);
    },
    estimationsNombre: async (_source, args, context): Promise<EstimationNombre[]> => {
      validateUserAuthentication(context);
      return findEstimationsNombre(args?.params);
    },
    lieuxDits: async (_source, args, context): Promise<Omit<LieuDit, 'commune'>[]> => {
      validateUserAuthentication(context);
      return findLieuxDits(args);
    },
    meteos: async (_source, args, context): Promise<Meteo[]> => {
      validateUserAuthentication(context);
      return findMeteos();
    },
    milieux: async (_source, args, context): Promise<Milieu[]> => {
      validateUserAuthentication(context);
      return findMilieux(args?.params);
    },
    observateurs: async (_source, args, context): Promise<Observateur[]> => {
      validateUserAuthentication(context);
      return findObservateurs(args?.params);
    },
    sexes: async (_source, args, context): Promise<Sexe[]> => {
      validateUserAuthentication(context);
      return findSexes(args?.params);
    },
    lastDonneeId: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return findLastDonneeId();
    },
    nextRegroupement: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return findNextRegroupement();
    },
    paginatedAges: async (_source, args, context): Promise<AgesPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedAges(args, true);
    },
    paginatedClasses: async (_source, args, context): Promise<ClassesPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedClasses(args, true);
    },
    paginatedCommunes: async (_source, args, context): Promise<CommunesPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedCommunes(args, true);
    },
    paginatedComportements: async (_source, args, context): Promise<ComportementsPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedComportements(args, true);
    },
    paginatedDepartements: async (_source, args, context): Promise<DepartementsPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedDepartements(args, true);
    },
    paginatedEspeces: async (_source, args, context): Promise<EspecesPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedEspeces(args, true);
    },
    paginatedEstimationsDistance: async (_source, args, context): Promise<EstimationsDistancePaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedEstimationsDistance(args, true);
    },
    paginatedEstimationsNombre: async (_source, args, context): Promise<EstimationsNombrePaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedEstimationsNombre(args, true);
    },
    paginatedLieuxdits: async (_source, args, context): Promise<LieuxDitsPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedLieuxDits(args, true);
    },
    paginatedMeteos: async (_source, args, context): Promise<MeteosPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedMeteos(args, true);
    },
    paginatedMilieux: async (_source, args, context): Promise<MilieuxPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedMilieux(args, true);
    },
    paginatedObservateurs: async (_source, args, context): Promise<ObservateursPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedObservateurs(args, true);
    },
    paginatedSexes: async (_source, args, context): Promise<SexesPaginatedResult> => {
      validateUserAuthentication(context);
      return findPaginatedSexes(args, true);
    },
    paginatedSearchEspeces: async (_source, args, context): Promise<{
      count: number
    }> => {
      validateUserAuthentication(context);
      const { searchCriteria, ...rest } = args ?? {};
      return findPaginatedEspeces(rest, true, searchCriteria);
    },
    paginatedSearchDonnees: async (_source, args, context): Promise<{
      count: number
    }> => {
      validateUserAuthentication(context);
      return findPaginatedDonneesByCriteria(args);
    },
    importStatus: async (_source, args, context): Promise<ImportStatus> => {
      validateUserAuthentication(context);
      return getImportStatus(args.importId);
    },
    exportAges: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateAgesExport();
    },
    exportClasses: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateClassesExport();
    },
    exportCommunes: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateCommunesExport();
    },
    exportComportements: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateComportementsExport();
    },
    exportDepartements: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateDepartementsExport();
    },
    exportEstimationsDistance: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateEstimationsDistanceExport();
    },
    exportEstimationsNombre: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateEstimationsNombreExport();
    },
    exportDonnees: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateDonneesExport(args?.searchCriteria);
    },
    exportEspeces: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateEspecesExport();
    },
    exportLieuxDits: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateLieuxDitsExport();
    },
    exportMeteos: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateMeteosExport();
    },
    exportMilieux: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateMilieuxExport();
    },
    exportObservateurs: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateObservateursExport();
    },
    exportSexes: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      return generateSexesExport();
    },
    dumpDatabase: async (_source, args, context): Promise<string> => {
      validateUserAuthentication(context);
      if (context?.role !== DatabaseRole.admin) {
        throw new ForbiddenError("Database dump is not allowed for the current user")
      }
      return saveDatabaseRequest();
    },
    settings: async (_source, args, context): Promise<Settings> => {
      validateUserAuthentication(context);
      // TODO handle own user settings
      return findAppConfiguration();
    },
    version: async (_source, args, context): Promise<Version> => {
      validateUserAuthentication(context);
      return findVersion();
    }
  },
  Mutation: {
    deleteAge: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteAge(args.id).then(({ id }) => id);
    },
    deleteClasse: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteClasse(args.id).then(({ id }) => id);
    },
    deleteCommune: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteCommune(args.id).then(({ id }) => id);
    },
    deleteComportement: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteComportement(args.id).then(({ id }) => id);
    },
    deleteDepartement: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteDepartement(args.id).then(({ id }) => id);
    },
    deleteDonnee: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteDonnee(args.id).then(({ id }) => id);
    },
    deleteEspece: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteEspece(args.id).then(({ id }) => id);
    },
    deleteEstimationDistance: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteEstimationDistance(args.id).then(({ id }) => id);
    },
    deleteEstimationNombre: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteEstimationNombre(args.id).then(({ id }) => id);
    },
    deleteLieuDit: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteLieuDit(args.id).then(({ id }) => id);
    },
    deleteMeteo: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteMeteo(args.id).then(({ id }) => id);
    },
    deleteMilieu: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteMilieu(args.id).then(({ id }) => id);
    },
    deleteObservateur: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteObservateur(args.id).then(({ id }) => id);
    },
    deleteSexe: async (_source, args, context): Promise<number> => {
      validateUserAuthentication(context);
      return deleteSexe(args.id).then(({ id }) => id);
    },
    upsertAge: async (_source, args, context): Promise<Age> => {
      validateUserAuthentication(context);
      return upsertAge(args);
    },
    upsertClasse: async (_source, args, context): Promise<Classe> => {
      validateUserAuthentication(context);
      return upsertClasse(args);
    },
    upsertCommune: async (_source, args, context): Promise<CommuneEntity> => {
      validateUserAuthentication(context);
      return upsertCommune(args);
    },
    upsertComportement: async (_source, args, context): Promise<Comportement> => {
      validateUserAuthentication(context);
      return upsertComportement(args);
    },
    upsertDepartement: async (_source, args, context): Promise<Departement> => {
      validateUserAuthentication(context);
      return upsertDepartement(args);
    },
    upsertDonnee: async (_source, args, context): Promise<{
      failureReason?: string,
      donnee?: DonneeWithRelations
    }> => {
      validateUserAuthentication(context);
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
    upsertEspece: async (_source, args, context): Promise<EspeceEntity> => {
      validateUserAuthentication(context);
      return upsertEspece(args);
    },
    upsertEstimationDistance: async (_source, args, context): Promise<EstimationDistance> => {
      validateUserAuthentication(context);
      return upsertEstimationDistance(args);
    },
    upsertEstimationNombre: async (_source, args, context): Promise<EstimationNombre> => {
      validateUserAuthentication(context);
      return upsertEstimationNombre(args);
    },
    upsertInventaire: async (_source, args, context): Promise<{
      failureReason?: UpsertInventaireFailureReason,
      inventaire?: InventaireWithRelations
    }> => {
      validateUserAuthentication(context);
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
    upsertLieuDit: async (_source, args, context): Promise<LieuDitWithCoordinatesAsNumber> => {
      validateUserAuthentication(context);
      return upsertLieuDit(args);
    },
    upsertMeteo: async (_source, args, context): Promise<Meteo> => {
      validateUserAuthentication(context);
      return upsertMeteo(args);
    },
    upsertMilieu: async (_source, args, context): Promise<Milieu> => {
      validateUserAuthentication(context);
      return upsertMilieu(args);
    },
    upsertObservateur: async (_source, args, context): Promise<Observateur> => {
      validateUserAuthentication(context);
      return upsertObservateur(args);
    },
    upsertSexe: async (_source, args, context): Promise<Sexe> => {
      validateUserAuthentication(context);
      return upsertSexe(args);
    },
    updateSettings: async (_source, { appConfiguration }, context): Promise<Settings> => {
      validateUserAuthentication(context);
      // TODO check to update own user settings
      return persistUserSettings(appConfiguration);
    },
    initializeDatabase: async (): Promise<boolean> => {
      await seedDatabase();
      return true;
    },
    resetDatabase: async (_source, args, context): Promise<boolean> => {
      validateUserAuthentication(context);
      if (context?.role !== DatabaseRole.admin) {
        throw new ForbiddenError("Database reset is not allowed for the current user")
      }
      await resetDatabase();
      return true;
    },
    updateDatabase: async (_source, args, context): Promise<boolean> => {
      validateUserAuthentication(context);
      if (context?.role !== DatabaseRole.admin) {
        throw new ForbiddenError("Database update is not allowed for the current user")
      }
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