import { type Commune as CommuneEntity, type Espece as EspeceEntity } from "@prisma/client";
import mercurius, { type IResolvers } from "mercurius";
import { saveDatabaseRequest } from "../services/database/save-database";
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
  findPaginatedComportements,
  getComportementsCount,
  getDonneesCountByComportement,
  upsertComportement,
} from "../services/entities/comportement-service";
import {
  countSpecimensByAgeForEspeceId,
  countSpecimensBySexeForEspeceId,
  deleteDonnee,
  findDonnee,
  findDonneeNavigationData,
  findLastDonneeId,
  findNextRegroupement,
  findPaginatedDonneesByCriteria,
  getNbDonneesByCriteria,
  upsertDonnee,
  type DonneeWithRelations,
} from "../services/entities/donnee-service";
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
  upsertInventaire,
  type InventaireWithRelations,
} from "../services/entities/inventaire-service";
import {
  deleteLieuDit,
  findLieuDit,
  findLieuDitOfInventaireId,
  findPaginatedLieuxDits,
  getDonneesCountByLieuDit,
  getLieuxDitsCount,
  upsertLieuDit,
  type LieuDitWithCoordinatesAsNumber,
} from "../services/entities/lieu-dit-service";
import {
  deleteMeteo,
  findMeteo,
  findPaginatedMeteos,
  getDonneesCountByMeteo,
  getMeteosCount,
  upsertMeteo,
} from "../services/entities/meteo-service";
import {
  deleteMilieu,
  findMilieu,
  findPaginatedMilieux,
  getDonneesCountByMilieu,
  getMilieuxCount,
  upsertMilieu,
} from "../services/entities/milieu-service";
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
import { type Services } from "../services/services";
import { type User } from "../types/User";
import { logger } from "../utils/logger";
import {
  type Age,
  type AgesPaginatedResult,
  type AgeWithSpecimensCount,
  type Classe,
  type ClassesPaginatedResult,
  type Commune,
  type CommunesPaginatedResult,
  type Comportement,
  type ComportementsPaginatedResult,
  type Departement,
  type DepartementsPaginatedResult,
  type Donnee,
  type DonneeNavigationData,
  type Espece,
  type EstimationDistance,
  type EstimationNombre,
  type EstimationsDistancePaginatedResult,
  type EstimationsNombrePaginatedResult,
  type ImportStatus,
  type Inventaire,
  type LieuDit,
  type LieuxDitsPaginatedResult,
  type Meteo,
  type MeteosPaginatedResult,
  type Milieu,
  type MilieuxPaginatedResult,
  type Observateur,
  type ObservateursPaginatedResult,
  type Settings,
  type Sexe,
  type SexesPaginatedResult,
  type SexeWithSpecimensCount,
  type UpsertInventaireFailureReason,
  type UserInfo,
} from "./generated/graphql-types";
import { entityNbDonneesResolver, isEntityEditableResolver } from "./resolvers-helper";

/**
 * @deprecated authent/authorization should be done at service level
 */
const USER_NOT_AUTHENTICATED = "User is not authenticated.";

export const buildResolvers = ({
  ageService,
  classeService,
  departementService,
  especeService,
  observateurService,
  sexeService,
  settingsService,
  tokenService,
  userService,
}: Services): IResolvers => {
  return {
    Query: {
      age: async (_source, args, { user }): Promise<Age | null> => {
        return ageService.findAge(args.id, user);
      },
      ages: async (_, args, { user }): Promise<AgesPaginatedResult> => {
        const [data, count] = await Promise.all([
          ageService.findPaginatedAges(user, args),
          ageService.getAgesCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      classe: async (_source, args, { user }): Promise<Classe | null> => {
        return classeService.findClasse(args.id, user);
      },
      classes: async (_, args, { user }): Promise<ClassesPaginatedResult> => {
        const [data, count] = await Promise.all([
          classeService.findPaginatedClasses(user, args),
          classeService.getClassesCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      commune: async (_source, args, { user }): Promise<Omit<Commune, "departement"> | null> => {
        return findCommune(args.id, user);
      },
      communes: async (
        _,
        args,
        { user }
      ): Promise<Omit<CommunesPaginatedResult, "data"> & { data?: Omit<Commune, "departement">[] }> => {
        const [data, count] = await Promise.all([
          findPaginatedCommunes(user, args),
          getCommunesCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      comportement: async (_source, args, { user }): Promise<Comportement | null> => {
        return findComportement(args.id, user);
      },
      comportements: async (_, args, { user }): Promise<ComportementsPaginatedResult> => {
        const [data, count] = await Promise.all([
          findPaginatedComportements(user, args),
          getComportementsCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      departement: async (_source, args, { user }): Promise<Departement | null> => {
        return departementService.findDepartement(args.id, user);
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
      donnee: (_source, args, { user }): { id: number } => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return {
          id: args.id,
        };
      },
      espece: async (_source, args, { user }): Promise<Omit<Espece, "classe"> | null> => {
        return especeService.findEspece(args.id, user);
      },
      especes: async (_, args, { user }): Promise<{ data: EspeceEntity[]; count: number }> => {
        const [data, count] = await Promise.all([
          especeService.findPaginatedEspeces(user, args, null),
          especeService.getEspecesCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      estimationDistance: async (_source, args, { user }): Promise<EstimationDistance | null> => {
        return findEstimationDistance(args.id, user);
      },
      estimationsDistance: async (_, args, { user }): Promise<EstimationsDistancePaginatedResult> => {
        const [data, count] = await Promise.all([
          findPaginatedEstimationsDistance(user, args),
          getEstimationsDistanceCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      estimationNombre: async (_source, args, { user }): Promise<EstimationNombre | null> => {
        return findEstimationNombre(args.id, user);
      },
      estimationsNombre: async (_, args, { user }): Promise<EstimationsNombrePaginatedResult> => {
        const [data, count] = await Promise.all([
          findPaginatedEstimationsNombre(user, args),
          getEstimationsNombreCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      inventaire: async (_source, args, { user }): Promise<Omit<Inventaire, "lieuDit"> | null> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return findInventaire(args.id);
      },
      lieuDit: async (_source, args, { user }): Promise<Omit<LieuDit, "commune"> | null> => {
        return findLieuDit(args.id, user);
      },
      lieuxDits: async (
        _,
        args,
        { user }
      ): Promise<Omit<LieuxDitsPaginatedResult, "data"> & { data?: Omit<LieuDit, "commune">[] }> => {
        const [data, count] = await Promise.all([
          findPaginatedLieuxDits(user, args),
          getLieuxDitsCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      meteo: async (_source, args, { user }): Promise<Meteo | null> => {
        return findMeteo(args.id, user);
      },
      meteos: async (_, args, { user }): Promise<MeteosPaginatedResult> => {
        const [data, count] = await Promise.all([
          findPaginatedMeteos(user, args),
          getMeteosCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      milieu: async (_source, args, { user }): Promise<Milieu | null> => {
        return findMilieu(args.id, user);
      },
      milieux: async (_, args, { user }): Promise<MilieuxPaginatedResult> => {
        const [data, count] = await Promise.all([
          findPaginatedMilieux(user, args),
          getMilieuxCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
      },
      observateur: async (_source, args, { user }): Promise<Observateur | null> => {
        return observateurService.findObservateur(args.id, user);
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
      sexe: async (_source, args, { user }): Promise<Sexe | null> => {
        return sexeService.findSexe(args.id, user);
      },
      sexes: async (_, args, { user }): Promise<SexesPaginatedResult> => {
        const [data, count] = await Promise.all([
          sexeService.findPaginatedSexes(user, args),
          sexeService.getSexesCount(user, args?.searchParams?.q),
        ]);
        return {
          data,
          count,
        };
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
      searchEspeces: async (_, args, { user }): Promise<{ data: EspeceEntity[]; count: number }> => {
        const { searchCriteria, ...rest } = args ?? {};
        const [data, count] = await Promise.all([
          especeService.findPaginatedEspeces(user, rest, searchCriteria),
          especeService.getEspecesCount(user, null, searchCriteria),
        ]);
        return {
          data,
          count,
        };
      },
      searchDonnees: (_source, _args, { user }): Record<string, never> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return {};
      },
      importStatus: async (_source, args, { user }): Promise<ImportStatus | null> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return getImportStatus(args.importId, user);
      },
      exportAges: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateAgesExport(ageService);
      },
      exportClasses: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateClassesExport(classeService);
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
        return generateDepartementsExport(departementService);
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
        return generateEspecesExport(especeService);
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
        return generateObservateursExport(observateurService);
      },
      exportSexes: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateSexesExport(sexeService);
      },
      dumpDatabase: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
        if (user.role !== "admin") {
          throw new mercurius.ErrorWithProps("Database dump is not allowed for the current user");
        }
        return saveDatabaseRequest();
      },
      settings: async (_source, args, { user }): Promise<Settings | null> => {
        return settingsService.findAppConfiguration(user);
      },
    },
    Mutation: {
      deleteAge: async (_source, args, { user }): Promise<number> => {
        return ageService.deleteAge(args.id, user).then(({ id }) => id);
      },
      deleteClasse: async (_source, args, { user }): Promise<number> => {
        return classeService.deleteClasse(args.id, user).then(({ id }) => id);
      },
      deleteCommune: async (_source, args, { user }): Promise<number> => {
        return deleteCommune(args.id, user).then(({ id }) => id);
      },
      deleteComportement: async (_source, args, { user }): Promise<number> => {
        return deleteComportement(args.id, user).then(({ id }) => id);
      },
      deleteDepartement: async (_source, args, { user }): Promise<number> => {
        return departementService.deleteDepartement(args.id, user).then(({ id }) => id);
      },
      deleteDonnee: async (_source, args, { user }): Promise<number> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return deleteDonnee(args.id).then(({ id }) => id);
      },
      deleteEspece: async (_source, args, { user }): Promise<number> => {
        return especeService.deleteEspece(args.id, user).then(({ id }) => id);
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
        return observateurService.deleteObservateur(args.id, user).then(({ id }) => id);
      },
      deleteSexe: async (_source, args, { user }): Promise<number> => {
        return sexeService.deleteSexe(args.id, user).then(({ id }) => id);
      },
      upsertAge: async (_source, args, { user }): Promise<Age> => {
        return ageService.upsertAge(args, user);
      },
      upsertClasse: async (_source, args, { user }): Promise<Classe> => {
        return classeService.upsertClasse(args, user);
      },
      upsertCommune: async (_source, args, { user }): Promise<CommuneEntity> => {
        return upsertCommune(args, user);
      },
      upsertComportement: async (_source, args, { user }): Promise<Comportement> => {
        return upsertComportement(args, user);
      },
      upsertDepartement: async (_source, args, { user }): Promise<Departement> => {
        return departementService.upsertDepartement(args, user);
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
        return especeService.upsertEspece(args, user);
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
        return observateurService.upsertObservateur(args, user);
      },
      upsertSexe: async (_source, args, { user }): Promise<Sexe> => {
        return sexeService.upsertSexe(args, user);
      },
      updateSettings: async (_source, { appConfiguration }, { user }): Promise<Settings> => {
        return settingsService.persistUserSettings(appConfiguration, user);
      },
      userSignup: async (_source, args, { user }): Promise<User> => {
        return userService.createUser(args.signupData, "admin", user);
      },
      userLogin: async (_source, args, { reply }): Promise<User> => {
        const userInfo = await userService.loginUser(args.loginData);

        if (userInfo) {
          await tokenService.createAndAddSignedTokenAsCookie(reply, userInfo);

          logger.debug(`User ${userInfo?.username} logged in`);

          return userInfo;
        }

        throw new mercurius.ErrorWithProps("Authentication failed");
      },
      userRefresh: async (_source, args, { user, reply }): Promise<UserInfo | null> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);

        const userInfo = await userService.getUser(user.id);
        if (userInfo) {
          await tokenService.createAndAddSignedTokenAsCookie(reply, userInfo);
          return userInfo;
        }

        return null;
      },
      userLogout: async (_source, args, { user, reply }): Promise<boolean> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);
        await tokenService.deleteTokenCookie(reply);

        logger.debug(`User ${user.name} ( ID ${user.id} )logged out`);

        return true;
      },
      userEdit: async (_source, args, { user, reply }): Promise<User> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);

        try {
          const updatedUser = await userService.updateUser(args.id, args.editUserData, user);

          if (updatedUser?.id === user?.id) {
            await tokenService.createAndAddSignedTokenAsCookie(reply, updatedUser);
          }
          return updatedUser;
        } catch (e) {
          throw new mercurius.ErrorWithProps("User modification is only allowed from the user itself");
        }
      },
      userDelete: async (_source, args, { user, reply }): Promise<boolean> => {
        if (!user) throw new mercurius.ErrorWithProps(USER_NOT_AUTHENTICATED);

        try {
          const isUserDeleted = await userService.deleteUser(args.id, user);

          if (args?.id === user?.id && isUserDeleted) {
            await tokenService.deleteTokenCookie(reply);
          }

          return isUserDeleted;
        } catch (e) {
          throw new mercurius.ErrorWithProps("User deletion request failed");
        }
      },
    },
    Age: {
      editable: isEntityEditableResolver(ageService.findAge),
      nbDonnees: entityNbDonneesResolver(ageService.getDonneesCountByAge),
    },
    Classe: {
      editable: isEntityEditableResolver(classeService.findClasse),
      nbEspeces: async (parent, args, { user }): Promise<number | null> => {
        if (!parent?.id) {
          return null;
        }
        return classeService.getEspecesCountByClasse(parent.id, user);
      },
      nbDonnees: entityNbDonneesResolver(classeService.getDonneesCountByClasse),
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
        return departementService.findDepartementOfCommuneId(parent?.id, user);
      },
    },
    Comportement: {
      editable: isEntityEditableResolver(findComportement),
      nbDonnees: entityNbDonneesResolver(getDonneesCountByComportement),
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
      espece: async (parent, args, { user }): Promise<Omit<Espece, "classe"> | null> => {
        const espece = await especeService.findEspeceOfDonneeId(parent?.id, user);
        if (!espece) {
          return null;
        }
        return especeService.findEspece(espece?.id, user);
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
      editable: isEntityEditableResolver(especeService.findEspece),
      classe: async (parent, args, { user }): Promise<Classe | null> => {
        return classeService.findClasseOfEspeceId(parent?.id, user);
      },
      nbDonnees: entityNbDonneesResolver(especeService.getDonneesCountByEspece),
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
      editable: isEntityEditableResolver(observateurService.findObservateur),
      nbDonnees: entityNbDonneesResolver(observateurService.getDonneesCountByObservateur),
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
      editable: isEntityEditableResolver(sexeService.findSexe),
      nbDonnees: entityNbDonneesResolver(sexeService.getDonneesCountBySexe),
    },
  };
};
