import { GraphQLResolveInfo } from 'graphql';
import {PartialDeep} from 'type-fest';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Age = {
  __typename?: 'Age';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  readonly?: Maybe<Scalars['Boolean']>;
};

export type AgeWithSpecimensCount = {
  __typename?: 'AgeWithSpecimensCount';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbSpecimens: Scalars['Int'];
};

export type AgesPaginatedResult = PaginatedResult & {
  __typename?: 'AgesPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Age>>;
};

export type Classe = {
  __typename?: 'Classe';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export type ClasseWithCounts = {
  __typename?: 'ClasseWithCounts';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nbEspeces?: Maybe<Scalars['Int']>;
  readonly?: Maybe<Scalars['Boolean']>;
};

export const ClassesOrderBy = {
  Id: 'id',
  Libelle: 'libelle',
  NbDonnees: 'nbDonnees',
  NbEspeces: 'nbEspeces'
} as const;

export type ClassesOrderBy = typeof ClassesOrderBy[keyof typeof ClassesOrderBy];
export type ClassesPaginatedResult = PaginatedResult & {
  __typename?: 'ClassesPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<ClasseWithCounts>>>;
};

export type Commune = {
  __typename?: 'Commune';
  code: Scalars['Int'];
  departement: Departement;
  id: Scalars['Int'];
  nom: Scalars['String'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export type CommuneWithCounts = {
  __typename?: 'CommuneWithCounts';
  code: Scalars['Int'];
  departement: Departement;
  id: Scalars['Int'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nbLieuxDits?: Maybe<Scalars['Int']>;
  nom: Scalars['String'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export const CommunesOrderBy = {
  Code: 'code',
  Departement: 'departement',
  Id: 'id',
  NbDonnees: 'nbDonnees',
  NbLieuxDits: 'nbLieuxDits',
  Nom: 'nom'
} as const;

export type CommunesOrderBy = typeof CommunesOrderBy[keyof typeof CommunesOrderBy];
export type CommunesPaginatedResult = PaginatedResult & {
  __typename?: 'CommunesPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<CommuneWithCounts>>>;
};

export type Comportement = {
  __typename?: 'Comportement';
  code: Scalars['String'];
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nicheur?: Maybe<Nicheur>;
  readonly?: Maybe<Scalars['Boolean']>;
};

export type ComportementWithCounts = {
  __typename?: 'ComportementWithCounts';
  code: Scalars['String'];
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nicheur?: Maybe<Nicheur>;
  readonly?: Maybe<Scalars['Boolean']>;
};

export const ComportementsOrderBy = {
  Code: 'code',
  Id: 'id',
  Libelle: 'libelle',
  NbDonnees: 'nbDonnees',
  Nicheur: 'nicheur'
} as const;

export type ComportementsOrderBy = typeof ComportementsOrderBy[keyof typeof ComportementsOrderBy];
export type ComportementsPaginatedResult = PaginatedResult & {
  __typename?: 'ComportementsPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<ComportementWithCounts>>>;
};

export type Coordinates = {
  __typename?: 'Coordinates';
  altitude: Scalars['Int'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  system: CoordinatesSystemType;
};

export const CoordinatesSystemType = {
  Gps: 'gps',
  Lambert93: 'lambert93'
} as const;

export type CoordinatesSystemType = typeof CoordinatesSystemType[keyof typeof CoordinatesSystemType];
export type Departement = {
  __typename?: 'Departement';
  code: Scalars['String'];
  id: Scalars['Int'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export type DepartementWithCounts = {
  __typename?: 'DepartementWithCounts';
  code: Scalars['String'];
  id: Scalars['Int'];
  nbCommunes?: Maybe<Scalars['Int']>;
  nbDonnees?: Maybe<Scalars['Int']>;
  nbLieuxDits?: Maybe<Scalars['Int']>;
  readonly?: Maybe<Scalars['Boolean']>;
};

export const DepartementsOrderBy = {
  Code: 'code',
  Id: 'id',
  NbCommunes: 'nbCommunes',
  NbDonnees: 'nbDonnees',
  NbLieuxDits: 'nbLieuxDits'
} as const;

export type DepartementsOrderBy = typeof DepartementsOrderBy[keyof typeof DepartementsOrderBy];
export type DepartementsPaginatedResult = PaginatedResult & {
  __typename?: 'DepartementsPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<DepartementWithCounts>>>;
};

export type Donnee = {
  __typename?: 'Donnee';
  age: Age;
  commentaire?: Maybe<Scalars['String']>;
  comportements: Array<Comportement>;
  distance?: Maybe<Scalars['Int']>;
  espece: Espece;
  estimationDistance?: Maybe<EstimationDistance>;
  estimationNombre: EstimationNombre;
  id: Scalars['Int'];
  inventaire: Inventaire;
  milieux: Array<Milieu>;
  nombre?: Maybe<Scalars['Int']>;
  regroupement?: Maybe<Scalars['Int']>;
  sexe: Sexe;
};

export type DonneeNavigationData = {
  __typename?: 'DonneeNavigationData';
  index: Scalars['Int'];
  nextDonneeId?: Maybe<Scalars['Int']>;
  previousDonneeId?: Maybe<Scalars['Int']>;
};

export type DonneeResult = {
  __typename?: 'DonneeResult';
  donnee?: Maybe<Donnee>;
  id: Scalars['Int'];
  navigation?: Maybe<DonneeNavigationData>;
};

export type EditUserData = {
  currentPassword?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  newPassword?: InputMaybe<Scalars['String']>;
  username?: InputMaybe<Scalars['String']>;
};

export const EntitesAvecLibelleOrderBy = {
  Id: 'id',
  Libelle: 'libelle',
  NbDonnees: 'nbDonnees'
} as const;

export type EntitesAvecLibelleOrderBy = typeof EntitesAvecLibelleOrderBy[keyof typeof EntitesAvecLibelleOrderBy];
export type Espece = {
  __typename?: 'Espece';
  classe: Classe;
  code: Scalars['String'];
  id: Scalars['Int'];
  nomFrancais: Scalars['String'];
  nomLatin: Scalars['String'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export type EspeceWithCounts = {
  __typename?: 'EspeceWithCounts';
  classe?: Maybe<Classe>;
  code: Scalars['String'];
  id: Scalars['Int'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nomFrancais: Scalars['String'];
  nomLatin: Scalars['String'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export const EspecesOrderBy = {
  Code: 'code',
  Id: 'id',
  NbDonnees: 'nbDonnees',
  NomClasse: 'nomClasse',
  NomFrancais: 'nomFrancais',
  NomLatin: 'nomLatin'
} as const;

export type EspecesOrderBy = typeof EspecesOrderBy[keyof typeof EspecesOrderBy];
export type EspecesPaginatedResult = PaginatedResult & {
  __typename?: 'EspecesPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<EspeceWithCounts>>>;
};

export type EstimationDistance = {
  __typename?: 'EstimationDistance';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export type EstimationDistanceWithCounts = {
  __typename?: 'EstimationDistanceWithCounts';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  readonly?: Maybe<Scalars['Boolean']>;
};

export type EstimationNombre = {
  __typename?: 'EstimationNombre';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nonCompte: Scalars['Boolean'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export const EstimationNombreOrderBy = {
  Id: 'id',
  Libelle: 'libelle',
  NbDonnees: 'nbDonnees',
  NonCompte: 'nonCompte'
} as const;

export type EstimationNombreOrderBy = typeof EstimationNombreOrderBy[keyof typeof EstimationNombreOrderBy];
export type EstimationNombreWithCounts = {
  __typename?: 'EstimationNombreWithCounts';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nonCompte: Scalars['Boolean'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export type EstimationsDistancePaginatedResult = PaginatedResult & {
  __typename?: 'EstimationsDistancePaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<EstimationDistanceWithCounts>>>;
};

export type EstimationsNombrePaginatedResult = PaginatedResult & {
  __typename?: 'EstimationsNombrePaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<EstimationNombreWithCounts>>>;
};

export type FindParams = {
  max?: InputMaybe<Scalars['Int']>;
  q?: InputMaybe<Scalars['String']>;
};

export const ImportErrorType = {
  ImportFailure: 'IMPORT_FAILURE',
  ImportProcessError: 'IMPORT_PROCESS_ERROR',
  ImportProcessUnexpectedExit: 'IMPORT_PROCESS_UNEXPECTED_EXIT'
} as const;

export type ImportErrorType = typeof ImportErrorType[keyof typeof ImportErrorType];
export type ImportStatus = {
  __typename?: 'ImportStatus';
  errorDescription?: Maybe<Scalars['String']>;
  errorType?: Maybe<ImportErrorType>;
  importErrorsReportFile?: Maybe<Scalars['String']>;
  ongoingValidationStats?: Maybe<OngoingValidationStats>;
  status: ImportStatusEnum;
  subStatus?: Maybe<OngoingSubStatus>;
};

export const ImportStatusEnum = {
  Complete: 'COMPLETE',
  Failed: 'FAILED',
  NotStarted: 'NOT_STARTED',
  Ongoing: 'ONGOING'
} as const;

export type ImportStatusEnum = typeof ImportStatusEnum[keyof typeof ImportStatusEnum];
export type InputAge = {
  libelle: Scalars['String'];
};

export type InputClasse = {
  libelle: Scalars['String'];
};

export type InputCommune = {
  code: Scalars['Int'];
  departementId: Scalars['Int'];
  nom: Scalars['String'];
};

export type InputComportement = {
  code: Scalars['String'];
  libelle: Scalars['String'];
  nicheur?: InputMaybe<Nicheur>;
};

export type InputDepartement = {
  code: Scalars['String'];
};

export type InputDonnee = {
  ageId: Scalars['Int'];
  commentaire?: InputMaybe<Scalars['String']>;
  comportementsIds?: InputMaybe<Array<Scalars['Int']>>;
  distance?: InputMaybe<Scalars['Int']>;
  especeId: Scalars['Int'];
  estimationDistanceId?: InputMaybe<Scalars['Int']>;
  estimationNombreId: Scalars['Int'];
  inventaireId: Scalars['Int'];
  milieuxIds?: InputMaybe<Array<Scalars['Int']>>;
  nombre?: InputMaybe<Scalars['Int']>;
  regroupement?: InputMaybe<Scalars['Int']>;
  sexeId: Scalars['Int'];
};

export type InputEspece = {
  classeId: Scalars['Int'];
  code: Scalars['String'];
  nomFrancais: Scalars['String'];
  nomLatin: Scalars['String'];
};

export type InputEstimationDistance = {
  libelle: Scalars['String'];
};

export type InputEstimationNombre = {
  libelle: Scalars['String'];
  nonCompte: Scalars['Boolean'];
};

export type InputInventaire = {
  altitude?: InputMaybe<Scalars['Int']>;
  associesIds?: InputMaybe<Array<Scalars['Int']>>;
  date: Scalars['String'];
  duree?: InputMaybe<Scalars['String']>;
  heure?: InputMaybe<Scalars['String']>;
  latitude?: InputMaybe<Scalars['Float']>;
  lieuDitId: Scalars['Int'];
  longitude?: InputMaybe<Scalars['Float']>;
  meteosIds?: InputMaybe<Array<Scalars['Int']>>;
  observateurId: Scalars['Int'];
  temperature?: InputMaybe<Scalars['Int']>;
};

export type InputLieuDit = {
  altitude: Scalars['Int'];
  communeId: Scalars['Int'];
  coordinatesSystem: CoordinatesSystemType;
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  nom: Scalars['String'];
};

export type InputMeteo = {
  libelle: Scalars['String'];
};

export type InputMilieu = {
  code: Scalars['String'];
  libelle: Scalars['String'];
};

export type InputObservateur = {
  libelle: Scalars['String'];
};

export type InputSettings = {
  areAssociesDisplayed: Scalars['Boolean'];
  coordinatesSystem: CoordinatesSystemType;
  defaultAge: Scalars['Int'];
  defaultDepartement: Scalars['Int'];
  defaultEstimationNombre: Scalars['Int'];
  defaultNombre: Scalars['Int'];
  defaultObservateur: Scalars['Int'];
  defaultSexe: Scalars['Int'];
  id: Scalars['Int'];
  isDistanceDisplayed: Scalars['Boolean'];
  isMeteoDisplayed: Scalars['Boolean'];
  isRegroupementDisplayed: Scalars['Boolean'];
};

export type InputSexe = {
  libelle: Scalars['String'];
};

export type Inventaire = {
  __typename?: 'Inventaire';
  associes: Array<Maybe<Observateur>>;
  customizedCoordinates?: Maybe<Coordinates>;
  date: Scalars['String'];
  duree?: Maybe<Scalars['String']>;
  heure?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  lieuDit: LieuDit;
  meteos: Array<Maybe<Meteo>>;
  observateur: Observateur;
  temperature?: Maybe<Scalars['Int']>;
};

export type LieuDit = {
  __typename?: 'LieuDit';
  altitude: Scalars['Int'];
  commune: Commune;
  coordinatesSystem: CoordinatesSystemType;
  id: Scalars['Int'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  nom: Scalars['String'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export type LieuDitWithCounts = {
  __typename?: 'LieuDitWithCounts';
  altitude: Scalars['Int'];
  commune: CommuneWithCounts;
  coordinatesSystem: CoordinatesSystemType;
  id: Scalars['Int'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nom: Scalars['String'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export const LieuxDitsOrderBy = {
  Altitude: 'altitude',
  CodeCommune: 'codeCommune',
  Departement: 'departement',
  Id: 'id',
  Latitude: 'latitude',
  Longitude: 'longitude',
  NbDonnees: 'nbDonnees',
  Nom: 'nom',
  NomCommune: 'nomCommune'
} as const;

export type LieuxDitsOrderBy = typeof LieuxDitsOrderBy[keyof typeof LieuxDitsOrderBy];
export type LieuxDitsPaginatedResult = PaginatedResult & {
  __typename?: 'LieuxDitsPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<LieuDitWithCounts>>>;
};

export type Meteo = {
  __typename?: 'Meteo';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export type MeteoWithCounts = {
  __typename?: 'MeteoWithCounts';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  readonly?: Maybe<Scalars['Boolean']>;
};

export type MeteosPaginatedResult = PaginatedResult & {
  __typename?: 'MeteosPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<MeteoWithCounts>>>;
};

export type Milieu = {
  __typename?: 'Milieu';
  code: Scalars['String'];
  id: Scalars['Int'];
  libelle: Scalars['String'];
  readonly?: Maybe<Scalars['Boolean']>;
};

export type MilieuWithCounts = {
  __typename?: 'MilieuWithCounts';
  code: Scalars['String'];
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  readonly?: Maybe<Scalars['Boolean']>;
};

export const MilieuxOrderBy = {
  Code: 'code',
  Id: 'id',
  Libelle: 'libelle',
  NbDonnees: 'nbDonnees'
} as const;

export type MilieuxOrderBy = typeof MilieuxOrderBy[keyof typeof MilieuxOrderBy];
export type MilieuxPaginatedResult = PaginatedResult & {
  __typename?: 'MilieuxPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<MilieuWithCounts>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  deleteAge?: Maybe<Scalars['Int']>;
  deleteClasse?: Maybe<Scalars['Int']>;
  deleteCommune?: Maybe<Scalars['Int']>;
  deleteComportement?: Maybe<Scalars['Int']>;
  deleteDepartement?: Maybe<Scalars['Int']>;
  deleteDonnee?: Maybe<Scalars['Int']>;
  deleteEspece?: Maybe<Scalars['Int']>;
  deleteEstimationDistance?: Maybe<Scalars['Int']>;
  deleteEstimationNombre?: Maybe<Scalars['Int']>;
  deleteLieuDit?: Maybe<Scalars['Int']>;
  deleteMeteo?: Maybe<Scalars['Int']>;
  deleteMilieu?: Maybe<Scalars['Int']>;
  deleteObservateur?: Maybe<Scalars['Int']>;
  deleteSexe?: Maybe<Scalars['Int']>;
  initializeDatabase?: Maybe<Scalars['Boolean']>;
  resetDatabase?: Maybe<Scalars['Boolean']>;
  updateDatabase?: Maybe<Scalars['Boolean']>;
  updateSettings?: Maybe<Settings>;
  upsertAge?: Maybe<Age>;
  upsertClasse?: Maybe<Classe>;
  upsertCommune?: Maybe<Commune>;
  upsertComportement?: Maybe<Comportement>;
  upsertDepartement?: Maybe<Departement>;
  upsertDonnee?: Maybe<UpsertDonneeResult>;
  upsertEspece?: Maybe<Espece>;
  upsertEstimationDistance?: Maybe<EstimationDistance>;
  upsertEstimationNombre?: Maybe<EstimationNombre>;
  upsertInventaire?: Maybe<UpsertInventaireResult>;
  upsertLieuDit?: Maybe<LieuDit>;
  upsertMeteo?: Maybe<Meteo>;
  upsertMilieu?: Maybe<Milieu>;
  upsertObservateur?: Maybe<Observateur>;
  upsertSexe?: Maybe<Sexe>;
  userDelete: Scalars['Boolean'];
  userEdit?: Maybe<UserInfo>;
  userLogin?: Maybe<UserInfo>;
  userLogout: Scalars['Boolean'];
  userRefresh?: Maybe<UserInfo>;
  userSignup?: Maybe<UserInfo>;
};


export type MutationDeleteAgeArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteClasseArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteCommuneArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteComportementArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteDepartementArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteDonneeArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteEspeceArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteEstimationDistanceArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteEstimationNombreArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteLieuDitArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteMeteoArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteMilieuArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteObservateurArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteSexeArgs = {
  id: Scalars['Int'];
};


export type MutationUpdateSettingsArgs = {
  appConfiguration: InputSettings;
};


export type MutationUpsertAgeArgs = {
  data: InputAge;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertClasseArgs = {
  data: InputClasse;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertCommuneArgs = {
  data: InputCommune;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertComportementArgs = {
  data: InputComportement;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertDepartementArgs = {
  data: InputDepartement;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertDonneeArgs = {
  data: InputDonnee;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertEspeceArgs = {
  data: InputEspece;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertEstimationDistanceArgs = {
  data: InputEstimationDistance;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertEstimationNombreArgs = {
  data: InputEstimationNombre;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertInventaireArgs = {
  data: InputInventaire;
  id?: InputMaybe<Scalars['Int']>;
  migrateDonneesIfMatchesExistingInventaire?: InputMaybe<Scalars['Boolean']>;
};


export type MutationUpsertLieuDitArgs = {
  data: InputLieuDit;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertMeteoArgs = {
  data: InputMeteo;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertMilieuArgs = {
  data: InputMilieu;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertObservateurArgs = {
  data: InputObservateur;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUpsertSexeArgs = {
  data: InputSexe;
  id?: InputMaybe<Scalars['Int']>;
};


export type MutationUserDeleteArgs = {
  id: Scalars['ID'];
};


export type MutationUserEditArgs = {
  editUserData: EditUserData;
  id: Scalars['ID'];
};


export type MutationUserLoginArgs = {
  loginData: UserLoginInput;
};


export type MutationUserSignupArgs = {
  role?: InputMaybe<UserRole>;
  signupData: UserCreateInput;
};

export const Nicheur = {
  Certain: 'certain',
  Possible: 'possible',
  Probable: 'probable'
} as const;

export type Nicheur = typeof Nicheur[keyof typeof Nicheur];
export type Observateur = {
  __typename?: 'Observateur';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  readonly?: Maybe<Scalars['Boolean']>;
};

export type ObservateursPaginatedResult = PaginatedResult & {
  __typename?: 'ObservateursPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Observateur>>;
};

export const OngoingSubStatus = {
  InsertingImportedData: 'INSERTING_IMPORTED_DATA',
  ProcessStarted: 'PROCESS_STARTED',
  RetrievingRequiredData: 'RETRIEVING_REQUIRED_DATA',
  ValidatingInputFile: 'VALIDATING_INPUT_FILE'
} as const;

export type OngoingSubStatus = typeof OngoingSubStatus[keyof typeof OngoingSubStatus];
export type OngoingValidationStats = {
  __typename?: 'OngoingValidationStats';
  nbEntriesChecked?: Maybe<Scalars['Int']>;
  nbEntriesWithErrors?: Maybe<Scalars['Int']>;
  totalEntries?: Maybe<Scalars['Int']>;
  totalLines?: Maybe<Scalars['Int']>;
};

export type PaginatedResult = {
  count: Scalars['Int'];
};

export type PaginatedSearchDonneesResult = PaginatedResult & {
  __typename?: 'PaginatedSearchDonneesResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<Donnee>>>;
};

export type Query = {
  __typename?: 'Query';
  age?: Maybe<Age>;
  ages?: Maybe<Array<Maybe<Age>>>;
  classe?: Maybe<Classe>;
  classes?: Maybe<Array<Maybe<Classe>>>;
  commune?: Maybe<Commune>;
  communes?: Maybe<Array<Maybe<Commune>>>;
  comportement?: Maybe<Comportement>;
  comportementList?: Maybe<Array<Maybe<Comportement>>>;
  comportements?: Maybe<Array<Maybe<Comportement>>>;
  departement?: Maybe<Departement>;
  departements?: Maybe<Array<Maybe<Departement>>>;
  donnee?: Maybe<DonneeResult>;
  dumpDatabase?: Maybe<Scalars['String']>;
  espece?: Maybe<Espece>;
  especes?: Maybe<Array<Maybe<Espece>>>;
  estimationDistance?: Maybe<EstimationDistance>;
  estimationNombre?: Maybe<EstimationNombre>;
  estimationsDistance?: Maybe<Array<Maybe<EstimationDistance>>>;
  estimationsNombre?: Maybe<Array<Maybe<EstimationNombre>>>;
  exportAges?: Maybe<Scalars['String']>;
  exportClasses?: Maybe<Scalars['String']>;
  exportCommunes?: Maybe<Scalars['String']>;
  exportComportements?: Maybe<Scalars['String']>;
  exportDepartements?: Maybe<Scalars['String']>;
  exportDonnees?: Maybe<Scalars['String']>;
  exportEspeces?: Maybe<Scalars['String']>;
  exportEstimationsDistance?: Maybe<Scalars['String']>;
  exportEstimationsNombre?: Maybe<Scalars['String']>;
  exportLieuxDits?: Maybe<Scalars['String']>;
  exportMeteos?: Maybe<Scalars['String']>;
  exportMilieux?: Maybe<Scalars['String']>;
  exportObservateurs?: Maybe<Scalars['String']>;
  exportSexes?: Maybe<Scalars['String']>;
  importStatus?: Maybe<ImportStatus>;
  inventaire?: Maybe<Inventaire>;
  lastDonneeId?: Maybe<Scalars['Int']>;
  lieuDit?: Maybe<LieuDit>;
  lieuxDits?: Maybe<Array<Maybe<LieuDit>>>;
  meteo?: Maybe<Meteo>;
  meteoList?: Maybe<Array<Maybe<Meteo>>>;
  meteos?: Maybe<Array<Maybe<Meteo>>>;
  milieu?: Maybe<Milieu>;
  milieuList?: Maybe<Array<Maybe<Milieu>>>;
  milieux?: Maybe<Array<Maybe<Milieu>>>;
  nextRegroupement: Scalars['Int'];
  observateur?: Maybe<Observateur>;
  observateurList?: Maybe<Array<Observateur>>;
  observateurs?: Maybe<Array<Observateur>>;
  paginatedAges?: Maybe<AgesPaginatedResult>;
  paginatedClasses?: Maybe<ClassesPaginatedResult>;
  paginatedCommunes?: Maybe<CommunesPaginatedResult>;
  paginatedComportements?: Maybe<ComportementsPaginatedResult>;
  paginatedDepartements?: Maybe<DepartementsPaginatedResult>;
  paginatedEspeces?: Maybe<EspecesPaginatedResult>;
  paginatedEstimationsDistance?: Maybe<EstimationsDistancePaginatedResult>;
  paginatedEstimationsNombre?: Maybe<EstimationsNombrePaginatedResult>;
  paginatedLieuxdits?: Maybe<LieuxDitsPaginatedResult>;
  paginatedMeteos?: Maybe<MeteosPaginatedResult>;
  paginatedMilieux?: Maybe<MilieuxPaginatedResult>;
  paginatedObservateurs?: Maybe<ObservateursPaginatedResult>;
  paginatedSearchDonnees?: Maybe<PaginatedSearchDonneesResult>;
  paginatedSearchEspeces?: Maybe<EspecesPaginatedResult>;
  paginatedSexes?: Maybe<SexesPaginatedResult>;
  settings?: Maybe<Settings>;
  sexe?: Maybe<Sexe>;
  sexes?: Maybe<Array<Maybe<Sexe>>>;
  specimenCountByAge?: Maybe<Array<Maybe<AgeWithSpecimensCount>>>;
  specimenCountBySexe?: Maybe<Array<Maybe<SexeWithSpecimensCount>>>;
  version?: Maybe<Version>;
};


export type QueryAgeArgs = {
  id: Scalars['Int'];
};


export type QueryAgesArgs = {
  params?: InputMaybe<FindParams>;
};


export type QueryClasseArgs = {
  id: Scalars['Int'];
};


export type QueryClassesArgs = {
  params?: InputMaybe<FindParams>;
};


export type QueryCommuneArgs = {
  id: Scalars['Int'];
};


export type QueryCommunesArgs = {
  departementId?: InputMaybe<Scalars['Int']>;
  params?: InputMaybe<FindParams>;
};


export type QueryComportementArgs = {
  id: Scalars['Int'];
};


export type QueryComportementListArgs = {
  ids: Array<Scalars['Int']>;
};


export type QueryComportementsArgs = {
  params?: InputMaybe<FindParams>;
};


export type QueryDepartementArgs = {
  id: Scalars['Int'];
};


export type QueryDepartementsArgs = {
  params?: InputMaybe<FindParams>;
};


export type QueryDonneeArgs = {
  id: Scalars['Int'];
};


export type QueryEspeceArgs = {
  id: Scalars['Int'];
};


export type QueryEspecesArgs = {
  classeId?: InputMaybe<Scalars['Int']>;
  params?: InputMaybe<FindParams>;
};


export type QueryEstimationDistanceArgs = {
  id: Scalars['Int'];
};


export type QueryEstimationNombreArgs = {
  id: Scalars['Int'];
};


export type QueryEstimationsDistanceArgs = {
  params?: InputMaybe<FindParams>;
};


export type QueryEstimationsNombreArgs = {
  params?: InputMaybe<FindParams>;
};


export type QueryExportDonneesArgs = {
  searchCriteria?: InputMaybe<SearchDonneeCriteria>;
};


export type QueryImportStatusArgs = {
  importId: Scalars['String'];
};


export type QueryInventaireArgs = {
  id: Scalars['Int'];
};


export type QueryLieuDitArgs = {
  id: Scalars['Int'];
};


export type QueryLieuxDitsArgs = {
  communeId?: InputMaybe<Scalars['Int']>;
  departementId?: InputMaybe<Scalars['Int']>;
  params?: InputMaybe<FindParams>;
};


export type QueryMeteoArgs = {
  id: Scalars['Int'];
};


export type QueryMeteoListArgs = {
  ids: Array<Scalars['Int']>;
};


export type QueryMilieuArgs = {
  id: Scalars['Int'];
};


export type QueryMilieuListArgs = {
  ids: Array<Scalars['Int']>;
};


export type QueryMilieuxArgs = {
  params?: InputMaybe<FindParams>;
};


export type QueryObservateurArgs = {
  id: Scalars['Int'];
};


export type QueryObservateurListArgs = {
  ids: Array<Scalars['Int']>;
};


export type QueryObservateursArgs = {
  params?: InputMaybe<FindParams>;
};


export type QueryPaginatedAgesArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<EntitesAvecLibelleOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedClassesArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<ClassesOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedCommunesArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<CommunesOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedComportementsArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<ComportementsOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedDepartementsArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<DepartementsOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedEspecesArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<EspecesOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedEstimationsDistanceArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<EntitesAvecLibelleOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedEstimationsNombreArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<EstimationNombreOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedLieuxditsArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<LieuxDitsOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedMeteosArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<EntitesAvecLibelleOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedMilieuxArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<MilieuxOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedObservateursArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<EntitesAvecLibelleOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedSearchDonneesArgs = {
  orderBy?: InputMaybe<SearchDonneesOrderBy>;
  searchCriteria?: InputMaybe<SearchDonneeCriteria>;
  searchParams?: InputMaybe<SearchDonneeParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedSearchEspecesArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<EspecesOrderBy>;
  searchCriteria?: InputMaybe<SearchDonneeCriteria>;
  searchParams?: InputMaybe<SearchDonneeParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryPaginatedSexesArgs = {
  includeCounts: Scalars['Boolean'];
  orderBy?: InputMaybe<EntitesAvecLibelleOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QuerySexeArgs = {
  id: Scalars['Int'];
};


export type QuerySexesArgs = {
  params?: InputMaybe<FindParams>;
};


export type QuerySpecimenCountByAgeArgs = {
  especeId: Scalars['Int'];
};


export type QuerySpecimenCountBySexeArgs = {
  especeId: Scalars['Int'];
};

export type SearchDonneeCriteria = {
  ages?: InputMaybe<Array<Scalars['Int']>>;
  associes?: InputMaybe<Array<Scalars['Int']>>;
  classes?: InputMaybe<Array<Scalars['Int']>>;
  commentaire?: InputMaybe<Scalars['String']>;
  communes?: InputMaybe<Array<Scalars['Int']>>;
  comportements?: InputMaybe<Array<Scalars['Int']>>;
  departements?: InputMaybe<Array<Scalars['Int']>>;
  distance?: InputMaybe<Scalars['Int']>;
  duree?: InputMaybe<Scalars['String']>;
  especes?: InputMaybe<Array<Scalars['Int']>>;
  estimationsDistance?: InputMaybe<Array<Scalars['Int']>>;
  estimationsNombre?: InputMaybe<Array<Scalars['Int']>>;
  fromDate?: InputMaybe<Scalars['String']>;
  heure?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  lieuxdits?: InputMaybe<Array<Scalars['Int']>>;
  meteos?: InputMaybe<Array<Scalars['Int']>>;
  milieux?: InputMaybe<Array<Scalars['Int']>>;
  nicheurs?: InputMaybe<Array<Nicheur>>;
  nombre?: InputMaybe<Scalars['Int']>;
  observateurs?: InputMaybe<Array<Scalars['Int']>>;
  regroupement?: InputMaybe<Scalars['Int']>;
  sexes?: InputMaybe<Array<Scalars['Int']>>;
  temperature?: InputMaybe<Scalars['Int']>;
  toDate?: InputMaybe<Scalars['String']>;
};

export type SearchDonneeParams = {
  pageNumber?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
};

export const SearchDonneesOrderBy = {
  Age: 'age',
  CodeCommune: 'codeCommune',
  CodeEspece: 'codeEspece',
  Date: 'date',
  Departement: 'departement',
  Duree: 'duree',
  Heure: 'heure',
  Id: 'id',
  LieuDit: 'lieuDit',
  NomCommune: 'nomCommune',
  NomFrancais: 'nomFrancais',
  Nombre: 'nombre',
  Observateur: 'observateur',
  Sexe: 'sexe'
} as const;

export type SearchDonneesOrderBy = typeof SearchDonneesOrderBy[keyof typeof SearchDonneesOrderBy];
export type SearchParams = {
  pageNumber?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
  q?: InputMaybe<Scalars['String']>;
};

export type Settings = {
  __typename?: 'Settings';
  areAssociesDisplayed: Scalars['Boolean'];
  coordinatesSystem: CoordinatesSystemType;
  defaultAge?: Maybe<Age>;
  defaultDepartement?: Maybe<Departement>;
  defaultEstimationNombre?: Maybe<EstimationNombre>;
  defaultNombre?: Maybe<Scalars['Int']>;
  defaultObservateur?: Maybe<Observateur>;
  defaultSexe?: Maybe<Sexe>;
  id: Scalars['Int'];
  isDistanceDisplayed: Scalars['Boolean'];
  isMeteoDisplayed: Scalars['Boolean'];
  isRegroupementDisplayed: Scalars['Boolean'];
};

export type Sexe = {
  __typename?: 'Sexe';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  readonly?: Maybe<Scalars['Boolean']>;
};

export type SexeWithSpecimensCount = {
  __typename?: 'SexeWithSpecimensCount';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbSpecimens: Scalars['Int'];
};

export type SexesPaginatedResult = PaginatedResult & {
  __typename?: 'SexesPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Sexe>>;
};

export const SortOrder = {
  Asc: 'asc',
  Desc: 'desc'
} as const;

export type SortOrder = typeof SortOrder[keyof typeof SortOrder];
export type UpsertDonneeResult = {
  __typename?: 'UpsertDonneeResult';
  donnee?: Maybe<Donnee>;
  failureReason?: Maybe<Scalars['String']>;
};

export type UpsertInventaireFailureReason = {
  __typename?: 'UpsertInventaireFailureReason';
  correspondingInventaireFound: Scalars['Int'];
  inventaireExpectedToBeUpdated: Scalars['Int'];
};

export type UpsertInventaireResult = {
  __typename?: 'UpsertInventaireResult';
  failureReason?: Maybe<UpsertInventaireFailureReason>;
  inventaire?: Maybe<Inventaire>;
};

export type UserCreateInput = {
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};

export type UserInfo = {
  __typename?: 'UserInfo';
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName?: Maybe<Scalars['String']>;
  role: Scalars['String'];
  username: Scalars['String'];
};

export type UserLoginInput = {
  password: Scalars['String'];
  username: Scalars['String'];
};

export const UserRole = {
  Admin: 'admin',
  Contributor: 'contributor'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
export type Version = {
  __typename?: 'Version';
  application: Scalars['Int'];
  database: Scalars['Int'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Age: ResolverTypeWrapper<PartialDeep<Age> | null>;
  AgeWithSpecimensCount: ResolverTypeWrapper<PartialDeep<AgeWithSpecimensCount> | null>;
  AgesPaginatedResult: ResolverTypeWrapper<PartialDeep<AgesPaginatedResult> | null>;
  Boolean: ResolverTypeWrapper<PartialDeep<Scalars['Boolean']> | null>;
  Classe: ResolverTypeWrapper<PartialDeep<Classe> | null>;
  ClasseWithCounts: ResolverTypeWrapper<PartialDeep<ClasseWithCounts> | null>;
  ClassesOrderBy: ResolverTypeWrapper<PartialDeep<ClassesOrderBy> | null>;
  ClassesPaginatedResult: ResolverTypeWrapper<PartialDeep<ClassesPaginatedResult> | null>;
  Commune: ResolverTypeWrapper<PartialDeep<Commune> | null>;
  CommuneWithCounts: ResolverTypeWrapper<PartialDeep<CommuneWithCounts> | null>;
  CommunesOrderBy: ResolverTypeWrapper<PartialDeep<CommunesOrderBy> | null>;
  CommunesPaginatedResult: ResolverTypeWrapper<PartialDeep<CommunesPaginatedResult> | null>;
  Comportement: ResolverTypeWrapper<PartialDeep<Comportement> | null>;
  ComportementWithCounts: ResolverTypeWrapper<PartialDeep<ComportementWithCounts> | null>;
  ComportementsOrderBy: ResolverTypeWrapper<PartialDeep<ComportementsOrderBy> | null>;
  ComportementsPaginatedResult: ResolverTypeWrapper<PartialDeep<ComportementsPaginatedResult> | null>;
  Coordinates: ResolverTypeWrapper<PartialDeep<Coordinates> | null>;
  CoordinatesSystemType: ResolverTypeWrapper<PartialDeep<CoordinatesSystemType> | null>;
  Departement: ResolverTypeWrapper<PartialDeep<Departement> | null>;
  DepartementWithCounts: ResolverTypeWrapper<PartialDeep<DepartementWithCounts> | null>;
  DepartementsOrderBy: ResolverTypeWrapper<PartialDeep<DepartementsOrderBy> | null>;
  DepartementsPaginatedResult: ResolverTypeWrapper<PartialDeep<DepartementsPaginatedResult> | null>;
  Donnee: ResolverTypeWrapper<PartialDeep<Donnee> | null>;
  DonneeNavigationData: ResolverTypeWrapper<PartialDeep<DonneeNavigationData> | null>;
  DonneeResult: ResolverTypeWrapper<PartialDeep<DonneeResult> | null>;
  EditUserData: ResolverTypeWrapper<PartialDeep<EditUserData> | null>;
  EntitesAvecLibelleOrderBy: ResolverTypeWrapper<PartialDeep<EntitesAvecLibelleOrderBy> | null>;
  Espece: ResolverTypeWrapper<PartialDeep<Espece> | null>;
  EspeceWithCounts: ResolverTypeWrapper<PartialDeep<EspeceWithCounts> | null>;
  EspecesOrderBy: ResolverTypeWrapper<PartialDeep<EspecesOrderBy> | null>;
  EspecesPaginatedResult: ResolverTypeWrapper<PartialDeep<EspecesPaginatedResult> | null>;
  EstimationDistance: ResolverTypeWrapper<PartialDeep<EstimationDistance> | null>;
  EstimationDistanceWithCounts: ResolverTypeWrapper<PartialDeep<EstimationDistanceWithCounts> | null>;
  EstimationNombre: ResolverTypeWrapper<PartialDeep<EstimationNombre> | null>;
  EstimationNombreOrderBy: ResolverTypeWrapper<PartialDeep<EstimationNombreOrderBy> | null>;
  EstimationNombreWithCounts: ResolverTypeWrapper<PartialDeep<EstimationNombreWithCounts> | null>;
  EstimationsDistancePaginatedResult: ResolverTypeWrapper<PartialDeep<EstimationsDistancePaginatedResult> | null>;
  EstimationsNombrePaginatedResult: ResolverTypeWrapper<PartialDeep<EstimationsNombrePaginatedResult> | null>;
  FindParams: ResolverTypeWrapper<PartialDeep<FindParams> | null>;
  Float: ResolverTypeWrapper<PartialDeep<Scalars['Float']> | null>;
  ID: ResolverTypeWrapper<PartialDeep<Scalars['ID']> | null>;
  ImportErrorType: ResolverTypeWrapper<PartialDeep<ImportErrorType> | null>;
  ImportStatus: ResolverTypeWrapper<PartialDeep<ImportStatus> | null>;
  ImportStatusEnum: ResolverTypeWrapper<PartialDeep<ImportStatusEnum> | null>;
  InputAge: ResolverTypeWrapper<PartialDeep<InputAge> | null>;
  InputClasse: ResolverTypeWrapper<PartialDeep<InputClasse> | null>;
  InputCommune: ResolverTypeWrapper<PartialDeep<InputCommune> | null>;
  InputComportement: ResolverTypeWrapper<PartialDeep<InputComportement> | null>;
  InputDepartement: ResolverTypeWrapper<PartialDeep<InputDepartement> | null>;
  InputDonnee: ResolverTypeWrapper<PartialDeep<InputDonnee> | null>;
  InputEspece: ResolverTypeWrapper<PartialDeep<InputEspece> | null>;
  InputEstimationDistance: ResolverTypeWrapper<PartialDeep<InputEstimationDistance> | null>;
  InputEstimationNombre: ResolverTypeWrapper<PartialDeep<InputEstimationNombre> | null>;
  InputInventaire: ResolverTypeWrapper<PartialDeep<InputInventaire> | null>;
  InputLieuDit: ResolverTypeWrapper<PartialDeep<InputLieuDit> | null>;
  InputMeteo: ResolverTypeWrapper<PartialDeep<InputMeteo> | null>;
  InputMilieu: ResolverTypeWrapper<PartialDeep<InputMilieu> | null>;
  InputObservateur: ResolverTypeWrapper<PartialDeep<InputObservateur> | null>;
  InputSettings: ResolverTypeWrapper<PartialDeep<InputSettings> | null>;
  InputSexe: ResolverTypeWrapper<PartialDeep<InputSexe> | null>;
  Int: ResolverTypeWrapper<PartialDeep<Scalars['Int']> | null>;
  Inventaire: ResolverTypeWrapper<PartialDeep<Inventaire> | null>;
  LieuDit: ResolverTypeWrapper<PartialDeep<LieuDit> | null>;
  LieuDitWithCounts: ResolverTypeWrapper<PartialDeep<LieuDitWithCounts> | null>;
  LieuxDitsOrderBy: ResolverTypeWrapper<PartialDeep<LieuxDitsOrderBy> | null>;
  LieuxDitsPaginatedResult: ResolverTypeWrapper<PartialDeep<LieuxDitsPaginatedResult> | null>;
  Meteo: ResolverTypeWrapper<PartialDeep<Meteo> | null>;
  MeteoWithCounts: ResolverTypeWrapper<PartialDeep<MeteoWithCounts> | null>;
  MeteosPaginatedResult: ResolverTypeWrapper<PartialDeep<MeteosPaginatedResult> | null>;
  Milieu: ResolverTypeWrapper<PartialDeep<Milieu> | null>;
  MilieuWithCounts: ResolverTypeWrapper<PartialDeep<MilieuWithCounts> | null>;
  MilieuxOrderBy: ResolverTypeWrapper<PartialDeep<MilieuxOrderBy> | null>;
  MilieuxPaginatedResult: ResolverTypeWrapper<PartialDeep<MilieuxPaginatedResult> | null>;
  Mutation: ResolverTypeWrapper<{}>;
  Nicheur: ResolverTypeWrapper<PartialDeep<Nicheur> | null>;
  Observateur: ResolverTypeWrapper<PartialDeep<Observateur> | null>;
  ObservateursPaginatedResult: ResolverTypeWrapper<PartialDeep<ObservateursPaginatedResult> | null>;
  OngoingSubStatus: ResolverTypeWrapper<PartialDeep<OngoingSubStatus> | null>;
  OngoingValidationStats: ResolverTypeWrapper<PartialDeep<OngoingValidationStats> | null>;
  PaginatedResult: ResolversTypes['AgesPaginatedResult'] | ResolversTypes['ClassesPaginatedResult'] | ResolversTypes['CommunesPaginatedResult'] | ResolversTypes['ComportementsPaginatedResult'] | ResolversTypes['DepartementsPaginatedResult'] | ResolversTypes['EspecesPaginatedResult'] | ResolversTypes['EstimationsDistancePaginatedResult'] | ResolversTypes['EstimationsNombrePaginatedResult'] | ResolversTypes['LieuxDitsPaginatedResult'] | ResolversTypes['MeteosPaginatedResult'] | ResolversTypes['MilieuxPaginatedResult'] | ResolversTypes['ObservateursPaginatedResult'] | ResolversTypes['PaginatedSearchDonneesResult'] | ResolversTypes['SexesPaginatedResult'];
  PaginatedSearchDonneesResult: ResolverTypeWrapper<PartialDeep<PaginatedSearchDonneesResult> | null>;
  Query: ResolverTypeWrapper<{}>;
  SearchDonneeCriteria: ResolverTypeWrapper<PartialDeep<SearchDonneeCriteria> | null>;
  SearchDonneeParams: ResolverTypeWrapper<PartialDeep<SearchDonneeParams> | null>;
  SearchDonneesOrderBy: ResolverTypeWrapper<PartialDeep<SearchDonneesOrderBy> | null>;
  SearchParams: ResolverTypeWrapper<PartialDeep<SearchParams> | null>;
  Settings: ResolverTypeWrapper<PartialDeep<Settings> | null>;
  Sexe: ResolverTypeWrapper<PartialDeep<Sexe> | null>;
  SexeWithSpecimensCount: ResolverTypeWrapper<PartialDeep<SexeWithSpecimensCount> | null>;
  SexesPaginatedResult: ResolverTypeWrapper<PartialDeep<SexesPaginatedResult> | null>;
  SortOrder: ResolverTypeWrapper<PartialDeep<SortOrder> | null>;
  String: ResolverTypeWrapper<PartialDeep<Scalars['String']> | null>;
  UpsertDonneeResult: ResolverTypeWrapper<PartialDeep<UpsertDonneeResult> | null>;
  UpsertInventaireFailureReason: ResolverTypeWrapper<PartialDeep<UpsertInventaireFailureReason> | null>;
  UpsertInventaireResult: ResolverTypeWrapper<PartialDeep<UpsertInventaireResult> | null>;
  UserCreateInput: ResolverTypeWrapper<PartialDeep<UserCreateInput> | null>;
  UserInfo: ResolverTypeWrapper<PartialDeep<UserInfo> | null>;
  UserLoginInput: ResolverTypeWrapper<PartialDeep<UserLoginInput> | null>;
  UserRole: ResolverTypeWrapper<PartialDeep<UserRole> | null>;
  Version: ResolverTypeWrapper<PartialDeep<Version> | null>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Age: PartialDeep<Age> | null;
  AgeWithSpecimensCount: PartialDeep<AgeWithSpecimensCount> | null;
  AgesPaginatedResult: PartialDeep<AgesPaginatedResult> | null;
  Boolean: PartialDeep<Scalars['Boolean']> | null;
  Classe: PartialDeep<Classe> | null;
  ClasseWithCounts: PartialDeep<ClasseWithCounts> | null;
  ClassesPaginatedResult: PartialDeep<ClassesPaginatedResult> | null;
  Commune: PartialDeep<Commune> | null;
  CommuneWithCounts: PartialDeep<CommuneWithCounts> | null;
  CommunesPaginatedResult: PartialDeep<CommunesPaginatedResult> | null;
  Comportement: PartialDeep<Comportement> | null;
  ComportementWithCounts: PartialDeep<ComportementWithCounts> | null;
  ComportementsPaginatedResult: PartialDeep<ComportementsPaginatedResult> | null;
  Coordinates: PartialDeep<Coordinates> | null;
  Departement: PartialDeep<Departement> | null;
  DepartementWithCounts: PartialDeep<DepartementWithCounts> | null;
  DepartementsPaginatedResult: PartialDeep<DepartementsPaginatedResult> | null;
  Donnee: PartialDeep<Donnee> | null;
  DonneeNavigationData: PartialDeep<DonneeNavigationData> | null;
  DonneeResult: PartialDeep<DonneeResult> | null;
  EditUserData: PartialDeep<EditUserData> | null;
  Espece: PartialDeep<Espece> | null;
  EspeceWithCounts: PartialDeep<EspeceWithCounts> | null;
  EspecesPaginatedResult: PartialDeep<EspecesPaginatedResult> | null;
  EstimationDistance: PartialDeep<EstimationDistance> | null;
  EstimationDistanceWithCounts: PartialDeep<EstimationDistanceWithCounts> | null;
  EstimationNombre: PartialDeep<EstimationNombre> | null;
  EstimationNombreWithCounts: PartialDeep<EstimationNombreWithCounts> | null;
  EstimationsDistancePaginatedResult: PartialDeep<EstimationsDistancePaginatedResult> | null;
  EstimationsNombrePaginatedResult: PartialDeep<EstimationsNombrePaginatedResult> | null;
  FindParams: PartialDeep<FindParams> | null;
  Float: PartialDeep<Scalars['Float']> | null;
  ID: PartialDeep<Scalars['ID']> | null;
  ImportStatus: PartialDeep<ImportStatus> | null;
  InputAge: PartialDeep<InputAge> | null;
  InputClasse: PartialDeep<InputClasse> | null;
  InputCommune: PartialDeep<InputCommune> | null;
  InputComportement: PartialDeep<InputComportement> | null;
  InputDepartement: PartialDeep<InputDepartement> | null;
  InputDonnee: PartialDeep<InputDonnee> | null;
  InputEspece: PartialDeep<InputEspece> | null;
  InputEstimationDistance: PartialDeep<InputEstimationDistance> | null;
  InputEstimationNombre: PartialDeep<InputEstimationNombre> | null;
  InputInventaire: PartialDeep<InputInventaire> | null;
  InputLieuDit: PartialDeep<InputLieuDit> | null;
  InputMeteo: PartialDeep<InputMeteo> | null;
  InputMilieu: PartialDeep<InputMilieu> | null;
  InputObservateur: PartialDeep<InputObservateur> | null;
  InputSettings: PartialDeep<InputSettings> | null;
  InputSexe: PartialDeep<InputSexe> | null;
  Int: PartialDeep<Scalars['Int']> | null;
  Inventaire: PartialDeep<Inventaire> | null;
  LieuDit: PartialDeep<LieuDit> | null;
  LieuDitWithCounts: PartialDeep<LieuDitWithCounts> | null;
  LieuxDitsPaginatedResult: PartialDeep<LieuxDitsPaginatedResult> | null;
  Meteo: PartialDeep<Meteo> | null;
  MeteoWithCounts: PartialDeep<MeteoWithCounts> | null;
  MeteosPaginatedResult: PartialDeep<MeteosPaginatedResult> | null;
  Milieu: PartialDeep<Milieu> | null;
  MilieuWithCounts: PartialDeep<MilieuWithCounts> | null;
  MilieuxPaginatedResult: PartialDeep<MilieuxPaginatedResult> | null;
  Mutation: {};
  Observateur: PartialDeep<Observateur> | null;
  ObservateursPaginatedResult: PartialDeep<ObservateursPaginatedResult> | null;
  OngoingValidationStats: PartialDeep<OngoingValidationStats> | null;
  PaginatedResult: ResolversParentTypes['AgesPaginatedResult'] | ResolversParentTypes['ClassesPaginatedResult'] | ResolversParentTypes['CommunesPaginatedResult'] | ResolversParentTypes['ComportementsPaginatedResult'] | ResolversParentTypes['DepartementsPaginatedResult'] | ResolversParentTypes['EspecesPaginatedResult'] | ResolversParentTypes['EstimationsDistancePaginatedResult'] | ResolversParentTypes['EstimationsNombrePaginatedResult'] | ResolversParentTypes['LieuxDitsPaginatedResult'] | ResolversParentTypes['MeteosPaginatedResult'] | ResolversParentTypes['MilieuxPaginatedResult'] | ResolversParentTypes['ObservateursPaginatedResult'] | ResolversParentTypes['PaginatedSearchDonneesResult'] | ResolversParentTypes['SexesPaginatedResult'];
  PaginatedSearchDonneesResult: PartialDeep<PaginatedSearchDonneesResult> | null;
  Query: {};
  SearchDonneeCriteria: PartialDeep<SearchDonneeCriteria> | null;
  SearchDonneeParams: PartialDeep<SearchDonneeParams> | null;
  SearchParams: PartialDeep<SearchParams> | null;
  Settings: PartialDeep<Settings> | null;
  Sexe: PartialDeep<Sexe> | null;
  SexeWithSpecimensCount: PartialDeep<SexeWithSpecimensCount> | null;
  SexesPaginatedResult: PartialDeep<SexesPaginatedResult> | null;
  String: PartialDeep<Scalars['String']> | null;
  UpsertDonneeResult: PartialDeep<UpsertDonneeResult> | null;
  UpsertInventaireFailureReason: PartialDeep<UpsertInventaireFailureReason> | null;
  UpsertInventaireResult: PartialDeep<UpsertInventaireResult> | null;
  UserCreateInput: PartialDeep<UserCreateInput> | null;
  UserInfo: PartialDeep<UserInfo> | null;
  UserLoginInput: PartialDeep<UserLoginInput> | null;
  Version: PartialDeep<Version> | null;
};

export type AgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Age'] = ResolversParentTypes['Age']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgeWithSpecimensCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['AgeWithSpecimensCount'] = ResolversParentTypes['AgeWithSpecimensCount']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbSpecimens?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgesPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['AgesPaginatedResult'] = ResolversParentTypes['AgesPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<ResolversTypes['Age']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClasseResolvers<ContextType = any, ParentType extends ResolversParentTypes['Classe'] = ResolversParentTypes['Classe']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClasseWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClasseWithCounts'] = ResolversParentTypes['ClasseWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbEspeces?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClassesPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClassesPaginatedResult'] = ResolversParentTypes['ClassesPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['ClasseWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommuneResolvers<ContextType = any, ParentType extends ResolversParentTypes['Commune'] = ResolversParentTypes['Commune']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  departement?: Resolver<ResolversTypes['Departement'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nom?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommuneWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommuneWithCounts'] = ResolversParentTypes['CommuneWithCounts']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  departement?: Resolver<ResolversTypes['Departement'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbLieuxDits?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nom?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommunesPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommunesPaginatedResult'] = ResolversParentTypes['CommunesPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['CommuneWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ComportementResolvers<ContextType = any, ParentType extends ResolversParentTypes['Comportement'] = ResolversParentTypes['Comportement']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nicheur?: Resolver<Maybe<ResolversTypes['Nicheur']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ComportementWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ComportementWithCounts'] = ResolversParentTypes['ComportementWithCounts']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nicheur?: Resolver<Maybe<ResolversTypes['Nicheur']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ComportementsPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ComportementsPaginatedResult'] = ResolversParentTypes['ComportementsPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['ComportementWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CoordinatesResolvers<ContextType = any, ParentType extends ResolversParentTypes['Coordinates'] = ResolversParentTypes['Coordinates']> = {
  altitude?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  latitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  longitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  system?: Resolver<ResolversTypes['CoordinatesSystemType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DepartementResolvers<ContextType = any, ParentType extends ResolversParentTypes['Departement'] = ResolversParentTypes['Departement']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DepartementWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['DepartementWithCounts'] = ResolversParentTypes['DepartementWithCounts']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbCommunes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbLieuxDits?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DepartementsPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['DepartementsPaginatedResult'] = ResolversParentTypes['DepartementsPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['DepartementWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DonneeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Donnee'] = ResolversParentTypes['Donnee']> = {
  age?: Resolver<ResolversTypes['Age'], ParentType, ContextType>;
  commentaire?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comportements?: Resolver<Array<ResolversTypes['Comportement']>, ParentType, ContextType>;
  distance?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  espece?: Resolver<ResolversTypes['Espece'], ParentType, ContextType>;
  estimationDistance?: Resolver<Maybe<ResolversTypes['EstimationDistance']>, ParentType, ContextType>;
  estimationNombre?: Resolver<ResolversTypes['EstimationNombre'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  inventaire?: Resolver<ResolversTypes['Inventaire'], ParentType, ContextType>;
  milieux?: Resolver<Array<ResolversTypes['Milieu']>, ParentType, ContextType>;
  nombre?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  regroupement?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sexe?: Resolver<ResolversTypes['Sexe'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DonneeNavigationDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['DonneeNavigationData'] = ResolversParentTypes['DonneeNavigationData']> = {
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nextDonneeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  previousDonneeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DonneeResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['DonneeResult'] = ResolversParentTypes['DonneeResult']> = {
  donnee?: Resolver<Maybe<ResolversTypes['Donnee']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  navigation?: Resolver<Maybe<ResolversTypes['DonneeNavigationData']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EspeceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Espece'] = ResolversParentTypes['Espece']> = {
  classe?: Resolver<ResolversTypes['Classe'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nomFrancais?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nomLatin?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EspeceWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['EspeceWithCounts'] = ResolversParentTypes['EspeceWithCounts']> = {
  classe?: Resolver<Maybe<ResolversTypes['Classe']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nomFrancais?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nomLatin?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EspecesPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['EspecesPaginatedResult'] = ResolversParentTypes['EspecesPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['EspeceWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimationDistanceResolvers<ContextType = any, ParentType extends ResolversParentTypes['EstimationDistance'] = ResolversParentTypes['EstimationDistance']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimationDistanceWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['EstimationDistanceWithCounts'] = ResolversParentTypes['EstimationDistanceWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimationNombreResolvers<ContextType = any, ParentType extends ResolversParentTypes['EstimationNombre'] = ResolversParentTypes['EstimationNombre']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nonCompte?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimationNombreWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['EstimationNombreWithCounts'] = ResolversParentTypes['EstimationNombreWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nonCompte?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimationsDistancePaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['EstimationsDistancePaginatedResult'] = ResolversParentTypes['EstimationsDistancePaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['EstimationDistanceWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimationsNombrePaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['EstimationsNombrePaginatedResult'] = ResolversParentTypes['EstimationsNombrePaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['EstimationNombreWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImportStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['ImportStatus'] = ResolversParentTypes['ImportStatus']> = {
  errorDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errorType?: Resolver<Maybe<ResolversTypes['ImportErrorType']>, ParentType, ContextType>;
  importErrorsReportFile?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ongoingValidationStats?: Resolver<Maybe<ResolversTypes['OngoingValidationStats']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ImportStatusEnum'], ParentType, ContextType>;
  subStatus?: Resolver<Maybe<ResolversTypes['OngoingSubStatus']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InventaireResolvers<ContextType = any, ParentType extends ResolversParentTypes['Inventaire'] = ResolversParentTypes['Inventaire']> = {
  associes?: Resolver<Array<Maybe<ResolversTypes['Observateur']>>, ParentType, ContextType>;
  customizedCoordinates?: Resolver<Maybe<ResolversTypes['Coordinates']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  duree?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  heure?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lieuDit?: Resolver<ResolversTypes['LieuDit'], ParentType, ContextType>;
  meteos?: Resolver<Array<Maybe<ResolversTypes['Meteo']>>, ParentType, ContextType>;
  observateur?: Resolver<ResolversTypes['Observateur'], ParentType, ContextType>;
  temperature?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LieuDitResolvers<ContextType = any, ParentType extends ResolversParentTypes['LieuDit'] = ResolversParentTypes['LieuDit']> = {
  altitude?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commune?: Resolver<ResolversTypes['Commune'], ParentType, ContextType>;
  coordinatesSystem?: Resolver<ResolversTypes['CoordinatesSystemType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  latitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  longitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  nom?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LieuDitWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['LieuDitWithCounts'] = ResolversParentTypes['LieuDitWithCounts']> = {
  altitude?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commune?: Resolver<ResolversTypes['CommuneWithCounts'], ParentType, ContextType>;
  coordinatesSystem?: Resolver<ResolversTypes['CoordinatesSystemType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  latitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  longitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nom?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LieuxDitsPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['LieuxDitsPaginatedResult'] = ResolversParentTypes['LieuxDitsPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['LieuDitWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeteoResolvers<ContextType = any, ParentType extends ResolversParentTypes['Meteo'] = ResolversParentTypes['Meteo']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeteoWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['MeteoWithCounts'] = ResolversParentTypes['MeteoWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeteosPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['MeteosPaginatedResult'] = ResolversParentTypes['MeteosPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['MeteoWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MilieuResolvers<ContextType = any, ParentType extends ResolversParentTypes['Milieu'] = ResolversParentTypes['Milieu']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MilieuWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['MilieuWithCounts'] = ResolversParentTypes['MilieuWithCounts']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MilieuxPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['MilieuxPaginatedResult'] = ResolversParentTypes['MilieuxPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['MilieuWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  deleteAge?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteAgeArgs, 'id'>>;
  deleteClasse?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteClasseArgs, 'id'>>;
  deleteCommune?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteCommuneArgs, 'id'>>;
  deleteComportement?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteComportementArgs, 'id'>>;
  deleteDepartement?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteDepartementArgs, 'id'>>;
  deleteDonnee?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteDonneeArgs, 'id'>>;
  deleteEspece?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteEspeceArgs, 'id'>>;
  deleteEstimationDistance?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteEstimationDistanceArgs, 'id'>>;
  deleteEstimationNombre?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteEstimationNombreArgs, 'id'>>;
  deleteLieuDit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteLieuDitArgs, 'id'>>;
  deleteMeteo?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteMeteoArgs, 'id'>>;
  deleteMilieu?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteMilieuArgs, 'id'>>;
  deleteObservateur?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteObservateurArgs, 'id'>>;
  deleteSexe?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteSexeArgs, 'id'>>;
  initializeDatabase?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  resetDatabase?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  updateDatabase?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  updateSettings?: Resolver<Maybe<ResolversTypes['Settings']>, ParentType, ContextType, RequireFields<MutationUpdateSettingsArgs, 'appConfiguration'>>;
  upsertAge?: Resolver<Maybe<ResolversTypes['Age']>, ParentType, ContextType, RequireFields<MutationUpsertAgeArgs, 'data'>>;
  upsertClasse?: Resolver<Maybe<ResolversTypes['Classe']>, ParentType, ContextType, RequireFields<MutationUpsertClasseArgs, 'data'>>;
  upsertCommune?: Resolver<Maybe<ResolversTypes['Commune']>, ParentType, ContextType, RequireFields<MutationUpsertCommuneArgs, 'data'>>;
  upsertComportement?: Resolver<Maybe<ResolversTypes['Comportement']>, ParentType, ContextType, RequireFields<MutationUpsertComportementArgs, 'data'>>;
  upsertDepartement?: Resolver<Maybe<ResolversTypes['Departement']>, ParentType, ContextType, RequireFields<MutationUpsertDepartementArgs, 'data'>>;
  upsertDonnee?: Resolver<Maybe<ResolversTypes['UpsertDonneeResult']>, ParentType, ContextType, RequireFields<MutationUpsertDonneeArgs, 'data'>>;
  upsertEspece?: Resolver<Maybe<ResolversTypes['Espece']>, ParentType, ContextType, RequireFields<MutationUpsertEspeceArgs, 'data'>>;
  upsertEstimationDistance?: Resolver<Maybe<ResolversTypes['EstimationDistance']>, ParentType, ContextType, RequireFields<MutationUpsertEstimationDistanceArgs, 'data'>>;
  upsertEstimationNombre?: Resolver<Maybe<ResolversTypes['EstimationNombre']>, ParentType, ContextType, RequireFields<MutationUpsertEstimationNombreArgs, 'data'>>;
  upsertInventaire?: Resolver<Maybe<ResolversTypes['UpsertInventaireResult']>, ParentType, ContextType, RequireFields<MutationUpsertInventaireArgs, 'data'>>;
  upsertLieuDit?: Resolver<Maybe<ResolversTypes['LieuDit']>, ParentType, ContextType, RequireFields<MutationUpsertLieuDitArgs, 'data'>>;
  upsertMeteo?: Resolver<Maybe<ResolversTypes['Meteo']>, ParentType, ContextType, RequireFields<MutationUpsertMeteoArgs, 'data'>>;
  upsertMilieu?: Resolver<Maybe<ResolversTypes['Milieu']>, ParentType, ContextType, RequireFields<MutationUpsertMilieuArgs, 'data'>>;
  upsertObservateur?: Resolver<Maybe<ResolversTypes['Observateur']>, ParentType, ContextType, RequireFields<MutationUpsertObservateurArgs, 'data'>>;
  upsertSexe?: Resolver<Maybe<ResolversTypes['Sexe']>, ParentType, ContextType, RequireFields<MutationUpsertSexeArgs, 'data'>>;
  userDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUserDeleteArgs, 'id'>>;
  userEdit?: Resolver<Maybe<ResolversTypes['UserInfo']>, ParentType, ContextType, RequireFields<MutationUserEditArgs, 'editUserData' | 'id'>>;
  userLogin?: Resolver<Maybe<ResolversTypes['UserInfo']>, ParentType, ContextType, RequireFields<MutationUserLoginArgs, 'loginData'>>;
  userLogout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userRefresh?: Resolver<Maybe<ResolversTypes['UserInfo']>, ParentType, ContextType>;
  userSignup?: Resolver<Maybe<ResolversTypes['UserInfo']>, ParentType, ContextType, RequireFields<MutationUserSignupArgs, 'signupData'>>;
};

export type ObservateurResolvers<ContextType = any, ParentType extends ResolversParentTypes['Observateur'] = ResolversParentTypes['Observateur']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ObservateursPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ObservateursPaginatedResult'] = ResolversParentTypes['ObservateursPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<ResolversTypes['Observateur']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OngoingValidationStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['OngoingValidationStats'] = ResolversParentTypes['OngoingValidationStats']> = {
  nbEntriesChecked?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbEntriesWithErrors?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  totalEntries?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  totalLines?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedResult'] = ResolversParentTypes['PaginatedResult']> = {
  __resolveType: TypeResolveFn<'AgesPaginatedResult' | 'ClassesPaginatedResult' | 'CommunesPaginatedResult' | 'ComportementsPaginatedResult' | 'DepartementsPaginatedResult' | 'EspecesPaginatedResult' | 'EstimationsDistancePaginatedResult' | 'EstimationsNombrePaginatedResult' | 'LieuxDitsPaginatedResult' | 'MeteosPaginatedResult' | 'MilieuxPaginatedResult' | 'ObservateursPaginatedResult' | 'PaginatedSearchDonneesResult' | 'SexesPaginatedResult', ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type PaginatedSearchDonneesResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedSearchDonneesResult'] = ResolversParentTypes['PaginatedSearchDonneesResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['Donnee']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  age?: Resolver<Maybe<ResolversTypes['Age']>, ParentType, ContextType, RequireFields<QueryAgeArgs, 'id'>>;
  ages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Age']>>>, ParentType, ContextType, Partial<QueryAgesArgs>>;
  classe?: Resolver<Maybe<ResolversTypes['Classe']>, ParentType, ContextType, RequireFields<QueryClasseArgs, 'id'>>;
  classes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Classe']>>>, ParentType, ContextType, Partial<QueryClassesArgs>>;
  commune?: Resolver<Maybe<ResolversTypes['Commune']>, ParentType, ContextType, RequireFields<QueryCommuneArgs, 'id'>>;
  communes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Commune']>>>, ParentType, ContextType, Partial<QueryCommunesArgs>>;
  comportement?: Resolver<Maybe<ResolversTypes['Comportement']>, ParentType, ContextType, RequireFields<QueryComportementArgs, 'id'>>;
  comportementList?: Resolver<Maybe<Array<Maybe<ResolversTypes['Comportement']>>>, ParentType, ContextType, RequireFields<QueryComportementListArgs, 'ids'>>;
  comportements?: Resolver<Maybe<Array<Maybe<ResolversTypes['Comportement']>>>, ParentType, ContextType, Partial<QueryComportementsArgs>>;
  departement?: Resolver<Maybe<ResolversTypes['Departement']>, ParentType, ContextType, RequireFields<QueryDepartementArgs, 'id'>>;
  departements?: Resolver<Maybe<Array<Maybe<ResolversTypes['Departement']>>>, ParentType, ContextType, Partial<QueryDepartementsArgs>>;
  donnee?: Resolver<Maybe<ResolversTypes['DonneeResult']>, ParentType, ContextType, RequireFields<QueryDonneeArgs, 'id'>>;
  dumpDatabase?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  espece?: Resolver<Maybe<ResolversTypes['Espece']>, ParentType, ContextType, RequireFields<QueryEspeceArgs, 'id'>>;
  especes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Espece']>>>, ParentType, ContextType, Partial<QueryEspecesArgs>>;
  estimationDistance?: Resolver<Maybe<ResolversTypes['EstimationDistance']>, ParentType, ContextType, RequireFields<QueryEstimationDistanceArgs, 'id'>>;
  estimationNombre?: Resolver<Maybe<ResolversTypes['EstimationNombre']>, ParentType, ContextType, RequireFields<QueryEstimationNombreArgs, 'id'>>;
  estimationsDistance?: Resolver<Maybe<Array<Maybe<ResolversTypes['EstimationDistance']>>>, ParentType, ContextType, Partial<QueryEstimationsDistanceArgs>>;
  estimationsNombre?: Resolver<Maybe<Array<Maybe<ResolversTypes['EstimationNombre']>>>, ParentType, ContextType, Partial<QueryEstimationsNombreArgs>>;
  exportAges?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportClasses?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportCommunes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportComportements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportDepartements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportDonnees?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, Partial<QueryExportDonneesArgs>>;
  exportEspeces?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportEstimationsDistance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportEstimationsNombre?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportLieuxDits?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportMeteos?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportMilieux?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportObservateurs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportSexes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  importStatus?: Resolver<Maybe<ResolversTypes['ImportStatus']>, ParentType, ContextType, RequireFields<QueryImportStatusArgs, 'importId'>>;
  inventaire?: Resolver<Maybe<ResolversTypes['Inventaire']>, ParentType, ContextType, RequireFields<QueryInventaireArgs, 'id'>>;
  lastDonneeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lieuDit?: Resolver<Maybe<ResolversTypes['LieuDit']>, ParentType, ContextType, RequireFields<QueryLieuDitArgs, 'id'>>;
  lieuxDits?: Resolver<Maybe<Array<Maybe<ResolversTypes['LieuDit']>>>, ParentType, ContextType, Partial<QueryLieuxDitsArgs>>;
  meteo?: Resolver<Maybe<ResolversTypes['Meteo']>, ParentType, ContextType, RequireFields<QueryMeteoArgs, 'id'>>;
  meteoList?: Resolver<Maybe<Array<Maybe<ResolversTypes['Meteo']>>>, ParentType, ContextType, RequireFields<QueryMeteoListArgs, 'ids'>>;
  meteos?: Resolver<Maybe<Array<Maybe<ResolversTypes['Meteo']>>>, ParentType, ContextType>;
  milieu?: Resolver<Maybe<ResolversTypes['Milieu']>, ParentType, ContextType, RequireFields<QueryMilieuArgs, 'id'>>;
  milieuList?: Resolver<Maybe<Array<Maybe<ResolversTypes['Milieu']>>>, ParentType, ContextType, RequireFields<QueryMilieuListArgs, 'ids'>>;
  milieux?: Resolver<Maybe<Array<Maybe<ResolversTypes['Milieu']>>>, ParentType, ContextType, Partial<QueryMilieuxArgs>>;
  nextRegroupement?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  observateur?: Resolver<Maybe<ResolversTypes['Observateur']>, ParentType, ContextType, RequireFields<QueryObservateurArgs, 'id'>>;
  observateurList?: Resolver<Maybe<Array<ResolversTypes['Observateur']>>, ParentType, ContextType, RequireFields<QueryObservateurListArgs, 'ids'>>;
  observateurs?: Resolver<Maybe<Array<ResolversTypes['Observateur']>>, ParentType, ContextType, Partial<QueryObservateursArgs>>;
  paginatedAges?: Resolver<Maybe<ResolversTypes['AgesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedAgesArgs, 'includeCounts'>>;
  paginatedClasses?: Resolver<Maybe<ResolversTypes['ClassesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedClassesArgs, 'includeCounts'>>;
  paginatedCommunes?: Resolver<Maybe<ResolversTypes['CommunesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedCommunesArgs, 'includeCounts'>>;
  paginatedComportements?: Resolver<Maybe<ResolversTypes['ComportementsPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedComportementsArgs, 'includeCounts'>>;
  paginatedDepartements?: Resolver<Maybe<ResolversTypes['DepartementsPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedDepartementsArgs, 'includeCounts'>>;
  paginatedEspeces?: Resolver<Maybe<ResolversTypes['EspecesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedEspecesArgs, 'includeCounts'>>;
  paginatedEstimationsDistance?: Resolver<Maybe<ResolversTypes['EstimationsDistancePaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedEstimationsDistanceArgs, 'includeCounts'>>;
  paginatedEstimationsNombre?: Resolver<Maybe<ResolversTypes['EstimationsNombrePaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedEstimationsNombreArgs, 'includeCounts'>>;
  paginatedLieuxdits?: Resolver<Maybe<ResolversTypes['LieuxDitsPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedLieuxditsArgs, 'includeCounts'>>;
  paginatedMeteos?: Resolver<Maybe<ResolversTypes['MeteosPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedMeteosArgs, 'includeCounts'>>;
  paginatedMilieux?: Resolver<Maybe<ResolversTypes['MilieuxPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedMilieuxArgs, 'includeCounts'>>;
  paginatedObservateurs?: Resolver<Maybe<ResolversTypes['ObservateursPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedObservateursArgs, 'includeCounts'>>;
  paginatedSearchDonnees?: Resolver<Maybe<ResolversTypes['PaginatedSearchDonneesResult']>, ParentType, ContextType, Partial<QueryPaginatedSearchDonneesArgs>>;
  paginatedSearchEspeces?: Resolver<Maybe<ResolversTypes['EspecesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedSearchEspecesArgs, 'includeCounts'>>;
  paginatedSexes?: Resolver<Maybe<ResolversTypes['SexesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedSexesArgs, 'includeCounts'>>;
  settings?: Resolver<Maybe<ResolversTypes['Settings']>, ParentType, ContextType>;
  sexe?: Resolver<Maybe<ResolversTypes['Sexe']>, ParentType, ContextType, RequireFields<QuerySexeArgs, 'id'>>;
  sexes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Sexe']>>>, ParentType, ContextType, Partial<QuerySexesArgs>>;
  specimenCountByAge?: Resolver<Maybe<Array<Maybe<ResolversTypes['AgeWithSpecimensCount']>>>, ParentType, ContextType, RequireFields<QuerySpecimenCountByAgeArgs, 'especeId'>>;
  specimenCountBySexe?: Resolver<Maybe<Array<Maybe<ResolversTypes['SexeWithSpecimensCount']>>>, ParentType, ContextType, RequireFields<QuerySpecimenCountBySexeArgs, 'especeId'>>;
  version?: Resolver<Maybe<ResolversTypes['Version']>, ParentType, ContextType>;
};

export type SettingsResolvers<ContextType = any, ParentType extends ResolversParentTypes['Settings'] = ResolversParentTypes['Settings']> = {
  areAssociesDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  coordinatesSystem?: Resolver<ResolversTypes['CoordinatesSystemType'], ParentType, ContextType>;
  defaultAge?: Resolver<Maybe<ResolversTypes['Age']>, ParentType, ContextType>;
  defaultDepartement?: Resolver<Maybe<ResolversTypes['Departement']>, ParentType, ContextType>;
  defaultEstimationNombre?: Resolver<Maybe<ResolversTypes['EstimationNombre']>, ParentType, ContextType>;
  defaultNombre?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  defaultObservateur?: Resolver<Maybe<ResolversTypes['Observateur']>, ParentType, ContextType>;
  defaultSexe?: Resolver<Maybe<ResolversTypes['Sexe']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isDistanceDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isMeteoDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isRegroupementDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SexeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Sexe'] = ResolversParentTypes['Sexe']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SexeWithSpecimensCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['SexeWithSpecimensCount'] = ResolversParentTypes['SexeWithSpecimensCount']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbSpecimens?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SexesPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SexesPaginatedResult'] = ResolversParentTypes['SexesPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<ResolversTypes['Sexe']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpsertDonneeResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpsertDonneeResult'] = ResolversParentTypes['UpsertDonneeResult']> = {
  donnee?: Resolver<Maybe<ResolversTypes['Donnee']>, ParentType, ContextType>;
  failureReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpsertInventaireFailureReasonResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpsertInventaireFailureReason'] = ResolversParentTypes['UpsertInventaireFailureReason']> = {
  correspondingInventaireFound?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  inventaireExpectedToBeUpdated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpsertInventaireResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpsertInventaireResult'] = ResolversParentTypes['UpsertInventaireResult']> = {
  failureReason?: Resolver<Maybe<ResolversTypes['UpsertInventaireFailureReason']>, ParentType, ContextType>;
  inventaire?: Resolver<Maybe<ResolversTypes['Inventaire']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserInfo'] = ResolversParentTypes['UserInfo']> = {
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Version'] = ResolversParentTypes['Version']> = {
  application?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  database?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Age?: AgeResolvers<ContextType>;
  AgeWithSpecimensCount?: AgeWithSpecimensCountResolvers<ContextType>;
  AgesPaginatedResult?: AgesPaginatedResultResolvers<ContextType>;
  Classe?: ClasseResolvers<ContextType>;
  ClasseWithCounts?: ClasseWithCountsResolvers<ContextType>;
  ClassesPaginatedResult?: ClassesPaginatedResultResolvers<ContextType>;
  Commune?: CommuneResolvers<ContextType>;
  CommuneWithCounts?: CommuneWithCountsResolvers<ContextType>;
  CommunesPaginatedResult?: CommunesPaginatedResultResolvers<ContextType>;
  Comportement?: ComportementResolvers<ContextType>;
  ComportementWithCounts?: ComportementWithCountsResolvers<ContextType>;
  ComportementsPaginatedResult?: ComportementsPaginatedResultResolvers<ContextType>;
  Coordinates?: CoordinatesResolvers<ContextType>;
  Departement?: DepartementResolvers<ContextType>;
  DepartementWithCounts?: DepartementWithCountsResolvers<ContextType>;
  DepartementsPaginatedResult?: DepartementsPaginatedResultResolvers<ContextType>;
  Donnee?: DonneeResolvers<ContextType>;
  DonneeNavigationData?: DonneeNavigationDataResolvers<ContextType>;
  DonneeResult?: DonneeResultResolvers<ContextType>;
  Espece?: EspeceResolvers<ContextType>;
  EspeceWithCounts?: EspeceWithCountsResolvers<ContextType>;
  EspecesPaginatedResult?: EspecesPaginatedResultResolvers<ContextType>;
  EstimationDistance?: EstimationDistanceResolvers<ContextType>;
  EstimationDistanceWithCounts?: EstimationDistanceWithCountsResolvers<ContextType>;
  EstimationNombre?: EstimationNombreResolvers<ContextType>;
  EstimationNombreWithCounts?: EstimationNombreWithCountsResolvers<ContextType>;
  EstimationsDistancePaginatedResult?: EstimationsDistancePaginatedResultResolvers<ContextType>;
  EstimationsNombrePaginatedResult?: EstimationsNombrePaginatedResultResolvers<ContextType>;
  ImportStatus?: ImportStatusResolvers<ContextType>;
  Inventaire?: InventaireResolvers<ContextType>;
  LieuDit?: LieuDitResolvers<ContextType>;
  LieuDitWithCounts?: LieuDitWithCountsResolvers<ContextType>;
  LieuxDitsPaginatedResult?: LieuxDitsPaginatedResultResolvers<ContextType>;
  Meteo?: MeteoResolvers<ContextType>;
  MeteoWithCounts?: MeteoWithCountsResolvers<ContextType>;
  MeteosPaginatedResult?: MeteosPaginatedResultResolvers<ContextType>;
  Milieu?: MilieuResolvers<ContextType>;
  MilieuWithCounts?: MilieuWithCountsResolvers<ContextType>;
  MilieuxPaginatedResult?: MilieuxPaginatedResultResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Observateur?: ObservateurResolvers<ContextType>;
  ObservateursPaginatedResult?: ObservateursPaginatedResultResolvers<ContextType>;
  OngoingValidationStats?: OngoingValidationStatsResolvers<ContextType>;
  PaginatedResult?: PaginatedResultResolvers<ContextType>;
  PaginatedSearchDonneesResult?: PaginatedSearchDonneesResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  Sexe?: SexeResolvers<ContextType>;
  SexeWithSpecimensCount?: SexeWithSpecimensCountResolvers<ContextType>;
  SexesPaginatedResult?: SexesPaginatedResultResolvers<ContextType>;
  UpsertDonneeResult?: UpsertDonneeResultResolvers<ContextType>;
  UpsertInventaireFailureReason?: UpsertInventaireFailureReasonResolvers<ContextType>;
  UpsertInventaireResult?: UpsertInventaireResultResolvers<ContextType>;
  UserInfo?: UserInfoResolvers<ContextType>;
  Version?: VersionResolvers<ContextType>;
};

