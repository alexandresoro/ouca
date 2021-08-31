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
  nbDonnees?: Maybe<Scalars['Int']>;
  libelle: Scalars['String'];
};

export type Classe = {
  __typename?: 'Classe';
  id: Scalars['Int'];
  nbDonnees?: Maybe<Scalars['Int']>;
  nbEspeces?: Maybe<Scalars['Int']>;
  libelle: Scalars['String'];
};

export const ClassesOrderBy = {
  Id: 'id',
  Libelle: 'libelle'
} as const;

export type ClassesOrderBy = typeof ClassesOrderBy[keyof typeof ClassesOrderBy];
export type ClassesPaginatedResult = PaginatedResult & {
  __typename?: 'ClassesPaginatedResult';
  result?: Maybe<Array<Maybe<Classe>>>;
  count: Scalars['Int'];
};

export const CoordinatesSystemType = {
  Gps: 'gps',
  Lambert93: 'lambert93'
} as const;

export type CoordinatesSystemType = typeof CoordinatesSystemType[keyof typeof CoordinatesSystemType];
export type Departement = {
  __typename?: 'Departement';
  id: Scalars['Int'];
  nbDonnees?: Maybe<Scalars['Int']>;
  code: Scalars['String'];
  nbCommunes?: Maybe<Scalars['Int']>;
  nbLieuxDits?: Maybe<Scalars['Int']>;
};

export type Espece = {
  __typename?: 'Espece';
  id: Scalars['Int'];
  nbDonnees?: Maybe<Scalars['Int']>;
  code: Scalars['String'];
  nomFrancais: Scalars['String'];
  nomLatin: Scalars['String'];
  classe: Classe;
};

export const EspecesOrderBy = {
  Id: 'id',
  Code: 'code',
  NomFrancais: 'nomFrancais',
  NomLatin: 'nomLatin',
  NomClasse: 'nomClasse',
  NbDonnees: 'nbDonnees'
} as const;

export type EspecesOrderBy = typeof EspecesOrderBy[keyof typeof EspecesOrderBy];
export type EspecesPaginatedResult = PaginatedResult & {
  __typename?: 'EspecesPaginatedResult';
  result?: Maybe<Array<Maybe<Espece>>>;
  count: Scalars['Int'];
};

export type EstimationNombre = {
  __typename?: 'EstimationNombre';
  id: Scalars['Int'];
  nbDonnees?: Maybe<Scalars['Int']>;
  libelle: Scalars['String'];
  nonCompte: Scalars['Boolean'];
};

export type InputSettings = {
  id: Scalars['Int'];
  areAssociesDisplayed: Scalars['Boolean'];
  isMeteoDisplayed: Scalars['Boolean'];
  isDistanceDisplayed: Scalars['Boolean'];
  isRegroupementDisplayed: Scalars['Boolean'];
  defaultDepartement: Scalars['Int'];
  defaultObservateur: Scalars['Int'];
  coordinatesSystem: CoordinatesSystemType;
  defaultEstimationNombre: Scalars['Int'];
  defaultNombre: Scalars['Int'];
  defaultSexe: Scalars['Int'];
  defaultAge: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  updateSettings?: Maybe<Settings>;
};


export type MutationUpdateSettingsArgs = {
  appConfiguration?: Maybe<InputSettings>;
};

export type Observateur = {
  __typename?: 'Observateur';
  id: Scalars['Int'];
  nbDonnees?: Maybe<Scalars['Int']>;
  libelle: Scalars['String'];
};

export type PaginatedResult = {
  count: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  classes?: Maybe<ClassesPaginatedResult>;
  especes?: Maybe<EspecesPaginatedResult>;
  settings?: Maybe<Settings>;
  version?: Maybe<Version>;
};


export type QueryClassesArgs = {
  q?: Maybe<Scalars['String']>;
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<ClassesOrderBy>;
  sortOrder?: Maybe<SortOrder>;
};


export type QueryEspecesArgs = {
  q?: Maybe<Scalars['String']>;
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<EspecesOrderBy>;
  sortOrder?: Maybe<SortOrder>;
};

export type Settings = {
  __typename?: 'Settings';
  id: Scalars['Int'];
  areAssociesDisplayed: Scalars['Boolean'];
  isMeteoDisplayed: Scalars['Boolean'];
  isDistanceDisplayed: Scalars['Boolean'];
  isRegroupementDisplayed: Scalars['Boolean'];
  defaultDepartement: Departement;
  defaultObservateur: Observateur;
  coordinatesSystem: CoordinatesSystemType;
  defaultEstimationNombre: EstimationNombre;
  defaultNombre: Scalars['Int'];
  defaultSexe: Sexe;
  defaultAge: Age;
};

export type Sexe = {
  __typename?: 'Sexe';
  id: Scalars['Int'];
  nbDonnees?: Maybe<Scalars['Int']>;
  libelle: Scalars['String'];
};

export const SortOrder = {
  Asc: 'asc',
  Desc: 'desc'
} as const;

export type SortOrder = typeof SortOrder[keyof typeof SortOrder];
export type Version = {
  __typename?: 'Version';
  database: Scalars['Int'];
  application: Scalars['Int'];
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
  Int: ResolverTypeWrapper<Scalars['Int']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Classe: ResolverTypeWrapper<Classe>;
  ClassesOrderBy: ClassesOrderBy;
  ClassesPaginatedResult: ResolverTypeWrapper<ClassesPaginatedResult>;
  CoordinatesSystemType: CoordinatesSystemType;
  Departement: ResolverTypeWrapper<Departement>;
  Espece: ResolverTypeWrapper<Espece>;
  EspecesOrderBy: EspecesOrderBy;
  EspecesPaginatedResult: ResolverTypeWrapper<EspecesPaginatedResult>;
  EstimationNombre: ResolverTypeWrapper<EstimationNombre>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  InputSettings: InputSettings;
  Mutation: ResolverTypeWrapper<{}>;
  Observateur: ResolverTypeWrapper<Observateur>;
  PaginatedResult: ResolversTypes['ClassesPaginatedResult'] | ResolversTypes['EspecesPaginatedResult'];
  Query: ResolverTypeWrapper<{}>;
  Settings: ResolverTypeWrapper<Settings>;
  Sexe: ResolverTypeWrapper<Sexe>;
  SortOrder: SortOrder;
  Version: ResolverTypeWrapper<Version>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Age: Age;
  Int: Scalars['Int'];
  String: Scalars['String'];
  Classe: Classe;
  ClassesPaginatedResult: ClassesPaginatedResult;
  Departement: Departement;
  Espece: Espece;
  EspecesPaginatedResult: EspecesPaginatedResult;
  EstimationNombre: EstimationNombre;
  Boolean: Scalars['Boolean'];
  InputSettings: InputSettings;
  Mutation: {};
  Observateur: Observateur;
  PaginatedResult: ResolversParentTypes['ClassesPaginatedResult'] | ResolversParentTypes['EspecesPaginatedResult'];
  Query: {};
  Settings: Settings;
  Sexe: Sexe;
  Version: Version;
};

export type AgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Age'] = ResolversParentTypes['Age']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClasseResolvers<ContextType = any, ParentType extends ResolversParentTypes['Classe'] = ResolversParentTypes['Classe']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbEspeces?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClassesPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClassesPaginatedResult'] = ResolversParentTypes['ClassesPaginatedResult']> = {
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['Classe']>>>, ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DepartementResolvers<ContextType = any, ParentType extends ResolversParentTypes['Departement'] = ResolversParentTypes['Departement']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nbCommunes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nbLieuxDits?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EspeceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Espece'] = ResolversParentTypes['Espece']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nomFrancais?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nomLatin?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  classe?: Resolver<ResolversTypes['Classe'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EspecesPaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['EspecesPaginatedResult'] = ResolversParentTypes['EspecesPaginatedResult']> = {
  result?: Resolver<Maybe<Array<Maybe<ResolversTypes['Espece']>>>, ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimationNombreResolvers<ContextType = any, ParentType extends ResolversParentTypes['EstimationNombre'] = ResolversParentTypes['EstimationNombre']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nonCompte?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  updateSettings?: Resolver<Maybe<ResolversTypes['Settings']>, ParentType, ContextType, RequireFields<MutationUpdateSettingsArgs, never>>;
};

export type ObservateurResolvers<ContextType = any, ParentType extends ResolversParentTypes['Observateur'] = ResolversParentTypes['Observateur']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedResult'] = ResolversParentTypes['PaginatedResult']> = {
  __resolveType: TypeResolveFn<'ClassesPaginatedResult' | 'EspecesPaginatedResult', ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  classes?: Resolver<Maybe<ResolversTypes['ClassesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryClassesArgs, never>>;
  especes?: Resolver<Maybe<ResolversTypes['EspecesPaginatedResult']>, ParentType, ContextType, RequireFields<QueryEspecesArgs, never>>;
  settings?: Resolver<Maybe<ResolversTypes['Settings']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Version']>, ParentType, ContextType>;
};

export type SettingsResolvers<ContextType = any, ParentType extends ResolversParentTypes['Settings'] = ResolversParentTypes['Settings']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  areAssociesDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isMeteoDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isDistanceDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isRegroupementDisplayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  defaultDepartement?: Resolver<ResolversTypes['Departement'], ParentType, ContextType>;
  defaultObservateur?: Resolver<ResolversTypes['Observateur'], ParentType, ContextType>;
  coordinatesSystem?: Resolver<ResolversTypes['CoordinatesSystemType'], ParentType, ContextType>;
  defaultEstimationNombre?: Resolver<ResolversTypes['EstimationNombre'], ParentType, ContextType>;
  defaultNombre?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  defaultSexe?: Resolver<ResolversTypes['Sexe'], ParentType, ContextType>;
  defaultAge?: Resolver<ResolversTypes['Age'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SexeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Sexe'] = ResolversParentTypes['Sexe']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbDonnees?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  libelle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Version'] = ResolversParentTypes['Version']> = {
  database?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  application?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Age?: AgeResolvers<ContextType>;
  Classe?: ClasseResolvers<ContextType>;
  ClassesPaginatedResult?: ClassesPaginatedResultResolvers<ContextType>;
  Departement?: DepartementResolvers<ContextType>;
  Espece?: EspeceResolvers<ContextType>;
  EspecesPaginatedResult?: EspecesPaginatedResultResolvers<ContextType>;
  EstimationNombre?: EstimationNombreResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Observateur?: ObservateurResolvers<ContextType>;
  PaginatedResult?: PaginatedResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  Sexe?: SexeResolvers<ContextType>;
  Version?: VersionResolvers<ContextType>;
};

