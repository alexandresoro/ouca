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
  departementId: Scalars['Int'];
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

export const EntitesAvecLibelleOrderBy = {
  Id: 'id',
  Libelle: 'libelle',
  NbDonnees: 'nbDonnees'
} as const;

export type EntitesAvecLibelleOrderBy = typeof EntitesAvecLibelleOrderBy[keyof typeof EntitesAvecLibelleOrderBy];
export type Espece = {
  __typename?: 'Espece';
  classeId: Scalars['Int'];
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

export type LieuDit = {
  __typename?: 'LieuDit';
  altitude: Scalars['Int'];
  communeId: Scalars['Int'];
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
  updateSettings?: Maybe<Settings>;
};


export type MutationUpdateSettingsArgs = {
  appConfiguration?: Maybe<InputSettings>;
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

export type Query = {
  __typename?: 'Query';
  ages?: Maybe<Array<Maybe<Age>>>;
  classes?: Maybe<Array<Maybe<Classe>>>;
  communes?: Maybe<Array<Maybe<Commune>>>;
  comportements?: Maybe<Array<Maybe<Comportement>>>;
  departements?: Maybe<Array<Maybe<Departement>>>;
  especes?: Maybe<Array<Maybe<Espece>>>;
  estimationsDistance?: Maybe<Array<Maybe<EstimationDistance>>>;
  estimationsNombre?: Maybe<Array<Maybe<EstimationNombre>>>;
  lastDonneeId?: Maybe<Scalars['Int']>;
  lieuxDits?: Maybe<Array<Maybe<LieuDit>>>;
  meteo?: Maybe<Meteo>;
  meteoList?: Maybe<Array<Maybe<Meteo>>>;
  meteos?: Maybe<Array<Maybe<Meteo>>>;
  milieux?: Maybe<Array<Maybe<Milieu>>>;
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
  paginatedSexes?: Maybe<SexesPaginatedResult>;
  settings?: Maybe<Settings>;
  sexes?: Maybe<Array<Maybe<Sexe>>>;
  version?: Maybe<Version>;
};


export type QueryMeteoArgs = {
  id: Scalars['Int'];
};


export type QueryMeteoListArgs = {
  ids: Array<Scalars['Int']>;
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


export type QueryPaginatedSexesArgs = {
  orderBy?: Maybe<EntitesAvecLibelleOrderBy>;
  searchParams?: Maybe<SearchParams>;
  sortOrder?: Maybe<SortOrder>;
};

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
  Age: ResolverTypeWrapper<Age>;
  AgeWithCounts: ResolverTypeWrapper<AgeWithCounts>;
  AgesPaginatedResult: ResolverTypeWrapper<AgesPaginatedResult>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Classe: ResolverTypeWrapper<Classe>;
  ClasseWithCounts: ResolverTypeWrapper<ClasseWithCounts>;
  ClassesOrderBy: ClassesOrderBy;
  ClassesPaginatedResult: ResolverTypeWrapper<ClassesPaginatedResult>;
  Commune: ResolverTypeWrapper<Commune>;
  CommuneWithCounts: ResolverTypeWrapper<CommuneWithCounts>;
  CommunesOrderBy: CommunesOrderBy;
  CommunesPaginatedResult: ResolverTypeWrapper<CommunesPaginatedResult>;
  Comportement: ResolverTypeWrapper<Comportement>;
  ComportementWithCounts: ResolverTypeWrapper<ComportementWithCounts>;
  ComportementsOrderBy: ComportementsOrderBy;
  ComportementsPaginatedResult: ResolverTypeWrapper<ComportementsPaginatedResult>;
  CoordinatesSystemType: CoordinatesSystemType;
  Departement: ResolverTypeWrapper<Departement>;
  DepartementWithCounts: ResolverTypeWrapper<DepartementWithCounts>;
  DepartementsOrderBy: DepartementsOrderBy;
  DepartementsPaginatedResult: ResolverTypeWrapper<DepartementsPaginatedResult>;
  EntitesAvecLibelleOrderBy: EntitesAvecLibelleOrderBy;
  Espece: ResolverTypeWrapper<Espece>;
  EspeceWithCounts: ResolverTypeWrapper<EspeceWithCounts>;
  EspecesOrderBy: EspecesOrderBy;
  EspecesPaginatedResult: ResolverTypeWrapper<EspecesPaginatedResult>;
  EstimationDistance: ResolverTypeWrapper<EstimationDistance>;
  EstimationDistanceWithCounts: ResolverTypeWrapper<EstimationDistanceWithCounts>;
  EstimationNombre: ResolverTypeWrapper<EstimationNombre>;
  EstimationNombreOrderBy: EstimationNombreOrderBy;
  EstimationNombreWithCounts: ResolverTypeWrapper<EstimationNombreWithCounts>;
  EstimationsDistancePaginatedResult: ResolverTypeWrapper<EstimationsDistancePaginatedResult>;
  EstimationsNombrePaginatedResult: ResolverTypeWrapper<EstimationsNombrePaginatedResult>;
  FindParams: FindParams;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  InputSettings: InputSettings;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LieuDit: ResolverTypeWrapper<LieuDit>;
  LieuDitWithCounts: ResolverTypeWrapper<LieuDitWithCounts>;
  LieuxDitsOrderBy: LieuxDitsOrderBy;
  LieuxDitsPaginatedResult: ResolverTypeWrapper<LieuxDitsPaginatedResult>;
  Meteo: ResolverTypeWrapper<Meteo>;
  MeteoWithCounts: ResolverTypeWrapper<MeteoWithCounts>;
  MeteosPaginatedResult: ResolverTypeWrapper<MeteosPaginatedResult>;
  Milieu: ResolverTypeWrapper<Milieu>;
  MilieuWithCounts: ResolverTypeWrapper<MilieuWithCounts>;
  MilieuxOrderBy: MilieuxOrderBy;
  MilieuxPaginatedResult: ResolverTypeWrapper<MilieuxPaginatedResult>;
  Mutation: ResolverTypeWrapper<{}>;
  Nicheur: Nicheur;
  Observateur: ResolverTypeWrapper<Observateur>;
  ObservateurWithCounts: ResolverTypeWrapper<ObservateurWithCounts>;
  ObservateursPaginatedResult: ResolverTypeWrapper<ObservateursPaginatedResult>;
  PaginatedResult: ResolversTypes['AgesPaginatedResult'] | ResolversTypes['ClassesPaginatedResult'] | ResolversTypes['CommunesPaginatedResult'] | ResolversTypes['ComportementsPaginatedResult'] | ResolversTypes['DepartementsPaginatedResult'] | ResolversTypes['EspecesPaginatedResult'] | ResolversTypes['EstimationsDistancePaginatedResult'] | ResolversTypes['EstimationsNombrePaginatedResult'] | ResolversTypes['LieuxDitsPaginatedResult'] | ResolversTypes['MeteosPaginatedResult'] | ResolversTypes['MilieuxPaginatedResult'] | ResolversTypes['ObservateursPaginatedResult'] | ResolversTypes['SexesPaginatedResult'];
  Query: ResolverTypeWrapper<{}>;
  SearchParams: SearchParams;
  Settings: ResolverTypeWrapper<Settings>;
  Sexe: ResolverTypeWrapper<Sexe>;
  SexeWithCounts: ResolverTypeWrapper<SexeWithCounts>;
  SexesPaginatedResult: ResolverTypeWrapper<SexesPaginatedResult>;
  SortOrder: SortOrder;
  String: ResolverTypeWrapper<Scalars['String']>;
  Version: ResolverTypeWrapper<Version>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Age: Age;
  AgeWithCounts: AgeWithCounts;
  AgesPaginatedResult: AgesPaginatedResult;
  Boolean: Scalars['Boolean'];
  Classe: Classe;
  ClasseWithCounts: ClasseWithCounts;
  ClassesPaginatedResult: ClassesPaginatedResult;
  Commune: Commune;
  CommuneWithCounts: CommuneWithCounts;
  CommunesPaginatedResult: CommunesPaginatedResult;
  Comportement: Comportement;
  ComportementWithCounts: ComportementWithCounts;
  ComportementsPaginatedResult: ComportementsPaginatedResult;
  Departement: Departement;
  DepartementWithCounts: DepartementWithCounts;
  DepartementsPaginatedResult: DepartementsPaginatedResult;
  Espece: Espece;
  EspeceWithCounts: EspeceWithCounts;
  EspecesPaginatedResult: EspecesPaginatedResult;
  EstimationDistance: EstimationDistance;
  EstimationDistanceWithCounts: EstimationDistanceWithCounts;
  EstimationNombre: EstimationNombre;
  EstimationNombreWithCounts: EstimationNombreWithCounts;
  EstimationsDistancePaginatedResult: EstimationsDistancePaginatedResult;
  EstimationsNombrePaginatedResult: EstimationsNombrePaginatedResult;
  FindParams: FindParams;
  Float: Scalars['Float'];
  InputSettings: InputSettings;
  Int: Scalars['Int'];
  LieuDit: LieuDit;
  LieuDitWithCounts: LieuDitWithCounts;
  LieuxDitsPaginatedResult: LieuxDitsPaginatedResult;
  Meteo: Meteo;
  MeteoWithCounts: MeteoWithCounts;
  MeteosPaginatedResult: MeteosPaginatedResult;
  Milieu: Milieu;
  MilieuWithCounts: MilieuWithCounts;
  MilieuxPaginatedResult: MilieuxPaginatedResult;
  Mutation: {};
  Observateur: Observateur;
  ObservateurWithCounts: ObservateurWithCounts;
  ObservateursPaginatedResult: ObservateursPaginatedResult;
  PaginatedResult: ResolversParentTypes['AgesPaginatedResult'] | ResolversParentTypes['ClassesPaginatedResult'] | ResolversParentTypes['CommunesPaginatedResult'] | ResolversParentTypes['ComportementsPaginatedResult'] | ResolversParentTypes['DepartementsPaginatedResult'] | ResolversParentTypes['EspecesPaginatedResult'] | ResolversParentTypes['EstimationsDistancePaginatedResult'] | ResolversParentTypes['EstimationsNombrePaginatedResult'] | ResolversParentTypes['LieuxDitsPaginatedResult'] | ResolversParentTypes['MeteosPaginatedResult'] | ResolversParentTypes['MilieuxPaginatedResult'] | ResolversParentTypes['ObservateursPaginatedResult'] | ResolversParentTypes['SexesPaginatedResult'];
  Query: {};
  SearchParams: SearchParams;
  Settings: Settings;
  Sexe: Sexe;
  SexeWithCounts: SexeWithCounts;
  SexesPaginatedResult: SexesPaginatedResult;
  String: Scalars['String'];
  Version: Version;
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
  departementId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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

export type EspeceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Espece'] = ResolversParentTypes['Espece']> = {
  classeId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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

export type LieuDitResolvers<ContextType = any, ParentType extends ResolversParentTypes['LieuDit'] = ResolversParentTypes['LieuDit']> = {
  altitude?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  communeId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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
  updateSettings?: Resolver<Maybe<ResolversTypes['Settings']>, ParentType, ContextType, RequireFields<MutationUpdateSettingsArgs, never>>;
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
  __resolveType: TypeResolveFn<'AgesPaginatedResult' | 'ClassesPaginatedResult' | 'CommunesPaginatedResult' | 'ComportementsPaginatedResult' | 'DepartementsPaginatedResult' | 'EspecesPaginatedResult' | 'EstimationsDistancePaginatedResult' | 'EstimationsNombrePaginatedResult' | 'LieuxDitsPaginatedResult' | 'MeteosPaginatedResult' | 'MilieuxPaginatedResult' | 'ObservateursPaginatedResult' | 'SexesPaginatedResult', ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  ages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Age']>>>, ParentType, ContextType>;
  classes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Classe']>>>, ParentType, ContextType>;
  communes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Commune']>>>, ParentType, ContextType>;
  comportements?: Resolver<Maybe<Array<Maybe<ResolversTypes['Comportement']>>>, ParentType, ContextType>;
  departements?: Resolver<Maybe<Array<Maybe<ResolversTypes['Departement']>>>, ParentType, ContextType>;
  especes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Espece']>>>, ParentType, ContextType>;
  estimationsDistance?: Resolver<Maybe<Array<Maybe<ResolversTypes['EstimationDistance']>>>, ParentType, ContextType>;
  estimationsNombre?: Resolver<Maybe<Array<Maybe<ResolversTypes['EstimationNombre']>>>, ParentType, ContextType>;
  lastDonneeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lieuxDits?: Resolver<Maybe<Array<Maybe<ResolversTypes['LieuDit']>>>, ParentType, ContextType>;
  meteo?: Resolver<Maybe<ResolversTypes['Meteo']>, ParentType, ContextType, RequireFields<QueryMeteoArgs, 'id'>>;
  meteoList?: Resolver<Maybe<Array<Maybe<ResolversTypes['Meteo']>>>, ParentType, ContextType, RequireFields<QueryMeteoListArgs, 'ids'>>;
  meteos?: Resolver<Maybe<Array<Maybe<ResolversTypes['Meteo']>>>, ParentType, ContextType>;
  milieux?: Resolver<Maybe<Array<Maybe<ResolversTypes['Milieu']>>>, ParentType, ContextType>;
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
  paginatedSexes?: Resolver<Maybe<ResolversTypes['SexesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryPaginatedSexesArgs, never>>;
  settings?: Resolver<Maybe<ResolversTypes['Settings']>, ParentType, ContextType>;
  sexes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Sexe']>>>, ParentType, ContextType>;
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
  Departement?: DepartementResolvers<ContextType>;
  DepartementWithCounts?: DepartementWithCountsResolvers<ContextType>;
  DepartementsPaginatedResult?: DepartementsPaginatedResultResolvers<ContextType>;
  Espece?: EspeceResolvers<ContextType>;
  EspeceWithCounts?: EspeceWithCountsResolvers<ContextType>;
  EspecesPaginatedResult?: EspecesPaginatedResultResolvers<ContextType>;
  EstimationDistance?: EstimationDistanceResolvers<ContextType>;
  EstimationDistanceWithCounts?: EstimationDistanceWithCountsResolvers<ContextType>;
  EstimationNombre?: EstimationNombreResolvers<ContextType>;
  EstimationNombreWithCounts?: EstimationNombreWithCountsResolvers<ContextType>;
  EstimationsDistancePaginatedResult?: EstimationsDistancePaginatedResultResolvers<ContextType>;
  EstimationsNombrePaginatedResult?: EstimationsNombrePaginatedResultResolvers<ContextType>;
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
  Query?: QueryResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  Sexe?: SexeResolvers<ContextType>;
  SexeWithCounts?: SexeWithCountsResolvers<ContextType>;
  SexesPaginatedResult?: SexesPaginatedResultResolvers<ContextType>;
  Version?: VersionResolvers<ContextType>;
};

