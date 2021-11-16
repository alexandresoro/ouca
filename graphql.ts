import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
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
};

export type AgeWithCounts = {
  __typename?: 'AgeWithCounts';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
};

export type AgesPaginatedResult = PaginatedResult & {
  __typename?: 'AgesPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<AgeWithCounts>>>;
};

export type Classe = {
  __typename?: 'Classe';
  id: Scalars['Int'];
  libelle: Scalars['String'];
};

export type ClasseWithCounts = {
  __typename?: 'ClasseWithCounts';
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
  result?: Maybe<Array<Maybe<ClasseWithCounts>>>;
};

export type Commune = {
  __typename?: 'Commune';
  code: Scalars['Int'];
  departement: Departement;
  id: Scalars['Int'];
  nom: Scalars['String'];
};

export type CommuneWithCounts = {
  __typename?: 'CommuneWithCounts';
  code: Scalars['Int'];
  departement: Departement;
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
  result?: Maybe<Array<Maybe<CommuneWithCounts>>>;
};

export type Comportement = {
  __typename?: 'Comportement';
  code: Scalars['String'];
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nicheur?: Maybe<Nicheur>;
};

export type ComportementWithCounts = {
  __typename?: 'ComportementWithCounts';
  code: Scalars['String'];
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
};

export type DepartementWithCounts = {
  __typename?: 'DepartementWithCounts';
  code: Scalars['String'];
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
  result?: Maybe<Array<Maybe<DepartementWithCounts>>>;
};

export type Donnee = {
  __typename?: 'Donnee';
  age: Age;
  commentaire?: Maybe<Scalars['String']>;
  comportements: Array<Maybe<Comportement>>;
  distance?: Maybe<Scalars['Int']>;
  espece: Espece;
  estimationDistance?: Maybe<EstimationDistance>;
  estimationNombre?: Maybe<EstimationNombre>;
  id: Scalars['Int'];
  inventaire: Inventaire;
  milieux: Array<Maybe<Milieu>>;
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
};

export type EspeceWithCounts = {
  __typename?: 'EspeceWithCounts';
  classe: Classe;
  code: Scalars['String'];
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
  result?: Maybe<Array<Maybe<EspeceWithCounts>>>;
};

export type EstimationDistance = {
  __typename?: 'EstimationDistance';
  id: Scalars['Int'];
  libelle: Scalars['String'];
};

export type EstimationDistanceWithCounts = {
  __typename?: 'EstimationDistanceWithCounts';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
};

export type EstimationNombre = {
  __typename?: 'EstimationNombre';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nonCompte: Scalars['Boolean'];
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
  max?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};

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
  nicheur?: Maybe<Nicheur>;
};

export type InputDepartement = {
  code: Scalars['String'];
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
};

export type MeteoWithCounts = {
  __typename?: 'MeteoWithCounts';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
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
};

export type MilieuWithCounts = {
  __typename?: 'MilieuWithCounts';
  code: Scalars['String'];
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
  result?: Maybe<Array<Maybe<MilieuWithCounts>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  deleteAge?: Maybe<Scalars['Int']>;
  deleteClasse?: Maybe<Scalars['Int']>;
  deleteCommune?: Maybe<Scalars['Int']>;
  deleteComportement?: Maybe<Scalars['Int']>;
  deleteDepartement?: Maybe<Scalars['Int']>;
  deleteEspece?: Maybe<Scalars['Int']>;
  deleteEstimationDistance?: Maybe<Scalars['Int']>;
  deleteEstimationNombre?: Maybe<Scalars['Int']>;
  deleteLieuDit?: Maybe<Scalars['Int']>;
  deleteMeteo?: Maybe<Scalars['Int']>;
  deleteMilieu?: Maybe<Scalars['Int']>;
  deleteObservateur?: Maybe<Scalars['Int']>;
  deleteSexe?: Maybe<Scalars['Int']>;
  updateSettings?: Maybe<Settings>;
  upsertAge?: Maybe<Age>;
  upsertClasse?: Maybe<Classe>;
  upsertCommune?: Maybe<Commune>;
  upsertComportement?: Maybe<Comportement>;
  upsertDepartement?: Maybe<Departement>;
  upsertEspece?: Maybe<Espece>;
  upsertEstimationDistance?: Maybe<EstimationDistance>;
  upsertEstimationNombre?: Maybe<EstimationNombre>;
  upsertLieuDit?: Maybe<LieuDit>;
  upsertMeteo?: Maybe<Meteo>;
  upsertMilieu?: Maybe<Milieu>;
  upsertObservateur?: Maybe<Observateur>;
  upsertSexe?: Maybe<Sexe>;
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
  appConfiguration?: Maybe<InputSettings>;
};


export type MutationUpsertAgeArgs = {
  data: InputAge;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertClasseArgs = {
  data: InputClasse;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertCommuneArgs = {
  data: InputCommune;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertComportementArgs = {
  data: InputComportement;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertDepartementArgs = {
  data: InputDepartement;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertEspeceArgs = {
  data: InputEspece;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertEstimationDistanceArgs = {
  data: InputEstimationDistance;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertEstimationNombreArgs = {
  data: InputEstimationNombre;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertLieuDitArgs = {
  data: InputLieuDit;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertMeteoArgs = {
  data: InputMeteo;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertMilieuArgs = {
  data: InputMilieu;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertObservateurArgs = {
  data: InputObservateur;
  id?: Maybe<Scalars['Int']>;
};


export type MutationUpsertSexeArgs = {
  data: InputSexe;
  id?: Maybe<Scalars['Int']>;
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
};

export type ObservateurWithCounts = {
  __typename?: 'ObservateurWithCounts';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
};

export type ObservateursPaginatedResult = PaginatedResult & {
  __typename?: 'ObservateursPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<ObservateurWithCounts>>>;
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
  observateurList?: Maybe<Array<Maybe<Observateur>>>;
  observateurs?: Maybe<Array<Maybe<Observateur>>>;
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
  version?: Maybe<Version>;
};


export type QueryAgeArgs = {
  id: Scalars['Int'];
};


export type QueryAgesArgs = {
  params?: Maybe<FindParams>;
};


export type QueryClasseArgs = {
  id: Scalars['Int'];
};


export type QueryClassesArgs = {
  params?: Maybe<FindParams>;
};


export type QueryCommuneArgs = {
  id: Scalars['Int'];
};


export type QueryCommunesArgs = {
  departementId?: Maybe<Scalars['Int']>;
  params?: Maybe<FindParams>;
};


export type QueryComportementArgs = {
  id: Scalars['Int'];
};


export type QueryComportementListArgs = {
  ids: Array<Scalars['Int']>;
};


export type QueryComportementsArgs = {
  params?: Maybe<FindParams>;
};


export type QueryDepartementArgs = {
  id: Scalars['Int'];
};


export type QueryDepartementsArgs = {
  params?: Maybe<FindParams>;
};


export type QueryDonneeArgs = {
  id: Scalars['Int'];
};


export type QueryEspeceArgs = {
  id: Scalars['Int'];
};


export type QueryEspecesArgs = {
  classeId?: Maybe<Scalars['Int']>;
  params?: Maybe<FindParams>;
};


export type QueryEstimationDistanceArgs = {
  id: Scalars['Int'];
};


export type QueryEstimationNombreArgs = {
  id: Scalars['Int'];
};


export type QueryEstimationsDistanceArgs = {
  params?: Maybe<FindParams>;
};


export type QueryEstimationsNombreArgs = {
  params?: Maybe<FindParams>;
};


export type QueryExportDonneesArgs = {
  searchCriteria?: Maybe<SearchDonneeCriteria>;
};


export type QueryInventaireArgs = {
  id: Scalars['Int'];
};


export type QueryLieuDitArgs = {
  id: Scalars['Int'];
};


export type QueryLieuxDitsArgs = {
  communeId?: Maybe<Scalars['Int']>;
  departementId?: Maybe<Scalars['Int']>;
  params?: Maybe<FindParams>;
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
  params?: Maybe<FindParams>;
};


export type QueryObservateurArgs = {
  id: Scalars['Int'];
};


export type QueryObservateurListArgs = {
  ids: Array<Scalars['Int']>;
};


export type QueryObservateursArgs = {
  params?: Maybe<FindParams>;
};


export type QueryPaginatedAgesArgs = {
  orderBy?: Maybe<EntitesAvecLibelleOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedClassesArgs = {
  orderBy?: Maybe<ClassesOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedCommunesArgs = {
  orderBy?: Maybe<CommunesOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedComportementsArgs = {
  orderBy?: Maybe<ComportementsOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedDepartementsArgs = {
  orderBy?: Maybe<DepartementsOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedEspecesArgs = {
  orderBy?: Maybe<EspecesOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedEstimationsDistanceArgs = {
  orderBy?: Maybe<EntitesAvecLibelleOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedEstimationsNombreArgs = {
  orderBy?: Maybe<EstimationNombreOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedLieuxditsArgs = {
  orderBy?: Maybe<LieuxDitsOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedMeteosArgs = {
  orderBy?: Maybe<EntitesAvecLibelleOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedMilieuxArgs = {
  orderBy?: Maybe<MilieuxOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedObservateursArgs = {
  orderBy?: Maybe<EntitesAvecLibelleOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedSearchDonneesArgs = {
  orderBy?: Maybe<SearchDonneesOrderBy>;
  searchCriteria?: Maybe<SearchDonneeCriteria>;
  searchParams?: Maybe<SearchDonneeParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedSearchEspecesArgs = {
  orderBy?: Maybe<EspecesOrderBy>;
  searchCriteria?: Maybe<SearchDonneeCriteria>;
  searchParams?: Maybe<SearchDonneeParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryPaginatedSexesArgs = {
  orderBy?: Maybe<EntitesAvecLibelleOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};


export type QuerySexeArgs = {
  id: Scalars['Int'];
};


export type QuerySexesArgs = {
  params?: Maybe<FindParams>;
};

export type SearchDonneeCriteria = {
  ages?: Maybe<Array<Maybe<Scalars['Int']>>>;
  associes?: Maybe<Array<Maybe<Scalars['Int']>>>;
  classes?: Maybe<Array<Maybe<Scalars['Int']>>>;
  commentaire?: Maybe<Scalars['String']>;
  communes?: Maybe<Array<Maybe<Scalars['Int']>>>;
  comportements?: Maybe<Array<Maybe<Scalars['Int']>>>;
  departements?: Maybe<Array<Maybe<Scalars['Int']>>>;
  distance?: Maybe<Scalars['Int']>;
  duree?: Maybe<Scalars['String']>;
  especes?: Maybe<Array<Maybe<Scalars['Int']>>>;
  estimationsDistance?: Maybe<Array<Maybe<Scalars['Int']>>>;
  estimationsNombre?: Maybe<Array<Maybe<Scalars['Int']>>>;
  fromDate?: Maybe<Scalars['String']>;
  heure?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  lieuxdits?: Maybe<Array<Maybe<Scalars['Int']>>>;
  meteos?: Maybe<Array<Maybe<Scalars['Int']>>>;
  milieux?: Maybe<Array<Maybe<Scalars['Int']>>>;
  nicheurs?: Maybe<Array<Maybe<Nicheur>>>;
  nombre?: Maybe<Scalars['Int']>;
  observateurs?: Maybe<Array<Maybe<Scalars['Int']>>>;
  regroupement?: Maybe<Scalars['Int']>;
  sexes?: Maybe<Array<Maybe<Scalars['Int']>>>;
  temperature?: Maybe<Scalars['Int']>;
  toDate?: Maybe<Scalars['String']>;
};

export type SearchDonneeParams = {
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
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
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};

export type Settings = {
  __typename?: 'Settings';
  areAssociesDisplayed: Scalars['Boolean'];
  coordinatesSystem: CoordinatesSystemType;
  defaultAge: Age;
  defaultDepartement: Departement;
  defaultEstimationNombre: EstimationNombre;
  defaultNombre: Scalars['Int'];
  defaultObservateur: Observateur;
  defaultSexe: Sexe;
  id: Scalars['Int'];
  isDistanceDisplayed: Scalars['Boolean'];
  isMeteoDisplayed: Scalars['Boolean'];
  isRegroupementDisplayed: Scalars['Boolean'];
};

export type Sexe = {
  __typename?: 'Sexe';
  id: Scalars['Int'];
  libelle: Scalars['String'];
};

export type SexeWithCounts = {
  __typename?: 'SexeWithCounts';
  id: Scalars['Int'];
  libelle: Scalars['String'];
  nbDonnees?: Maybe<Scalars['Int']>;
};

export type SexesPaginatedResult = PaginatedResult & {
  __typename?: 'SexesPaginatedResult';
  count: Scalars['Int'];
  result?: Maybe<Array<Maybe<SexeWithCounts>>>;
};

export const SortOrder = {
  Asc: 'asc',
  Desc: 'desc'
} as const;

export type SortOrder = typeof SortOrder[keyof typeof SortOrder];
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
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

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
  Age: ResolverTypeWrapper<Partial<Age>>;
  AgeWithCounts: ResolverTypeWrapper<Partial<AgeWithCounts>>;
  AgesPaginatedResult: ResolverTypeWrapper<Partial<AgesPaginatedResult>>;
  Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']>>;
  Classe: ResolverTypeWrapper<Partial<Classe>>;
  ClasseWithCounts: ResolverTypeWrapper<Partial<ClasseWithCounts>>;
  ClassesOrderBy: ResolverTypeWrapper<Partial<ClassesOrderBy>>;
  ClassesPaginatedResult: ResolverTypeWrapper<Partial<ClassesPaginatedResult>>;
  Commune: ResolverTypeWrapper<Partial<Commune>>;
  CommuneWithCounts: ResolverTypeWrapper<Partial<CommuneWithCounts>>;
  CommunesOrderBy: ResolverTypeWrapper<Partial<CommunesOrderBy>>;
  CommunesPaginatedResult: ResolverTypeWrapper<Partial<CommunesPaginatedResult>>;
  Comportement: ResolverTypeWrapper<Partial<Comportement>>;
  ComportementWithCounts: ResolverTypeWrapper<Partial<ComportementWithCounts>>;
  ComportementsOrderBy: ResolverTypeWrapper<Partial<ComportementsOrderBy>>;
  ComportementsPaginatedResult: ResolverTypeWrapper<Partial<ComportementsPaginatedResult>>;
  Coordinates: ResolverTypeWrapper<Partial<Coordinates>>;
  CoordinatesSystemType: ResolverTypeWrapper<Partial<CoordinatesSystemType>>;
  Departement: ResolverTypeWrapper<Partial<Departement>>;
  DepartementWithCounts: ResolverTypeWrapper<Partial<DepartementWithCounts>>;
  DepartementsOrderBy: ResolverTypeWrapper<Partial<DepartementsOrderBy>>;
  DepartementsPaginatedResult: ResolverTypeWrapper<Partial<DepartementsPaginatedResult>>;
  Donnee: ResolverTypeWrapper<Partial<Donnee>>;
  DonneeNavigationData: ResolverTypeWrapper<Partial<DonneeNavigationData>>;
  DonneeResult: ResolverTypeWrapper<Partial<DonneeResult>>;
  EntitesAvecLibelleOrderBy: ResolverTypeWrapper<Partial<EntitesAvecLibelleOrderBy>>;
  Espece: ResolverTypeWrapper<Partial<Espece>>;
  EspeceWithCounts: ResolverTypeWrapper<Partial<EspeceWithCounts>>;
  EspecesOrderBy: ResolverTypeWrapper<Partial<EspecesOrderBy>>;
  EspecesPaginatedResult: ResolverTypeWrapper<Partial<EspecesPaginatedResult>>;
  EstimationDistance: ResolverTypeWrapper<Partial<EstimationDistance>>;
  EstimationDistanceWithCounts: ResolverTypeWrapper<Partial<EstimationDistanceWithCounts>>;
  EstimationNombre: ResolverTypeWrapper<Partial<EstimationNombre>>;
  EstimationNombreOrderBy: ResolverTypeWrapper<Partial<EstimationNombreOrderBy>>;
  EstimationNombreWithCounts: ResolverTypeWrapper<Partial<EstimationNombreWithCounts>>;
  EstimationsDistancePaginatedResult: ResolverTypeWrapper<Partial<EstimationsDistancePaginatedResult>>;
  EstimationsNombrePaginatedResult: ResolverTypeWrapper<Partial<EstimationsNombrePaginatedResult>>;
  FindParams: ResolverTypeWrapper<Partial<FindParams>>;
  Float: ResolverTypeWrapper<Partial<Scalars['Float']>>;
  InputAge: ResolverTypeWrapper<Partial<InputAge>>;
  InputClasse: ResolverTypeWrapper<Partial<InputClasse>>;
  InputCommune: ResolverTypeWrapper<Partial<InputCommune>>;
  InputComportement: ResolverTypeWrapper<Partial<InputComportement>>;
  InputDepartement: ResolverTypeWrapper<Partial<InputDepartement>>;
  InputEspece: ResolverTypeWrapper<Partial<InputEspece>>;
  InputEstimationDistance: ResolverTypeWrapper<Partial<InputEstimationDistance>>;
  InputEstimationNombre: ResolverTypeWrapper<Partial<InputEstimationNombre>>;
  InputLieuDit: ResolverTypeWrapper<Partial<InputLieuDit>>;
  InputMeteo: ResolverTypeWrapper<Partial<InputMeteo>>;
  InputMilieu: ResolverTypeWrapper<Partial<InputMilieu>>;
  InputObservateur: ResolverTypeWrapper<Partial<InputObservateur>>;
  InputSettings: ResolverTypeWrapper<Partial<InputSettings>>;
  InputSexe: ResolverTypeWrapper<Partial<InputSexe>>;
  Int: ResolverTypeWrapper<Partial<Scalars['Int']>>;
  Inventaire: ResolverTypeWrapper<Partial<Inventaire>>;
  LieuDit: ResolverTypeWrapper<Partial<LieuDit>>;
  LieuDitWithCounts: ResolverTypeWrapper<Partial<LieuDitWithCounts>>;
  LieuxDitsOrderBy: ResolverTypeWrapper<Partial<LieuxDitsOrderBy>>;
  LieuxDitsPaginatedResult: ResolverTypeWrapper<Partial<LieuxDitsPaginatedResult>>;
  Meteo: ResolverTypeWrapper<Partial<Meteo>>;
  MeteoWithCounts: ResolverTypeWrapper<Partial<MeteoWithCounts>>;
  MeteosPaginatedResult: ResolverTypeWrapper<Partial<MeteosPaginatedResult>>;
  Milieu: ResolverTypeWrapper<Partial<Milieu>>;
  MilieuWithCounts: ResolverTypeWrapper<Partial<MilieuWithCounts>>;
  MilieuxOrderBy: ResolverTypeWrapper<Partial<MilieuxOrderBy>>;
  MilieuxPaginatedResult: ResolverTypeWrapper<Partial<MilieuxPaginatedResult>>;
  Mutation: ResolverTypeWrapper<{}>;
  Nicheur: ResolverTypeWrapper<Partial<Nicheur>>;
  Observateur: ResolverTypeWrapper<Partial<Observateur>>;
  ObservateurWithCounts: ResolverTypeWrapper<Partial<ObservateurWithCounts>>;
  ObservateursPaginatedResult: ResolverTypeWrapper<Partial<ObservateursPaginatedResult>>;
  PaginatedResult: ResolversTypes['AgesPaginatedResult'] | ResolversTypes['ClassesPaginatedResult'] | ResolversTypes['CommunesPaginatedResult'] | ResolversTypes['ComportementsPaginatedResult'] | ResolversTypes['DepartementsPaginatedResult'] | ResolversTypes['EspecesPaginatedResult'] | ResolversTypes['EstimationsDistancePaginatedResult'] | ResolversTypes['EstimationsNombrePaginatedResult'] | ResolversTypes['LieuxDitsPaginatedResult'] | ResolversTypes['MeteosPaginatedResult'] | ResolversTypes['MilieuxPaginatedResult'] | ResolversTypes['ObservateursPaginatedResult'] | ResolversTypes['PaginatedSearchDonneesResult'] | ResolversTypes['SexesPaginatedResult'];
  PaginatedSearchDonneesResult: ResolverTypeWrapper<Partial<PaginatedSearchDonneesResult>>;
  Query: ResolverTypeWrapper<{}>;
  SearchDonneeCriteria: ResolverTypeWrapper<Partial<SearchDonneeCriteria>>;
  SearchDonneeParams: ResolverTypeWrapper<Partial<SearchDonneeParams>>;
  SearchDonneesOrderBy: ResolverTypeWrapper<Partial<SearchDonneesOrderBy>>;
  SearchParams: ResolverTypeWrapper<Partial<SearchParams>>;
  Settings: ResolverTypeWrapper<Partial<Settings>>;
  Sexe: ResolverTypeWrapper<Partial<Sexe>>;
  SexeWithCounts: ResolverTypeWrapper<Partial<SexeWithCounts>>;
  SexesPaginatedResult: ResolverTypeWrapper<Partial<SexesPaginatedResult>>;
  SortOrder: ResolverTypeWrapper<Partial<SortOrder>>;
  String: ResolverTypeWrapper<Partial<Scalars['String']>>;
  Version: ResolverTypeWrapper<Partial<Version>>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Age: Partial<Age>;
  AgeWithCounts: Partial<AgeWithCounts>;
  AgesPaginatedResult: Partial<AgesPaginatedResult>;
  Boolean: Partial<Scalars['Boolean']>;
  Classe: Partial<Classe>;
  ClasseWithCounts: Partial<ClasseWithCounts>;
  ClassesPaginatedResult: Partial<ClassesPaginatedResult>;
  Commune: Partial<Commune>;
  CommuneWithCounts: Partial<CommuneWithCounts>;
  CommunesPaginatedResult: Partial<CommunesPaginatedResult>;
  Comportement: Partial<Comportement>;
  ComportementWithCounts: Partial<ComportementWithCounts>;
  ComportementsPaginatedResult: Partial<ComportementsPaginatedResult>;
  Coordinates: Partial<Coordinates>;
  Departement: Partial<Departement>;
  DepartementWithCounts: Partial<DepartementWithCounts>;
  DepartementsPaginatedResult: Partial<DepartementsPaginatedResult>;
  Donnee: Partial<Donnee>;
  DonneeNavigationData: Partial<DonneeNavigationData>;
  DonneeResult: Partial<DonneeResult>;
  Espece: Partial<Espece>;
  EspeceWithCounts: Partial<EspeceWithCounts>;
  EspecesPaginatedResult: Partial<EspecesPaginatedResult>;
  EstimationDistance: Partial<EstimationDistance>;
  EstimationDistanceWithCounts: Partial<EstimationDistanceWithCounts>;
  EstimationNombre: Partial<EstimationNombre>;
  EstimationNombreWithCounts: Partial<EstimationNombreWithCounts>;
  EstimationsDistancePaginatedResult: Partial<EstimationsDistancePaginatedResult>;
  EstimationsNombrePaginatedResult: Partial<EstimationsNombrePaginatedResult>;
  FindParams: Partial<FindParams>;
  Float: Partial<Scalars['Float']>;
  InputAge: Partial<InputAge>;
  InputClasse: Partial<InputClasse>;
  InputCommune: Partial<InputCommune>;
  InputComportement: Partial<InputComportement>;
  InputDepartement: Partial<InputDepartement>;
  InputEspece: Partial<InputEspece>;
  InputEstimationDistance: Partial<InputEstimationDistance>;
  InputEstimationNombre: Partial<InputEstimationNombre>;
  InputLieuDit: Partial<InputLieuDit>;
  InputMeteo: Partial<InputMeteo>;
  InputMilieu: Partial<InputMilieu>;
  InputObservateur: Partial<InputObservateur>;
  InputSettings: Partial<InputSettings>;
  InputSexe: Partial<InputSexe>;
  Int: Partial<Scalars['Int']>;
  Inventaire: Partial<Inventaire>;
  LieuDit: Partial<LieuDit>;
  LieuDitWithCounts: Partial<LieuDitWithCounts>;
  LieuxDitsPaginatedResult: Partial<LieuxDitsPaginatedResult>;
  Meteo: Partial<Meteo>;
  MeteoWithCounts: Partial<MeteoWithCounts>;
  MeteosPaginatedResult: Partial<MeteosPaginatedResult>;
  Milieu: Partial<Milieu>;
  MilieuWithCounts: Partial<MilieuWithCounts>;
  MilieuxPaginatedResult: Partial<MilieuxPaginatedResult>;
  Mutation: {};
  Observateur: Partial<Observateur>;
  ObservateurWithCounts: Partial<ObservateurWithCounts>;
  ObservateursPaginatedResult: Partial<ObservateursPaginatedResult>;
  PaginatedResult: ResolversParentTypes['AgesPaginatedResult'] | ResolversParentTypes['ClassesPaginatedResult'] | ResolversParentTypes['CommunesPaginatedResult'] | ResolversParentTypes['ComportementsPaginatedResult'] | ResolversParentTypes['DepartementsPaginatedResult'] | ResolversParentTypes['EspecesPaginatedResult'] | ResolversParentTypes['EstimationsDistancePaginatedResult'] | ResolversParentTypes['EstimationsNombrePaginatedResult'] | ResolversParentTypes['LieuxDitsPaginatedResult'] | ResolversParentTypes['MeteosPaginatedResult'] | ResolversParentTypes['MilieuxPaginatedResult'] | ResolversParentTypes['ObservateursPaginatedResult'] | ResolversParentTypes['PaginatedSearchDonneesResult'] | ResolversParentTypes['SexesPaginatedResult'];
  PaginatedSearchDonneesResult: Partial<PaginatedSearchDonneesResult>;
  Query: {};
  SearchDonneeCriteria: Partial<SearchDonneeCriteria>;
  SearchDonneeParams: Partial<SearchDonneeParams>;
  SearchParams: Partial<SearchParams>;
  Settings: Partial<Settings>;
  Sexe: Partial<Sexe>;
  SexeWithCounts: Partial<SexeWithCounts>;
  SexesPaginatedResult: Partial<SexesPaginatedResult>;
  String: Partial<Scalars['String']>;
  Version: Partial<Version>;
};

export type AgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Age'] = ResolversParentTypes['Age']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgeWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['AgeWithCounts'] = ResolversParentTypes['AgeWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgesPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['AgesPaginatedResult'] = ResolversParentTypes['AgesPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['AgeWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClasseResolvers<ContextType = any, ParentType extends ResolversParentTypes['Classe'] = ResolversParentTypes['Classe']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClasseWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClasseWithCounts'] = ResolversParentTypes['ClasseWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbEspeces?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommuneWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommuneWithCounts'] = ResolversParentTypes['CommuneWithCounts']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  departement?: Resolver<ResolversTypes['Departement'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbLieuxDits?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nom?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ComportementWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ComportementWithCounts'] = ResolversParentTypes['ComportementWithCounts']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nicheur?: Resolver<Maybe<ResolversTypes['Nicheur']>, ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DepartementWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['DepartementWithCounts'] = ResolversParentTypes['DepartementWithCounts']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbCommunes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbLieuxDits?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  comportements?: Resolver<Array<Maybe<ResolversTypes['Comportement']>>, ParentType, ContextType>;
  distance?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  espece?: Resolver<ResolversTypes['Espece'], ParentType, ContextType>;
  estimationDistance?: Resolver<Maybe<ResolversTypes['EstimationDistance']>, ParentType, ContextType>;
  estimationNombre?: Resolver<Maybe<ResolversTypes['EstimationNombre']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  inventaire?: Resolver<ResolversTypes['Inventaire'], ParentType, ContextType>;
  milieux?: Resolver<Array<Maybe<ResolversTypes['Milieu']>>, ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EspeceWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['EspeceWithCounts'] = ResolversParentTypes['EspeceWithCounts']> = {
  classe?: Resolver<ResolversTypes['Classe'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nomFrancais?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nomLatin?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimationDistanceWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['EstimationDistanceWithCounts'] = ResolversParentTypes['EstimationDistanceWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimationNombreResolvers<ContextType = any, ParentType extends ResolversParentTypes['EstimationNombre'] = ResolversParentTypes['EstimationNombre']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nonCompte?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimationNombreWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['EstimationNombreWithCounts'] = ResolversParentTypes['EstimationNombreWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nonCompte?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeteoWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['MeteoWithCounts'] = ResolversParentTypes['MeteoWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MilieuWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['MilieuWithCounts'] = ResolversParentTypes['MilieuWithCounts']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  deleteEspece?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteEspeceArgs, 'id'>>;
  deleteEstimationDistance?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteEstimationDistanceArgs, 'id'>>;
  deleteEstimationNombre?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteEstimationNombreArgs, 'id'>>;
  deleteLieuDit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteLieuDitArgs, 'id'>>;
  deleteMeteo?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteMeteoArgs, 'id'>>;
  deleteMilieu?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteMilieuArgs, 'id'>>;
  deleteObservateur?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteObservateurArgs, 'id'>>;
  deleteSexe?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteSexeArgs, 'id'>>;
  updateSettings?: Resolver<Maybe<ResolversTypes['Settings']>, ParentType, ContextType, RequireFields<MutationUpdateSettingsArgs, never>>;
  upsertAge?: Resolver<Maybe<ResolversTypes['Age']>, ParentType, ContextType, RequireFields<MutationUpsertAgeArgs, 'data'>>;
  upsertClasse?: Resolver<Maybe<ResolversTypes['Classe']>, ParentType, ContextType, RequireFields<MutationUpsertClasseArgs, 'data'>>;
  upsertCommune?: Resolver<Maybe<ResolversTypes['Commune']>, ParentType, ContextType, RequireFields<MutationUpsertCommuneArgs, 'data'>>;
  upsertComportement?: Resolver<Maybe<ResolversTypes['Comportement']>, ParentType, ContextType, RequireFields<MutationUpsertComportementArgs, 'data'>>;
  upsertDepartement?: Resolver<Maybe<ResolversTypes['Departement']>, ParentType, ContextType, RequireFields<MutationUpsertDepartementArgs, 'data'>>;
  upsertEspece?: Resolver<Maybe<ResolversTypes['Espece']>, ParentType, ContextType, RequireFields<MutationUpsertEspeceArgs, 'data'>>;
  upsertEstimationDistance?: Resolver<Maybe<ResolversTypes['EstimationDistance']>, ParentType, ContextType, RequireFields<MutationUpsertEstimationDistanceArgs, 'data'>>;
  upsertEstimationNombre?: Resolver<Maybe<ResolversTypes['EstimationNombre']>, ParentType, ContextType, RequireFields<MutationUpsertEstimationNombreArgs, 'data'>>;
  upsertLieuDit?: Resolver<Maybe<ResolversTypes['LieuDit']>, ParentType, ContextType, RequireFields<MutationUpsertLieuDitArgs, 'data'>>;
  upsertMeteo?: Resolver<Maybe<ResolversTypes['Meteo']>, ParentType, ContextType, RequireFields<MutationUpsertMeteoArgs, 'data'>>;
  upsertMilieu?: Resolver<Maybe<ResolversTypes['Milieu']>, ParentType, ContextType, RequireFields<MutationUpsertMilieuArgs, 'data'>>;
  upsertObservateur?: Resolver<Maybe<ResolversTypes['Observateur']>, ParentType, ContextType, RequireFields<MutationUpsertObservateurArgs, 'data'>>;
  upsertSexe?: Resolver<Maybe<ResolversTypes['Sexe']>, ParentType, ContextType, RequireFields<MutationUpsertSexeArgs, 'data'>>;
};

export type ObservateurResolvers<ContextType = any, ParentType extends ResolversParentTypes['Observateur'] = ResolversParentTypes['Observateur']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ObservateurWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ObservateurWithCounts'] = ResolversParentTypes['ObservateurWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ObservateursPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ObservateursPaginatedResult'] = ResolversParentTypes['ObservateursPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['ObservateurWithCounts']>>>, ParentType, ContextType>;
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
  ages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Age']>>>, ParentType, ContextType, RequireFields<QueryAgesArgs, never>>;
  classe?: Resolver<Maybe<ResolversTypes['Classe']>, ParentType, ContextType, RequireFields<QueryClasseArgs, 'id'>>;
  classes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Classe']>>>, ParentType, ContextType, RequireFields<QueryClassesArgs, never>>;
  commune?: Resolver<Maybe<ResolversTypes['Commune']>, ParentType, ContextType, RequireFields<QueryCommuneArgs, 'id'>>;
  communes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Commune']>>>, ParentType, ContextType, RequireFields<QueryCommunesArgs, never>>;
  comportement?: Resolver<Maybe<ResolversTypes['Comportement']>, ParentType, ContextType, RequireFields<QueryComportementArgs, 'id'>>;
  comportementList?: Resolver<Maybe<Array<Maybe<ResolversTypes['Comportement']>>>, ParentType, ContextType, RequireFields<QueryComportementListArgs, 'ids'>>;
  comportements?: Resolver<Maybe<Array<Maybe<ResolversTypes['Comportement']>>>, ParentType, ContextType, RequireFields<QueryComportementsArgs, never>>;
  departement?: Resolver<Maybe<ResolversTypes['Departement']>, ParentType, ContextType, RequireFields<QueryDepartementArgs, 'id'>>;
  departements?: Resolver<Maybe<Array<Maybe<ResolversTypes['Departement']>>>, ParentType, ContextType, RequireFields<QueryDepartementsArgs, never>>;
  donnee?: Resolver<Maybe<ResolversTypes['DonneeResult']>, ParentType, ContextType, RequireFields<QueryDonneeArgs, 'id'>>;
  espece?: Resolver<Maybe<ResolversTypes['Espece']>, ParentType, ContextType, RequireFields<QueryEspeceArgs, 'id'>>;
  especes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Espece']>>>, ParentType, ContextType, RequireFields<QueryEspecesArgs, never>>;
  estimationDistance?: Resolver<Maybe<ResolversTypes['EstimationDistance']>, ParentType, ContextType, RequireFields<QueryEstimationDistanceArgs, 'id'>>;
  estimationNombre?: Resolver<Maybe<ResolversTypes['EstimationNombre']>, ParentType, ContextType, RequireFields<QueryEstimationNombreArgs, 'id'>>;
  estimationsDistance?: Resolver<Maybe<Array<Maybe<ResolversTypes['EstimationDistance']>>>, ParentType, ContextType, RequireFields<QueryEstimationsDistanceArgs, never>>;
  estimationsNombre?: Resolver<Maybe<Array<Maybe<ResolversTypes['EstimationNombre']>>>, ParentType, ContextType, RequireFields<QueryEstimationsNombreArgs, never>>;
  exportAges?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportClasses?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportCommunes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportComportements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportDepartements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportDonnees?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryExportDonneesArgs, never>>;
  exportEspeces?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportEstimationsDistance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportEstimationsNombre?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportLieuxDits?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportMeteos?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportMilieux?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportObservateurs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  exportSexes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  inventaire?: Resolver<Maybe<ResolversTypes['Inventaire']>, ParentType, ContextType, RequireFields<QueryInventaireArgs, 'id'>>;
  lastDonneeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lieuDit?: Resolver<Maybe<ResolversTypes['LieuDit']>, ParentType, ContextType, RequireFields<QueryLieuDitArgs, 'id'>>;
  lieuxDits?: Resolver<Maybe<Array<Maybe<ResolversTypes['LieuDit']>>>, ParentType, ContextType, RequireFields<QueryLieuxDitsArgs, never>>;
  meteo?: Resolver<Maybe<ResolversTypes['Meteo']>, ParentType, ContextType, RequireFields<QueryMeteoArgs, 'id'>>;
  meteoList?: Resolver<Maybe<Array<Maybe<ResolversTypes['Meteo']>>>, ParentType, ContextType, RequireFields<QueryMeteoListArgs, 'ids'>>;
  meteos?: Resolver<Maybe<Array<Maybe<ResolversTypes['Meteo']>>>, ParentType, ContextType>;
  milieu?: Resolver<Maybe<ResolversTypes['Milieu']>, ParentType, ContextType, RequireFields<QueryMilieuArgs, 'id'>>;
  milieuList?: Resolver<Maybe<Array<Maybe<ResolversTypes['Milieu']>>>, ParentType, ContextType, RequireFields<QueryMilieuListArgs, 'ids'>>;
  milieux?: Resolver<Maybe<Array<Maybe<ResolversTypes['Milieu']>>>, ParentType, ContextType, RequireFields<QueryMilieuxArgs, never>>;
  nextRegroupement?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  observateur?: Resolver<Maybe<ResolversTypes['Observateur']>, ParentType, ContextType, RequireFields<QueryObservateurArgs, 'id'>>;
  observateurList?: Resolver<Maybe<Array<Maybe<ResolversTypes['Observateur']>>>, ParentType, ContextType, RequireFields<QueryObservateurListArgs, 'ids'>>;
  observateurs?: Resolver<Maybe<Array<Maybe<ResolversTypes['Observateur']>>>, ParentType, ContextType, RequireFields<QueryObservateursArgs, never>>;
  paginatedAges?: Resolver<Maybe<ResolversTypes['AgesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedAgesArgs, never>>;
  paginatedClasses?: Resolver<Maybe<ResolversTypes['ClassesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedClassesArgs, never>>;
  paginatedCommunes?: Resolver<Maybe<ResolversTypes['CommunesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedCommunesArgs, never>>;
  paginatedComportements?: Resolver<Maybe<ResolversTypes['ComportementsPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedComportementsArgs, never>>;
  paginatedDepartements?: Resolver<Maybe<ResolversTypes['DepartementsPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedDepartementsArgs, never>>;
  paginatedEspeces?: Resolver<Maybe<ResolversTypes['EspecesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedEspecesArgs, never>>;
  paginatedEstimationsDistance?: Resolver<Maybe<ResolversTypes['EstimationsDistancePaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedEstimationsDistanceArgs, never>>;
  paginatedEstimationsNombre?: Resolver<Maybe<ResolversTypes['EstimationsNombrePaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedEstimationsNombreArgs, never>>;
  paginatedLieuxdits?: Resolver<Maybe<ResolversTypes['LieuxDitsPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedLieuxditsArgs, never>>;
  paginatedMeteos?: Resolver<Maybe<ResolversTypes['MeteosPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedMeteosArgs, never>>;
  paginatedMilieux?: Resolver<Maybe<ResolversTypes['MilieuxPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedMilieuxArgs, never>>;
  paginatedObservateurs?: Resolver<Maybe<ResolversTypes['ObservateursPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedObservateursArgs, never>>;
  paginatedSearchDonnees?: Resolver<Maybe<ResolversTypes['PaginatedSearchDonneesResult']>, ParentType, ContextType, RequireFields<QueryPaginatedSearchDonneesArgs, never>>;
  paginatedSearchEspeces?: Resolver<Maybe<ResolversTypes['EspecesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedSearchEspecesArgs, never>>;
  paginatedSexes?: Resolver<Maybe<ResolversTypes['SexesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedSexesArgs, never>>;
  settings?: Resolver<Maybe<ResolversTypes['Settings']>, ParentType, ContextType>;
  sexe?: Resolver<Maybe<ResolversTypes['Sexe']>, ParentType, ContextType, RequireFields<QuerySexeArgs, 'id'>>;
  sexes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Sexe']>>>, ParentType, ContextType, RequireFields<QuerySexesArgs, never>>;
  version?: Resolver<Maybe<ResolversTypes['Version']>, ParentType, ContextType>;
};

export type SettingsResolvers<ContextType = any, ParentType extends ResolversParentTypes['Settings'] = ResolversParentTypes['Settings']> = {
  areAssociesDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  coordinatesSystem?: Resolver<ResolversTypes['CoordinatesSystemType'], ParentType, ContextType>;
  defaultAge?: Resolver<ResolversTypes['Age'], ParentType, ContextType>;
  defaultDepartement?: Resolver<ResolversTypes['Departement'], ParentType, ContextType>;
  defaultEstimationNombre?: Resolver<ResolversTypes['EstimationNombre'], ParentType, ContextType>;
  defaultNombre?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  defaultObservateur?: Resolver<ResolversTypes['Observateur'], ParentType, ContextType>;
  defaultSexe?: Resolver<ResolversTypes['Sexe'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isDistanceDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isMeteoDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isRegroupementDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SexeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Sexe'] = ResolversParentTypes['Sexe']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SexeWithCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['SexeWithCounts'] = ResolversParentTypes['SexeWithCounts']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SexesPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SexesPaginatedResult'] = ResolversParentTypes['SexesPaginatedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['SexeWithCounts']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Version'] = ResolversParentTypes['Version']> = {
  application?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  database?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Age?: AgeResolvers<ContextType>;
  AgeWithCounts?: AgeWithCountsResolvers<ContextType>;
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
  ObservateurWithCounts?: ObservateurWithCountsResolvers<ContextType>;
  ObservateursPaginatedResult?: ObservateursPaginatedResultResolvers<ContextType>;
  PaginatedResult?: PaginatedResultResolvers<ContextType>;
  PaginatedSearchDonneesResult?: PaginatedSearchDonneesResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  Sexe?: SexeResolvers<ContextType>;
  SexeWithCounts?: SexeWithCountsResolvers<ContextType>;
  SexesPaginatedResult?: SexesPaginatedResultResolvers<ContextType>;
  Version?: VersionResolvers<ContextType>;
};

