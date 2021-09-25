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
    code: String!
    libelle: String!
    nicheur: Nicheur
  }

  type ComportementWithCounts {
    id: Int!
    code: String!
    libelle: String!
    nicheur: Nicheur
    nbDonnees: Int
  }

  type Departement {
    id: Int!
    code: String!
  }

  type DepartementWithCounts {
    id: Int!
    code: String!
    nbCommunes: Int
    nbLieuxDits: Int
    nbDonnees: Int
  }

  type Observateur {
    id: Int!
    libelle: String!
  }

  type ObservateurWithCounts {
    id: Int!
    libelle: String!
    nbDonnees: Int
  }

  type Classe {
    id: Int!
    libelle: String!
  }

  type ClasseWithCounts {
    id: Int!
    nbDonnees: Int
    nbEspeces: Int
    libelle: String!
  }

  type Commune {
    id: Int!
    code: Int!    
    nom: String!
    departementId: Int!
  }

  type CommuneWithCounts {
    id: Int!
    code: Int!    
    nom: String!
    departement: Departement!
    nbLieuxDits: Int
    nbDonnees: Int
  }

  type Espece {
    id: Int!
    code: String!
    nomFrancais: String!
    nomLatin: String!
    classeId: Int!
  }

  type EspeceWithCounts {
    id: Int!
    nbDonnees: Int
    code: String!
    nomFrancais: String!
    nomLatin: String!
    classe: Classe!
  }

  type EstimationDistance {
    id: Int!
    libelle: String!
  }

  type EstimationDistanceWithCounts {
    id: Int!
    nbDonnees: Int
    libelle: String!
  }

  type EstimationNombre {
    id: Int!
    libelle: String!
    nonCompte: Boolean!
  }

  type EstimationNombreWithCounts {
    id: Int!
    libelle: String!
    nonCompte: Boolean!
    nbDonnees: Int
  }

  type Meteo {
    id: Int!
    libelle: String!
  }

  type MeteoWithCounts {
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
    communeId: Int!
  }

  type LieuDitWithCounts {
    id: Int!          
    nom: String!
    altitude: Int!
    longitude: Float!
    latitude: Float!
    coordinatesSystem: CoordinatesSystemType!
    commune: CommuneWithCounts!
    nbDonnees: Int
  }

  type Milieu {
    id: Int!
    code: String!
    libelle: String!
  }

  type MilieuWithCounts {
    id: Int!
    nbDonnees: Int
    code: String!
    libelle: String!
  }

  type Sexe {
    id: Int!
    libelle: String!
  }

  type SexeWithCounts {
    id: Int!
    libelle: String!
    nbDonnees: Int
  }

  type Age {
    id: Int!
    libelle: String!
  }

  type AgeWithCounts {
    id: Int!
    libelle: String!
    nbDonnees: Int
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
    result: [AgeWithCounts]
    count: Int!
  }
  
  type ClassesPaginatedResult implements PaginatedResult {
    result: [ClasseWithCounts]
    count: Int!
  }

  type CommunesPaginatedResult implements PaginatedResult {
    result: [CommuneWithCounts]
    count: Int!
  }

  type ComportementsPaginatedResult implements PaginatedResult {
    result: [ComportementWithCounts]
    count: Int!
  }

  type DepartementsPaginatedResult implements PaginatedResult {
    result: [DepartementWithCounts]
    count: Int!
  }

  type EspecesPaginatedResult implements PaginatedResult {
    result: [EspeceWithCounts]
    count: Int!
  }

  type EstimationsDistancePaginatedResult implements PaginatedResult {
    result: [EstimationDistanceWithCounts]
    count: Int!
  }

  type EstimationsNombrePaginatedResult implements PaginatedResult {
    result: [EstimationNombreWithCounts]
    count: Int!
  }

  type LieuxDitsPaginatedResult implements PaginatedResult {
    result: [LieuDitWithCounts]
    count: Int!
  }

  type MeteosPaginatedResult implements PaginatedResult {
    result: [MeteoWithCounts]
    count: Int!
  }

  type MilieuxPaginatedResult implements PaginatedResult {
    result: [MilieuWithCounts]
    count: Int!
  }

  type ObservateursPaginatedResult implements PaginatedResult {
    result: [ObservateurWithCounts]
    count: Int!
  }

  type SexesPaginatedResult implements PaginatedResult {
    result: [SexeWithCounts]
    count: Int!
  }

  type Query {
    ages: [Age]
    classes: [Classe]
    communes: [Commune]
    comportements: [Comportement]
    departements: [Departement]
    especes: [Espece]
    lieuxDits: [LieuDit]
    estimationsDistance: [EstimationDistance]
    estimationsNombre: [EstimationNombre]
    meteos: [Meteo]
    milieux: [Milieu]
    observateurs: [Observateur]
    sexes: [Sexe]
    lastDonneeId: Int
    paginatedAges(searchParams: SearchParams, orderBy: EntitesAvecLibelleOrderBy, sortOrder: SortOrder): AgesPaginatedResult
    paginatedClasses(searchParams: SearchParams, orderBy: ClassesOrderBy, sortOrder: SortOrder): ClassesPaginatedResult
    paginatedCommunes(searchParams: SearchParams, orderBy: CommunesOrderBy, sortOrder: SortOrder): CommunesPaginatedResult
    paginatedComportements(searchParams: SearchParams, orderBy: ComportementsOrderBy, sortOrder: SortOrder): ComportementsPaginatedResult
    paginatedDepartements(searchParams: SearchParams, orderBy: DepartementsOrderBy, sortOrder: SortOrder): DepartementsPaginatedResult
    paginatedEspeces(searchParams: SearchParams, orderBy: EspecesOrderBy, sortOrder: SortOrder): EspecesPaginatedResult
    paginatedEstimationsDistance(searchParams: SearchParams, orderBy: EntitesAvecLibelleOrderBy, sortOrder: SortOrder): EstimationsDistancePaginatedResult
    paginatedEstimationsNombre(searchParams: SearchParams, orderBy: EstimationNombreOrderBy, sortOrder: SortOrder): EstimationsNombrePaginatedResult
    paginatedLieuxdits(searchParams: SearchParams, orderBy: LieuxDitsOrderBy, sortOrder: SortOrder): LieuxDitsPaginatedResult
    paginatedMeteos(searchParams: SearchParams, orderBy: EntitesAvecLibelleOrderBy, sortOrder: SortOrder): MeteosPaginatedResult
    paginatedMilieux(searchParams: SearchParams, orderBy: MilieuxOrderBy, sortOrder: SortOrder): MilieuxPaginatedResult
    paginatedObservateurs(searchParams: SearchParams, orderBy: EntitesAvecLibelleOrderBy, sortOrder: SortOrder): ObservateursPaginatedResult
    paginatedSexes(searchParams: SearchParams, orderBy: EntitesAvecLibelleOrderBy, sortOrder: SortOrder): SexesPaginatedResult
    settings: Settings
    version: Version
  }

  type Mutation {
    updateSettings(appConfiguration: InputSettings): Settings
  }

`;
