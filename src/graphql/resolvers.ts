import { Commune as CommuneEntity, DatabaseRole, Espece as EspeceEntity } from "@prisma/client";
import mercurius, { IResolvers } from "mercurius";
import { resetDatabase } from "../services/database/reset-database";
import { saveDatabaseRequest } from "../services/database/save-database";
import {
  deleteAge,
  findAge,
  findPaginatedAges,
  getAgesCount,
  getDonneesCountByAge,
  upsertAge,
} from "../services/entities/age-service";
import {
  deleteClasse,
  findClasse,
  findClasseOfEspeceId,
  findPaginatedClasses,
  getClassesCount,
  getDonneesCountByClasse,
  getEspecesCountByClasse,
  upsertClasse,
} from "../services/entities/classe-service";
import {
  deleteCommune,
  findCommune,
  findCommuneOfLieuDitId,
  findPaginatedCommunes,
  getCommunesCount,
  getDonneesCountByCommune,
  getLieuxDitsCountByCommune,
  upsertCommune,
} from "../services/entities/commune-service";
import {
  deleteComportement,
  findComportement,
  findComportementsByIds,
  findPaginatedComportements,
  getComportementsCount,
  getDonneesCountByComportement,
  upsertComportement,
} from "../services/entities/comportement-service";
import { findAppConfiguration, persistUserSettings } from "../services/entities/configuration-service";
import {
  deleteDepartement,
  findDepartement,
  findDepartementOfCommuneId,
  findPaginatedDepartements,
  getCommunesCountByDepartement,
  getDepartementsCount,
  getDonneesCountByDepartement,
  getLieuxDitsCountByDepartement,
  upsertDepartement,
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
  getNbDonneesByCriteria,
  upsertDonnee,
} from "../services/entities/donnee-service";
import {
  deleteEspece,
  findEspece,
  findEspeceOfDonneeId,
  findPaginatedEspeces,
  getDonneesCountByEspece,
  getEspecesCount,
  upsertEspece,
} from "../services/entities/espece-service";
import {
  deleteEstimationDistance,
  findEstimationDistance,
  findPaginatedEstimationsDistance,
  getDonneesCountByEstimationDistance,
  getEstimationsDistanceCount,
  upsertEstimationDistance,
} from "../services/entities/estimation-distance-service";
import {
  deleteEstimationNombre,
  findEstimationNombre,
  findPaginatedEstimationsNombre,
  getDonneesCountByEstimationNombre,
  getEstimationsNombreCount,
  upsertEstimationNombre,
} from "../services/entities/estimation-nombre-service";
import {
  findInventaire,
  findInventaireOfDonneeId,
  InventaireWithRelations,
  upsertInventaire,
} from "../services/entities/inventaire-service";
import {
  deleteLieuDit,
  findLieuDit,
  findLieuDitOfInventaireId,
  findPaginatedLieuxDits,
  getDonneesCountByLieuDit,
  getLieuxDitsCount,
  LieuDitWithCoordinatesAsNumber,
  upsertLieuDit,
} from "../services/entities/lieu-dit-service";
import {
  deleteMeteo,
  findMeteo,
  findMeteosByIds,
  findPaginatedMeteos,
  getDonneesCountByMeteo,
  getMeteosCount,
  upsertMeteo,
} from "../services/entities/meteo-service";
import {
  deleteMilieu,
  findMilieu,
  findMilieuxByIds,
  findPaginatedMilieux,
  getDonneesCountByMilieu,
  getMilieuxCount,
  upsertMilieu,
} from "../services/entities/milieu-service";
import {
  deleteObservateur,
  findObservateur,
  findObservateursByIds,
  findPaginatedObservateurs,
  getDonneesCountByObservateur,
  getObservateursCount,
  upsertObservateur,
} from "../services/entities/observateur-service";
import {
  deleteSexe,
  findPaginatedSexes,
  findSexe,
  getDonneesCountBySexe,
  getSexesCount,
  upsertSexe,
} from "../services/entities/sexe-service";
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
  generateSexesExport,
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
  UserInfo,
} from "./generated/graphql-types";
import { entityNbDonneesResolver, isEntityEditableResolver } from "./resolvers-helper";

const USER_NOT_AUTHENTICATED = "User is not authenticated.";

declare module "mercurius" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface IResolvers extends Resolvers<import("mercurius").MercuriusContext> {}
}

const resolvers: IResolvers = {
  Query: {
    age: async (_source, args, { user }): Promise<Age | null> => {
      return findAge(args.id, user);
    },
    ages: async (_, args, { user }): Promise<AgesPaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedAges(user, args),
        getAgesCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    classe: async (_source, args, { user }): Promise<Classe | null> => {
      return findClasse(args.id, user);
    },
    commune: async (_source, args, { user }): Promise<Omit<Commune, "departement"> | null> => {
      return findCommune(args.id, user);
    },
    comportement: async (_source, args, { user }): Promise<Comportement | null> => {
      return findComportement(args.id, user);
    },
    comportementList: async (_source, args, { user }): Promise<Comportement[]> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return findComportementsByIds(args.ids, user);
    },
    departement: async (_source, args, { user }): Promise<Departement | null> => {
      return findDepartement(args.id, user);
    },
    donnee: (_source, args, { user }): { id: number } => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return {
        id: args.id,
      };
    },
    espece: async (_source, args, { user }): Promise<Omit<Espece, "classe"> | null> => {
      return findEspece(args.id, user);
    },
    estimationDistance: async (_source, args, { user }): Promise<EstimationDistance | null> => {
      return findEstimationDistance(args.id, user);
    },
    estimationNombre: async (_source, args, { user }): Promise<EstimationNombre | null> => {
      return findEstimationNombre(args.id, user);
    },
    inventaire: async (_source, args, { user }): Promise<Omit<Inventaire, "lieuDit"> | null> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return findInventaire(args.id);
    },
    lieuDit: async (_source, args, { user }): Promise<Omit<LieuDit, "commune"> | null> => {
      return findLieuDit(args.id, user);
    },
    meteo: async (_source, args, { user }): Promise<Meteo | null> => {
      return findMeteo(args.id, user);
    },
    meteoList: async (_source, args, { user }): Promise<Meteo[]> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return findMeteosByIds(args.ids, user);
    },
    milieu: async (_source, args, { user }): Promise<Milieu | null> => {
      return findMilieu(args.id, user);
    },
    milieuList: async (_source, args, { user }): Promise<Milieu[]> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return findMilieuxByIds(args.ids, user);
    },
    observateur: async (_source, args, { user }): Promise<Observateur | null> => {
      return findObservateur(args.id, user);
    },
    observateurList: async (_source, args, { user }): Promise<Observateur[]> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return findObservateursByIds(args.ids, user);
    },
    observateurs: async (_, args, { user }): Promise<ObservateursPaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedObservateurs(user, args),
        getObservateursCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    sexe: async (_source, args, { user }): Promise<Sexe | null> => {
      return findSexe(args.id, user);
    },
    specimenCountByAge: (_source, args, { user }): Promise<AgeWithSpecimensCount[]> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return countSpecimensByAgeForEspeceId(args?.especeId);
    },
    specimenCountBySexe: (_source, args, { user }): Promise<SexeWithSpecimensCount[]> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return countSpecimensBySexeForEspeceId(args?.especeId);
    },
    lastDonneeId: async (_source, args, { user }): Promise<number | null> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return findLastDonneeId();
    },
    nextRegroupement: async (_source, args, { user }): Promise<number> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return findNextRegroupement();
    },
    paginatedClasses: async (_source, args, { user }): Promise<ClassesPaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedClasses(user, args),
        getClassesCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedCommunes: async (
      _source,
      args,
      { user }
    ): Promise<Omit<CommunesPaginatedResult, "result"> & { result?: Omit<Commune, "departement">[] }> => {
      const [result, count] = await Promise.all([
        findPaginatedCommunes(user, args),
        getCommunesCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedComportements: async (_source, args, { user }): Promise<ComportementsPaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedComportements(user, args),
        getComportementsCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedDepartements: async (_source, args, { user }): Promise<DepartementsPaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedDepartements(user, args),
        getDepartementsCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedEspeces: async (_source, args, { user }): Promise<{ result: EspeceEntity[]; count: number }> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      const [result, count] = await Promise.all([
        findPaginatedEspeces(user, args, null),
        getEspecesCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedEstimationsDistance: async (_source, args, { user }): Promise<EstimationsDistancePaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedEstimationsDistance(user, args),
        getEstimationsDistanceCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedEstimationsNombre: async (_source, args, { user }): Promise<EstimationsNombrePaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedEstimationsNombre(user, args),
        getEstimationsNombreCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedLieuxdits: async (_source, args, { user }): Promise<LieuxDitsPaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedLieuxDits(user, args),
        getLieuxDitsCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedMeteos: async (_source, args, { user }): Promise<MeteosPaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedMeteos(user, args),
        getMeteosCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedMilieux: async (_source, args, { user }): Promise<MilieuxPaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedMilieux(user, args),
        getMilieuxCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedSexes: async (_source, args, { user }): Promise<SexesPaginatedResult> => {
      const [result, count] = await Promise.all([
        findPaginatedSexes(user, args),
        getSexesCount(user, args?.searchParams?.q),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedSearchEspeces: async (_source, args, { user }): Promise<{ result: EspeceEntity[]; count: number }> => {
      const { searchCriteria, ...rest } = args ?? {};
      const [result, count] = await Promise.all([
        findPaginatedEspeces(user, rest, searchCriteria),
        getEspecesCount(user, null, searchCriteria),
      ]);
      return {
        result,
        count,
      };
    },
    paginatedSearchDonnees: (_source, _args, { user }): Record<string, never> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return {};
    },
    importStatus: async (_source, args, { user }): Promise<ImportStatus | null> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return getImportStatus(args.importId, user);
    },
    exportAges: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateAgesExport();
    },
    exportClasses: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateClassesExport();
    },
    exportCommunes: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateCommunesExport();
    },
    exportComportements: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateComportementsExport();
    },
    exportDepartements: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateDepartementsExport();
    },
    exportEstimationsDistance: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateEstimationsDistanceExport();
    },
    exportEstimationsNombre: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateEstimationsNombreExport();
    },
    exportDonnees: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateDonneesExport(args?.searchCriteria);
    },
    exportEspeces: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateEspecesExport();
    },
    exportLieuxDits: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateLieuxDitsExport();
    },
    exportMeteos: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateMeteosExport();
    },
    exportMilieux: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateMilieuxExport();
    },
    exportObservateurs: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateObservateursExport();
    },
    exportSexes: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return generateSexesExport();
    },
    dumpDatabase: async (_source, args, { user }): Promise<string> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      if (user.role !== DatabaseRole.admin) {
        throw new mercurius.ErrorWithProps("Database dump is not allowed for the current user");
      }
      return saveDatabaseRequest();
    },
    settings: async (_source, args, { user }): Promise<Settings | null> => {
      return findAppConfiguration(user);
    },
  },
  Mutation: {
    deleteAge: async (_source, args, { user }): Promise<number> => {
      return deleteAge(args.id, user).then(({ id }) => id);
    },
    deleteClasse: async (_source, args, { user }): Promise<number> => {
      return deleteClasse(args.id, user).then(({ id }) => id);
    },
    deleteCommune: async (_source, args, { user }): Promise<number> => {
      return deleteCommune(args.id, user).then(({ id }) => id);
    },
    deleteComportement: async (_source, args, { user }): Promise<number> => {
      return deleteComportement(args.id, user).then(({ id }) => id);
    },
    deleteDepartement: async (_source, args, { user }): Promise<number> => {
      return deleteDepartement(args.id, user).then(({ id }) => id);
    },
    deleteDonnee: async (_source, args, { user }): Promise<number> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return deleteDonnee(args.id).then(({ id }) => id);
    },
    deleteEspece: async (_source, args, { user }): Promise<number> => {
      return deleteEspece(args.id, user).then(({ id }) => id);
    },
    deleteEstimationDistance: async (_source, args, { user }): Promise<number> => {
      return deleteEstimationDistance(args.id, user).then(({ id }) => id);
    },
    deleteEstimationNombre: async (_source, args, { user }): Promise<number> => {
      return deleteEstimationNombre(args.id, user).then(({ id }) => id);
    },
    deleteLieuDit: async (_source, args, { user }): Promise<number> => {
      return deleteLieuDit(args.id, user).then(({ id }) => id);
    },
    deleteMeteo: async (_source, args, { user }): Promise<number> => {
      return deleteMeteo(args.id, user).then(({ id }) => id);
    },
    deleteMilieu: async (_source, args, { user }): Promise<number> => {
      return deleteMilieu(args.id, user).then(({ id }) => id);
    },
    deleteObservateur: async (_source, args, { user }): Promise<number> => {
      return deleteObservateur(args.id, user).then(({ id }) => id);
    },
    deleteSexe: async (_source, args, { user }): Promise<number> => {
      return deleteSexe(args.id, user).then(({ id }) => id);
    },
    upsertAge: async (_source, args, { user }): Promise<Age> => {
      return upsertAge(args, user);
    },
    upsertClasse: async (_source, args, { user }): Promise<Classe> => {
      return upsertClasse(args, user);
    },
    upsertCommune: async (_source, args, { user }): Promise<CommuneEntity> => {
      return upsertCommune(args, user);
    },
    upsertComportement: async (_source, args, { user }): Promise<Comportement> => {
      return upsertComportement(args, user);
    },
    upsertDepartement: async (_source, args, { user }): Promise<Departement> => {
      return upsertDepartement(args, user);
    },
    upsertDonnee: async (
      _source,
      args,
      { user }
    ): Promise<{
      failureReason?: string;
      donnee?: DonneeWithRelations;
    }> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      try {
        const upsertedDonnee = await upsertDonnee(args);
        return {
          donnee: upsertedDonnee,
        };
      } catch (error) {
        const failureReason = error as string;
        return {
          failureReason,
        };
      }
    },
    upsertEspece: async (_source, args, { user }): Promise<EspeceEntity> => {
      return upsertEspece(args, user);
    },
    upsertEstimationDistance: async (_source, args, { user }): Promise<EstimationDistance> => {
      return upsertEstimationDistance(args, user);
    },
    upsertEstimationNombre: async (_source, args, { user }): Promise<EstimationNombre> => {
      return upsertEstimationNombre(args, user);
    },
    upsertInventaire: async (
      _source,
      args,
      { user }
    ): Promise<{
      failureReason?: UpsertInventaireFailureReason;
      inventaire?: InventaireWithRelations;
    }> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      try {
        const upsertedInventaire = await upsertInventaire(args, user);
        return {
          inventaire: upsertedInventaire,
        };
      } catch (error) {
        const failureReason = error as UpsertInventaireFailureReason;
        return {
          failureReason,
        };
      }
    },
    upsertLieuDit: async (_source, args, { user }): Promise<LieuDitWithCoordinatesAsNumber> => {
      return upsertLieuDit(args, user);
    },
    upsertMeteo: async (_source, args, { user }): Promise<Meteo> => {
      return upsertMeteo(args, user);
    },
    upsertMilieu: async (_source, args, { user }): Promise<Milieu> => {
      return upsertMilieu(args, user);
    },
    upsertObservateur: async (_source, args, { user }): Promise<Observateur> => {
      return upsertObservateur(args, user);
    },
    upsertSexe: async (_source, args, { user }): Promise<Sexe> => {
      return upsertSexe(args, user);
    },
    updateSettings: async (_source, { appConfiguration }, { user }): Promise<Settings> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      return persistUserSettings(appConfiguration, user);
    },
    resetDatabase: async (_source, args, { user }): Promise<boolean> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      if (user.role !== DatabaseRole.admin) {
        throw new mercurius.ErrorWithProps("Database reset is not allowed for the current user");
      }
      await resetDatabase();
      return true;
    },
    userSignup: async (_source, args, { user }): Promise<UserInfo> => {
      return createUser(args.signupData, DatabaseRole.admin, user);
    },
    userLogin: async (_source, args, { reply }): Promise<UserInfo> => {
      const userInfo = await loginUser(args.loginData);

      if (userInfo) {
        await createAndAddSignedTokenAsCookie(reply, userInfo);

        logger.debug(`User ${userInfo?.username} logged in`);

        return userInfo;
      }

      throw new mercurius.ErrorWithProps("Authentication failed");
    },
    userRefresh: async (_source, args, { user, reply }): Promise<UserInfo | null> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);

      const userInfo = await getUser(user.id);
      if (userInfo) {
        await createAndAddSignedTokenAsCookie(reply, userInfo);
        return userInfo;
      }

      return null;
    },
    userLogout: async (_source, args, { user, reply }): Promise<boolean> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
      await deleteTokenCookie(reply);

      logger.debug(`User ${user.name} ( ID ${user.id} )logged out`);

      return true;
    },
    userEdit: async (_source, args, { user, reply }): Promise<UserInfo> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);

      try {
        const updatedUser = await updateUser(args.id, args.editUserData, user);

        if (updatedUser?.id === user?.id) {
          await createAndAddSignedTokenAsCookie(reply, updatedUser);
        }
        return updatedUser;
      } catch (e) {
        throw new mercurius.ErrorWithProps("User modification is only allowed from the user itself");
      }
    },
    userDelete: async (_source, args, { user, reply }): Promise<boolean> => {
      if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);

      try {
        await deleteUser(args.id, user);
      } catch (e) {
        throw new mercurius.ErrorWithProps("User deletion request failed");
      }

      if (args?.id === user?.id) {
        await deleteTokenCookie(reply);
      }

      return true;
    },
  },
  Age: {
    editable: isEntityEditableResolver(findAge),
    nbDonnees: entityNbDonneesResolver(getDonneesCountByAge),
  },
  Classe: {
    editable: isEntityEditableResolver(findClasse),
    nbEspeces: async (parent, args, { user }): Promise<number | null> => {
      if (!parent?.id) {
        return null;
      }
      return getEspecesCountByClasse(parent.id, user);
    },
    nbDonnees: entityNbDonneesResolver(getDonneesCountByClasse),
  },
  Commune: {
    editable: isEntityEditableResolver(findCommune),
    nbLieuxDits: async (parent, args, { user }): Promise<number | null> => {
      if (!parent?.id) {
        return null;
      }
      return getLieuxDitsCountByCommune(parent.id, user);
    },
    nbDonnees: entityNbDonneesResolver(getDonneesCountByCommune),
    departement: async (parent, args, { user }): Promise<Departement | null> => {
      return findDepartementOfCommuneId(parent?.id, user);
    },
  },
  Comportement: {
    editable: isEntityEditableResolver(findComportement),
    nbDonnees: entityNbDonneesResolver(getDonneesCountByComportement),
  },
  Departement: {
    editable: isEntityEditableResolver(findDepartement),
    nbCommunes: async (parent, args, { user }): Promise<number | null> => {
      if (!parent?.id) {
        return null;
      }
      return getCommunesCountByDepartement(parent.id, user);
    },
    nbLieuxDits: async (parent, args, { user }): Promise<number | null> => {
      if (!parent?.id) {
        return null;
      }
      return getLieuxDitsCountByDepartement(parent.id, user);
    },
    nbDonnees: entityNbDonneesResolver(getDonneesCountByDepartement),
  },
  Donnee: {
    espece: async (parent, args, { user }): Promise<Omit<Espece, "classe"> | null> => {
      const espece = await findEspeceOfDonneeId(parent?.id, user);
      return findEspece(espece?.id, user);
    },
    inventaire: async (parent): Promise<Omit<Inventaire, "lieuDit"> | null> => {
      const inventaire = await findInventaireOfDonneeId(parent?.id);
      return findInventaire(inventaire?.id);
    },
  },
  DonneeResult: {
    donnee: async (parent): Promise<Omit<Donnee, "inventaire" | "espece"> | null> => {
      return findDonnee(parent?.id);
    },
    navigation: async (parent): Promise<DonneeNavigationData> => {
      return findDonneeNavigationData(parent?.id);
    },
  },
  Espece: {
    editable: isEntityEditableResolver(findEspece),
    classe: async (parent, args, { user }): Promise<Classe | null> => {
      return findClasseOfEspeceId(parent?.id, user);
    },
    nbDonnees: entityNbDonneesResolver(getDonneesCountByEspece),
  },
  EstimationDistance: {
    editable: isEntityEditableResolver(findEstimationDistance),
    nbDonnees: entityNbDonneesResolver(getDonneesCountByEstimationDistance),
  },
  EstimationNombre: {
    editable: isEntityEditableResolver(findEstimationNombre),
    nbDonnees: entityNbDonneesResolver(getDonneesCountByEstimationNombre),
  },
  Inventaire: {
    lieuDit: async (parent, args, { user }): Promise<Omit<LieuDit, "commune"> | null> => {
      const lieuDit = await findLieuDitOfInventaireId(parent?.id);
      return findLieuDit(lieuDit?.id, user);
    },
  },
  LieuDit: {
    editable: isEntityEditableResolver(findLieuDit),
    commune: async (parent, args, { user }): Promise<Omit<Commune, "departement"> | null> => {
      return findCommuneOfLieuDitId(parent?.id, user);
    },
    nbDonnees: entityNbDonneesResolver(getDonneesCountByLieuDit),
  },
  Meteo: {
    editable: isEntityEditableResolver(findMeteo),
    nbDonnees: entityNbDonneesResolver(getDonneesCountByMeteo),
  },
  Milieu: {
    editable: isEntityEditableResolver(findMilieu),
    nbDonnees: entityNbDonneesResolver(getDonneesCountByMilieu),
  },
  Observateur: {
    editable: isEntityEditableResolver(findObservateur),
    nbDonnees: entityNbDonneesResolver(getDonneesCountByObservateur),
  },
  PaginatedSearchDonneesResult: {
    result: async (_, args): Promise<Omit<Donnee, "espece" | "inventaire">[]> => {
      return findPaginatedDonneesByCriteria(args);
    },
    count: async (_, { searchCriteria }): Promise<number> => {
      return getNbDonneesByCriteria(searchCriteria);
    },
  },
  Sexe: {
    editable: isEntityEditableResolver(findSexe),
    nbDonnees: entityNbDonneesResolver(getDonneesCountBySexe),
  },
};

export default resolvers;
