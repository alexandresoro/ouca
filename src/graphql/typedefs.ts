import { gql } from "apollo-server";

export default gql`

  input InputSettings {
    id: Int!
    areAssociesDisplayed: Boolean!
    isMeteoDisplayed: Boolean!
    isDistanceDisplayed: Boolean!
    isRegroupementDisplayed: Boolean!
    defaultDepartement: Int!
    defaultObservateur: Int!
    coordinatesSystem: CoordinatesSystemType!
    defaultEstimationNombre: Int!
    defaultNombre: Int!
    defaultSexe: Int!
    defaultAge: Int!
  }

  type Settings {
    id: Int!
    areAssociesDisplayed: Boolean!
    isMeteoDisplayed: Boolean!
    isDistanceDisplayed: Boolean!
    isRegroupementDisplayed: Boolean!
    defaultDepartement: Departement!
    defaultObservateur: Observateur!
    coordinatesSystem: CoordinatesSystemType!
    defaultEstimationNombre: EstimationNombre!
    defaultNombre: Int!
    defaultSexe: Sexe!
    defaultAge: Age!
  }

  enum Nicheur {
    possible
    probable
    certain
  }

  enum CoordinatesSystemType {
    gps
    lambert93
  }

  type Comportement {
    id: Int!
    nbDonnees: Int
    code: String!
    libelle: String!
    nicheur: Nicheur
  }

  type Departement {
    id: Int!
    code: String!
    nbCommunes: Int
    nbLieuxDits: Int
    nbDonnees: Int
  }

  type Observateur {
    id: Int!
    nbDonnees: Int
    libelle: String!
  }

  type Classe {
    id: Int!
    nbDonnees: Int
    nbEspeces: Int
    libelle: String!
  }

  type Commune {
    id: Int!
    code: Int!    
    nom: String!
    departement: Departement!
    nbLieuxDits: Int
    nbDonnees: Int
  }

  type Espece {
    id: Int!
    nbDonnees: Int
    code: String!
    nomFrancais: String!
    nomLatin: String!
    classe: Classe!
  }

  type EstimationDistance {
    id: Int!
    nbDonnees: Int
    libelle: String!
  }

  type EstimationNombre {
    id: Int!
    nbDonnees: Int
    libelle: String!
    nonCompte: Boolean!
  }

  type Meteo {
    id: Int!
    nbDonnees: Int
    libelle: String!
  }

  type LieuDit {
    id: Int!          
    nom: String!
    altitude: Int!
    longitude: Float!
    latitude: Float!
    coordinatesSystem: CoordinatesSystemType!
    commune: Commune!
    nbDonnees: Int
  }

  type Milieu {
    id: Int!
    nbDonnees: Int
    code: String!
    libelle: String!
  }

  type Sexe {
    id: Int!
    nbDonnees: Int
    libelle: String!
  }

  type Age {
    id: Int!
    nbDonnees: Int
    libelle: String!
  }

  type Version {
    database: Int!
    application: Int!
  }


  #
  # Args
  #
  input SearchParams {
    q: String
    pageNumber: Int
    pageSize: Int
  }

  enum SortOrder {
    asc
    desc
  }

  enum EntitesAvecLibelleOrderBy {
    id
    libelle
    nbDonnees
  }

  enum ClassesOrderBy {
    id
    libelle
    nbEspeces
    nbDonnees
  }

  enum CommunesOrderBy {
    id
    code
    nom
    departement
    nbLieuxDits
    nbDonnees
  }

  enum ComportementsOrderBy {
    id
    code
    libelle
    nbDonnees
    nicheur
  }

  enum DepartementsOrderBy {
    id
    code
    nbCommunes
    nbLieuxDits
    nbDonnees
  }

  enum EstimationNombreOrderBy {
    id
    libelle
    nonCompte
    nbDonnees
  }

  enum EspecesOrderBy {
    id
    code
    nomFrancais
    nomLatin
    nomClasse
    nbDonnees
  }

  enum LieuxDitsOrderBy {
    id         
    nom
    altitude
    longitude
    latitude
    codeCommune
    nomCommune
    departement
    nbDonnees
  }

  enum MilieuxOrderBy {
    id
    code
    libelle
    nbDonnees
  }

  #
  # Results
  #
  interface PaginatedResult {
    count: Int!
  }

  type AgesPaginatedResult implements PaginatedResult {
    result: [Age]
    count: Int!
  }
  
  type ClassesPaginatedResult implements PaginatedResult {
    result: [Classe]
    count: Int!
  }

  type CommunesPaginatedResult implements PaginatedResult {
    result: [Commune]
    count: Int!
  }

  type ComportementsPaginatedResult implements PaginatedResult {
    result: [Comportement]
    count: Int!
  }

  type DepartementsPaginatedResult implements PaginatedResult {
    result: [Departement]
    count: Int!
  }

  type EspecesPaginatedResult implements PaginatedResult {
    result: [Espece]
    count: Int!
  }

  type EstimationsDistancePaginatedResult implements PaginatedResult {
    result: [EstimationDistance]
    count: Int!
  }

  type EstimationsNombrePaginatedResult implements PaginatedResult {
    result: [EstimationNombre]
    count: Int!
  }

  type LieuxDitsPaginatedResult implements PaginatedResult {
    result: [LieuDit]
    count: Int!
  }

  type MeteosPaginatedResult implements PaginatedResult {
    result: [Meteo]
    count: Int!
  }

  type MilieuxPaginatedResult implements PaginatedResult {
    result: [Milieu]
    count: Int!
  }

  type ObservateursPaginatedResult implements PaginatedResult {
    result: [Observateur]
    count: Int!
  }

  type SexesPaginatedResult implements PaginatedResult {
    result: [Sexe]
    count: Int!
  }

  type Query {
    ages(searchParams: SearchParams, orderBy: EntitesAvecLibelleOrderBy, sortOrder: SortOrder): AgesPaginatedResult
    classes(searchParams: SearchParams, orderBy: ClassesOrderBy, sortOrder: SortOrder): ClassesPaginatedResult
    communes(searchParams: SearchParams, orderBy: CommunesOrderBy, sortOrder: SortOrder): CommunesPaginatedResult
    comportements(searchParams: SearchParams, orderBy: ComportementsOrderBy, sortOrder: SortOrder): ComportementsPaginatedResult
    departements(searchParams: SearchParams, orderBy: DepartementsOrderBy, sortOrder: SortOrder): DepartementsPaginatedResult
    especes(searchParams: SearchParams, orderBy: EspecesOrderBy, sortOrder: SortOrder): EspecesPaginatedResult
    estimationsDistance(searchParams: SearchParams, orderBy: EntitesAvecLibelleOrderBy, sortOrder: SortOrder): EstimationsDistancePaginatedResult
    estimationsNombre(searchParams: SearchParams, orderBy: EstimationNombreOrderBy, sortOrder: SortOrder): EstimationsNombrePaginatedResult
    lieuxdits(searchParams: SearchParams, orderBy: LieuxDitsOrderBy, sortOrder: SortOrder): LieuxDitsPaginatedResult
    meteos(searchParams: SearchParams, orderBy: EntitesAvecLibelleOrderBy, sortOrder: SortOrder): MeteosPaginatedResult
    milieux(searchParams: SearchParams, orderBy: MilieuxOrderBy, sortOrder: SortOrder): MilieuxPaginatedResult
    observateurs(searchParams: SearchParams, orderBy: EntitesAvecLibelleOrderBy, sortOrder: SortOrder): ObservateursPaginatedResult
    sexes(searchParams: SearchParams, orderBy: EntitesAvecLibelleOrderBy, sortOrder: SortOrder): SexesPaginatedResult
    settings: Settings
    version: Version
  }

  type Mutation {
    updateSettings(appConfiguration: InputSettings): Settings
  }

`;
