import mercurius, { type IResolvers } from "mercurius";
import { type Donnee as DonneeEntity } from "../repositories/donnee/donnee-repository-types.js";
import { type Inventaire as InventaireEntity } from "../repositories/inventaire/inventaire-repository-types.js";
import { type Lieudit } from "../repositories/lieudit/lieudit-repository-types.js";
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
} from "../services/export-entites.js";
import { getImportStatus } from "../services/import-manager.js";
import { type Services } from "../services/services.js";
import { type User } from "../types/User.js";
import {
  type Age,
  type AgeWithSpecimensCount,
  type AgesPaginatedResult,
  type Classe,
  type ClassesPaginatedResult,
  type Commune,
  type CommunesPaginatedResult,
  type Comportement,
  type ComportementsPaginatedResult,
  type Departement,
  type DepartementsPaginatedResult,
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
  type SexeWithSpecimensCount,
  type SexesPaginatedResult,
  type UpsertInventaireFailureReason,
} from "./generated/graphql-types.js";
import { entityNbDonneesResolver, isEntityEditableResolver } from "./resolvers-helper.js";

/**
 * @deprecated authent/authorization should be done at service level
 */
const USER_NOT_AUTHENTICATED = "User is not authenticated.";

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
  settingsService,
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
        return communeService.findCommune(args.id, user);
      },
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
      comportement: async (_source, args, { user }): Promise<Comportement | null> => {
        return comportementService.findComportement(args.id, user);
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
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return {
          id: args.id,
        };
      },
      espece: async (_source, args, { user }): Promise<Omit<Espece, "classe"> | null> => {
        return especeService.findEspece(args.id, user);
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
      estimationDistance: async (_source, args, { user }): Promise<EstimationDistance | null> => {
        return estimationDistanceService.findEstimationDistance(args.id, user);
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
      estimationNombre: async (_source, args, { user }): Promise<EstimationNombre | null> => {
        return estimationNombreService.findEstimationNombre(args.id, user);
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
      inventaire: async (
        _source,
        args,
        { user }
      ): Promise<Omit<Inventaire, "observateur" | "associes" | "lieuDit" | "meteos"> | null> => {
        return inventaireService.findInventaire(args.id, user);
      },
      lieuDit: async (_source, args, { user }): Promise<Omit<LieuDit, "commune"> | null> => {
        return lieuditService.findLieuDit(args.id, user);
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
      meteo: async (_source, args, { user }): Promise<Meteo | null> => {
        return meteoService.findMeteo(args.id, user);
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
      milieu: async (_source, args, { user }): Promise<Milieu | null> => {
        return milieuService.findMilieu(args.id, user);
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
        return ageService.getAgesWithNbSpecimensForEspeceId(args.especeId, user);
      },
      specimenCountBySexe: (_source, args, { user }): Promise<SexeWithSpecimensCount[]> => {
        return sexeService.getSexesWithNbSpecimensForEspeceId(args.especeId, user);
      },
      lastDonneeId: async (_source, args, { user }): Promise<number | null> => {
        return donneeService.findLastDonneeId(user);
      },
      nextRegroupement: async (_source, args, { user }): Promise<number> => {
        return donneeService.findNextRegroupement(user);
      },
      searchDonnees: (): Record<string, never> => {
        return {};
      },
      importStatus: async (_source, args, { user }): Promise<ImportStatus | null> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return getImportStatus(args.importId, user);
      },
      exportAges: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateAgesExport(ageService);
      },
      exportClasses: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateClassesExport(classeService);
      },
      exportCommunes: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateCommunesExport(communeService);
      },
      exportComportements: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateComportementsExport(comportementService);
      },
      exportDepartements: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateDepartementsExport(departementService);
      },
      exportEstimationsDistance: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateEstimationsDistanceExport(estimationDistanceService);
      },
      exportEstimationsNombre: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateEstimationsNombreExport(estimationNombreService);
      },
      exportDonnees: async (_source, args, { user }): Promise<string> => {
        return generateDonneesExport(
          {
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
          },
          user,
          args?.searchCriteria
        );
      },
      exportEspeces: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateEspecesExport(especeService);
      },
      exportLieuxDits: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateLieuxDitsExport(lieuditService);
      },
      exportMeteos: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateMeteosExport(meteoService);
      },
      exportMilieux: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateMilieuxExport(milieuService);
      },
      exportObservateurs: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateObservateursExport(observateurService);
      },
      exportSexes: async (_source, args, { user }): Promise<string> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);
        return generateSexesExport(sexeService);
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
        return communeService.deleteCommune(args.id, user).then(({ id }) => id);
      },
      deleteComportement: async (_source, args, { user }): Promise<number> => {
        return comportementService.deleteComportement(args.id, user).then(({ id }) => id);
      },
      deleteDepartement: async (_source, args, { user }): Promise<number> => {
        return departementService.deleteDepartement(args.id, user).then(({ id }) => id);
      },
      deleteDonnee: async (_source, args, { user }): Promise<number> => {
        return donneeService.deleteDonnee(args.id, user).then(({ id }) => id);
      },
      deleteEspece: async (_source, args, { user }): Promise<number> => {
        return especeService.deleteEspece(args.id, user).then(({ id }) => id);
      },
      deleteEstimationDistance: async (_source, args, { user }): Promise<number> => {
        return estimationDistanceService.deleteEstimationDistance(args.id, user).then(({ id }) => id);
      },
      deleteEstimationNombre: async (_source, args, { user }): Promise<number> => {
        return estimationNombreService.deleteEstimationNombre(args.id, user).then(({ id }) => id);
      },
      deleteLieuDit: async (_source, args, { user }): Promise<number> => {
        return lieuditService.deleteLieuDit(args.id, user).then(({ id }) => id);
      },
      deleteMeteo: async (_source, args, { user }): Promise<number> => {
        return meteoService.deleteMeteo(args.id, user).then(({ id }) => id);
      },
      deleteMilieu: async (_source, args, { user }): Promise<number> => {
        return milieuService.deleteMilieu(args.id, user).then(({ id }) => id);
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
      upsertCommune: async (_source, args, { user }): Promise<Omit<Commune, "departement">> => {
        return communeService.upsertCommune(args, user);
      },
      upsertComportement: async (_source, args, { user }): Promise<Comportement> => {
        return comportementService.upsertComportement(args, user);
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
        donnee?: DonneeEntity;
      }> => {
        try {
          const upsertedDonnee = await donneeService.upsertDonnee(args, user);
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
      upsertEspece: async (_source, args, { user }): Promise<Omit<Espece, "classe">> => {
        return especeService.upsertEspece(args, user);
      },
      upsertEstimationDistance: async (_source, args, { user }): Promise<EstimationDistance> => {
        return estimationDistanceService.upsertEstimationDistance(args, user);
      },
      upsertEstimationNombre: async (_source, args, { user }): Promise<EstimationNombre> => {
        return estimationNombreService.upsertEstimationNombre(args, user);
      },
      upsertInventaire: async (
        _source,
        args,
        { user }
      ): Promise<{
        failureReason?: UpsertInventaireFailureReason;
        inventaire?: InventaireEntity;
      }> => {
        try {
          const upsertedInventaire = await inventaireService.upsertInventaire(args, user);
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
      upsertLieuDit: async (_source, args, { user }): Promise<Lieudit> => {
        return lieuditService.upsertLieuDit(args, user);
      },
      upsertMeteo: async (_source, args, { user }): Promise<Meteo> => {
        return meteoService.upsertMeteo(args, user);
      },
      upsertMilieu: async (_source, args, { user }): Promise<Milieu> => {
        return milieuService.upsertMilieu(args, user);
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
      userDelete: async (_source, args, { user }): Promise<boolean> => {
        if (!user) throw new mercurius.default.ErrorWithProps(USER_NOT_AUTHENTICATED);

        try {
          const isUserDeleted = await userService.deleteUser(args.id, user);

          return isUserDeleted;
        } catch (e) {
          throw new mercurius.default.ErrorWithProps("User deletion request failed");
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
        return ageService.findAgeOfDonneeId(parent?.id, user);
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
        return sexeService.findSexeOfDonneeId(parent?.id, user);
      },
    },
    DonneeResult: {
      donnee: async (parent, args, { user }): Promise<DonneeEntity | null> => {
        if (!parent?.id) {
          return null;
        }
        return donneeService.findDonnee(parent.id, user);
      },
      navigation: async (parent, args, { user }): Promise<DonneeNavigationData> => {
        return donneeService.findDonneeNavigationData(user, parent?.id);
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
    Sexe: {
      editable: isEntityEditableResolver(sexeService.findSexe),
      nbDonnees: entityNbDonneesResolver(sexeService.getDonneesCountBySexe),
    },
    Settings: {
      defaultObservateur: async (parent, args, { user }): Promise<Observateur | null> => {
        if (parent?.defaultObservateurId) {
          return observateurService.findObservateur(parent.defaultObservateurId, user);
        } else {
          return null;
        }
      },
      defaultDepartement: async (parent, args, { user }): Promise<Departement | null> => {
        if (parent?.defaultDepartementId) {
          return departementService.findDepartement(parent.defaultDepartementId, user);
        } else {
          return null;
        }
      },
    },
  };
};
