export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
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
  data?: Maybe<Array<Age>>;
};

export type Classe = {
  __typename?: 'Classe';
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nbEspeces?: Maybe<Scalars['Int']>;
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
  data?: Maybe<Array<Classe>>;
};

export type Commune = {
  __typename?: 'Commune';
  code: Scalars['Int'];
  departement: Departement;
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nbLieuxDits?: Maybe<Scalars['Int']>;
  nom: Scalars['String'];
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
  data?: Maybe<Array<Commune>>;
};

export type Comportement = {
  __typename?: 'Comportement';
  code: Scalars['String'];
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nicheur?: Maybe<Nicheur>;
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
  data?: Maybe<Array<Comportement>>;
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
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  nbCommunes?: Maybe<Scalars['Int']>;
  nbDonnees?: Maybe<Scalars['Int']>;
  nbLieuxDits?: Maybe<Scalars['Int']>;
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
  data?: Maybe<Array<Departement>>;
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
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nomFrancais: Scalars['String'];
  nomLatin: Scalars['String'];
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
  data?: Maybe<Array<Espece>>;
};

export type EstimationDistance = {
  __typename?: 'EstimationDistance';
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
};

export type EstimationNombre = {
  __typename?: 'EstimationNombre';
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nonCompte: Scalars['Boolean'];
};

export const EstimationNombreOrderBy = {
  Id: 'id',
  Libelle: 'libelle',
  NbDonnees: 'nbDonnees',
  NonCompte: 'nonCompte'
} as const;

export type EstimationNombreOrderBy = typeof EstimationNombreOrderBy[keyof typeof EstimationNombreOrderBy];
export type EstimationsDistancePaginatedResult = PaginatedResult & {
  __typename?: 'EstimationsDistancePaginatedResult';
  count: Scalars['Int'];
  data?: Maybe<Array<EstimationDistance>>;
};

export type EstimationsNombrePaginatedResult = PaginatedResult & {
  __typename?: 'EstimationsNombrePaginatedResult';
  count: Scalars['Int'];
  data?: Maybe<Array<EstimationNombre>>;
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
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nom: Scalars['String'];
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
  data?: Maybe<Array<LieuDit>>;
};

export type Meteo = {
  __typename?: 'Meteo';
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
};

export type MeteosPaginatedResult = PaginatedResult & {
  __typename?: 'MeteosPaginatedResult';
  count: Scalars['Int'];
  data?: Maybe<Array<Meteo>>;
};

export type Milieu = {
  __typename?: 'Milieu';
  code: Scalars['String'];
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
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
  data?: Maybe<Array<Milieu>>;
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
  resetDatabase?: Maybe<Scalars['Boolean']>;
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
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
};

export type ObservateursPaginatedResult = PaginatedResult & {
  __typename?: 'ObservateursPaginatedResult';
  count: Scalars['Int'];
  data?: Maybe<Array<Observateur>>;
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


export type PaginatedSearchDonneesResultCountArgs = {
  searchCriteria?: InputMaybe<SearchDonneeCriteria>;
};


export type PaginatedSearchDonneesResultResultArgs = {
  orderBy?: InputMaybe<SearchDonneesOrderBy>;
  searchCriteria?: InputMaybe<SearchDonneeCriteria>;
  searchParams?: InputMaybe<SearchDonneeParams>;
  sortOrder?: InputMaybe<SortOrder>;
};

export type Query = {
  __typename?: 'Query';
  age?: Maybe<Age>;
  ages?: Maybe<AgesPaginatedResult>;
  classe?: Maybe<Classe>;
  classes?: Maybe<ClassesPaginatedResult>;
  commune?: Maybe<Commune>;
  communes?: Maybe<CommunesPaginatedResult>;
  comportement?: Maybe<Comportement>;
  comportements?: Maybe<ComportementsPaginatedResult>;
  departement?: Maybe<Departement>;
  departements?: Maybe<DepartementsPaginatedResult>;
  donnee?: Maybe<DonneeResult>;
  dumpDatabase?: Maybe<Scalars['String']>;
  espece?: Maybe<Espece>;
  especes?: Maybe<EspecesPaginatedResult>;
  estimationDistance?: Maybe<EstimationDistance>;
  estimationNombre?: Maybe<EstimationNombre>;
  estimationsDistance?: Maybe<EstimationsDistancePaginatedResult>;
  estimationsNombre?: Maybe<EstimationsNombrePaginatedResult>;
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
  lieuxDits?: Maybe<LieuxDitsPaginatedResult>;
  meteo?: Maybe<Meteo>;
  meteos?: Maybe<MeteosPaginatedResult>;
  milieu?: Maybe<Milieu>;
  milieux?: Maybe<MilieuxPaginatedResult>;
  nextRegroupement: Scalars['Int'];
  observateur?: Maybe<Observateur>;
  observateurs?: Maybe<ObservateursPaginatedResult>;
  searchDonnees?: Maybe<PaginatedSearchDonneesResult>;
  searchEspeces?: Maybe<EspecesPaginatedResult>;
  settings?: Maybe<Settings>;
  sexe?: Maybe<Sexe>;
  sexes?: Maybe<SexesPaginatedResult>;
  specimenCountByAge?: Maybe<Array<Maybe<AgeWithSpecimensCount>>>;
  specimenCountBySexe?: Maybe<Array<Maybe<SexeWithSpecimensCount>>>;
};


export type QueryAgeArgs = {
  id: Scalars['Int'];
};


export type QueryAgesArgs = {
  orderBy?: InputMaybe<EntitesAvecLibelleOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryClasseArgs = {
  id: Scalars['Int'];
};


export type QueryClassesArgs = {
  orderBy?: InputMaybe<ClassesOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryCommuneArgs = {
  id: Scalars['Int'];
};


export type QueryCommunesArgs = {
  orderBy?: InputMaybe<CommunesOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryComportementArgs = {
  id: Scalars['Int'];
};


export type QueryComportementsArgs = {
  orderBy?: InputMaybe<ComportementsOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryDepartementArgs = {
  id: Scalars['Int'];
};


export type QueryDepartementsArgs = {
  orderBy?: InputMaybe<DepartementsOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryDonneeArgs = {
  id: Scalars['Int'];
};


export type QueryEspeceArgs = {
  id: Scalars['Int'];
};


export type QueryEspecesArgs = {
  orderBy?: InputMaybe<EspecesOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryEstimationDistanceArgs = {
  id: Scalars['Int'];
};


export type QueryEstimationNombreArgs = {
  id: Scalars['Int'];
};


export type QueryEstimationsDistanceArgs = {
  orderBy?: InputMaybe<EntitesAvecLibelleOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryEstimationsNombreArgs = {
  orderBy?: InputMaybe<EstimationNombreOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
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
  orderBy?: InputMaybe<LieuxDitsOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryMeteoArgs = {
  id: Scalars['Int'];
};


export type QueryMeteosArgs = {
  orderBy?: InputMaybe<EntitesAvecLibelleOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryMilieuArgs = {
  id: Scalars['Int'];
};


export type QueryMilieuxArgs = {
  orderBy?: InputMaybe<MilieuxOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QueryObservateurArgs = {
  id: Scalars['Int'];
};


export type QueryObservateursArgs = {
  orderBy?: InputMaybe<EntitesAvecLibelleOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QuerySearchEspecesArgs = {
  orderBy?: InputMaybe<EspecesOrderBy>;
  searchCriteria?: InputMaybe<SearchDonneeCriteria>;
  searchParams?: InputMaybe<SearchDonneeParams>;
  sortOrder?: InputMaybe<SortOrder>;
};


export type QuerySexeArgs = {
  id: Scalars['Int'];
};


export type QuerySexesArgs = {
  orderBy?: InputMaybe<EntitesAvecLibelleOrderBy>;
  searchParams?: InputMaybe<SearchParams>;
  sortOrder?: InputMaybe<SortOrder>;
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
  editable?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
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
  data?: Maybe<Array<Sexe>>;
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