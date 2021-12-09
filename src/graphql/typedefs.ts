import { gql } from "apollo-server-core";

export default gql`

  input InputAge {
    libelle: String!
  }

  input InputClasse {
    libelle: String!
  }

  input InputCommune {
    departementId: Int!
    code: Int!
    nom: String!
  }

  input InputComportement {
    code: String!
    libelle: String!
    nicheur: Nicheur
  }

  input InputDepartement {
    code: String!
  }

  input InputDonnee {
    inventaireId: Int!
    especeId: Int!
    sexeId: Int!
    ageId: Int!
    estimationNombreId: Int!
    nombre: Int
    estimationDistanceId: Int
    distance: Int
    regroupement: Int
    commentaire: String
    comportementsIds: [Int!]
    milieuxIds: [Int!]
  }

  input InputEspece {
    classeId: Int!
    code: String!
    nomFrancais: String!
    nomLatin: String!
  }

  input InputEstimationDistance {
    libelle: String!
  }

  input InputEstimationNombre {
    libelle: String!
    nonCompte: Boolean!
  }

  input InputInventaire {
    observateurId: Int!
    associesIds: [Int!]
    date: String!
    duree: String
    heure: String
    lieuDitId: Int!
    altitude: Int
    latitude: Float
    longitude: Float
    meteosIds: [Int!]
    temperature: Int
  }

  input InputLieuDit {
    communeId: Int!
    nom: String!
    altitude: Int!
    longitude: Float!
    latitude: Float!
    coordinatesSystem: CoordinatesSystemType!
  }

  input InputMeteo {
    libelle: String!
  }

  input InputMilieu {
    code: String!
    libelle: String!
  }

  input InputObservateur {
    libelle: String!
  }

  input InputSexe {
    libelle: String!
  }

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

  input SearchDonneeCriteria {
    id: Int
    observateurs: [Int]
    temperature: Int
    meteos: [Int]
    associes: [Int]
    heure: String
    duree: String
    classes: [Int]
    especes: [Int]
    departements: [Int]
    communes: [Int]
    lieuxdits: [Int]
    nombre: Int
    estimationsNombre: [Int]
    sexes: [Int]
    ages: [Int]
    distance: Int
    estimationsDistance: [Int]
    regroupement: Int
    fromDate: String
    toDate: String
    commentaire: String
    nicheurs: [Nicheur]
    comportements: [Int]
    milieux: [Int]
  }

  input UserCreateInput {
    username: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input UserLoginInput {
    username: String!
    password: String!
  }

  input EditUserData {
    username: String
    currentPassword: String!
    newPassword: String
    firstName: String
    lastName: String
  }

  type Settings {
    id: Int!
    areAssociesDisplayed: Boolean!
    isMeteoDisplayed: Boolean!
    isDistanceDisplayed: Boolean!
    isRegroupementDisplayed: Boolean!
    defaultDepartement: Departement
    defaultObservateur: Observateur
    coordinatesSystem: CoordinatesSystemType!
    defaultEstimationNombre: EstimationNombre
    defaultNombre: Int
    defaultSexe: Sexe
    defaultAge: Age
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
    departement: Departement!
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
    classe: Classe!
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
    commune: Commune!
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

  type SexeWithSpecimensCount {
    id: Int!
    libelle: String!
    nbSpecimens: Int!
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

  type AgeWithSpecimensCount {
    id: Int!
    libelle: String!
    nbSpecimens: Int!
  }

  type Coordinates {
    altitude: Int!
    longitude: Float!
    latitude: Float!
    system: CoordinatesSystemType!
  }

  type Inventaire {
    id: Int!
    observateur: Observateur!
    associes: [Observateur]!
    date: String!
    heure: String
    duree: String
    lieuDit: LieuDit!
    customizedCoordinates: Coordinates
    temperature: Int
    meteos: [Meteo]!
  }

  type Donnee {
    id: Int!
    inventaire: Inventaire!
    espece: Espece!
    sexe: Sexe!
    age: Age!
    estimationNombre: EstimationNombre
    nombre: Int
    estimationDistance: EstimationDistance
    distance: Int
    regroupement: Int
    comportements: [Comportement]!
    milieux: [Milieu]!
    commentaire: String
  }

  type DonneeNavigationData {
    previousDonneeId: Int
    nextDonneeId: Int
    index: Int!
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

  input SearchDonneeParams {
    pageNumber: Int
    pageSize: Int
  }

  input FindParams {
    q: String
    max: Int
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

  enum SearchDonneesOrderBy {
    id
    codeEspece
    nomFrancais
    nombre
    sexe
    age
    departement
    codeCommune
    nomCommune
    lieuDit
    date
    heure
    duree
    observateur
  }

  enum UserRole {
    admin
    contributor
  }

  #
  # Results
  #

  type DonneeResult {
    id: Int!
    donnee: Donnee
    navigation: DonneeNavigationData
  }

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

  type PaginatedSearchDonneesResult implements PaginatedResult {
    result: [Donnee]
    count: Int!
  }

  enum ImportStatusEnum {
    NOT_STARTED,
    ONGOING,
    COMPLETE,
    FAILED
  }

  enum ImportErrorType {
    IMPORT_FAILURE,
    IMPORT_PROCESS_ERROR,
    IMPORT_PROCESS_UNEXPECTED_EXIT
  }

  enum OngoingSubStatus {
    PROCESS_STARTED,
    RETRIEVING_REQUIRED_DATA,
    VALIDATING_INPUT_FILE,
    INSERTING_IMPORTED_DATA
  }

  type OngoingValidationStats {
    totalLines: Int
    totalEntries: Int
    nbEntriesChecked: Int
    nbEntriesWithErrors: Int
  }

  type ImportStatus {
    status: ImportStatusEnum!
    subStatus: OngoingSubStatus
    errorType: ImportErrorType
    errorDescription: String
    importErrorsReportFile: String
    ongoingValidationStats: OngoingValidationStats
  }

  type UpsertDonneeResult {
    donnee: Donnee
    failureReason: String
  }

  type UpsertInventaireFailureReason {
    inventaireExpectedToBeUpdated: Int!
    correspondingInventaireFound: Int!
  }

  type UpsertInventaireResult {
    inventaire: Inventaire
    failureReason: UpsertInventaireFailureReason
  }

  type UserInfo {
    id: ID!
    username: String!
    firstName: String!
    lastName: String
    role: String!
  }

  type Query {
    age(id: Int!): Age
    classe(id: Int!): Classe
    commune(id: Int!): Commune
    comportement(id: Int!): Comportement
    comportementList(ids: [Int!]!): [Comportement]
    departement(id: Int!): Departement
    donnee(id: Int!): DonneeResult
    espece(id: Int!): Espece
    estimationDistance(id: Int!): EstimationDistance
    estimationNombre(id: Int!): EstimationNombre
    inventaire(id: Int!): Inventaire
    lieuDit(id: Int!): LieuDit
    meteo(id: Int!): Meteo
    meteoList(ids: [Int!]!): [Meteo]
    milieu(id: Int!): Milieu
    milieuList(ids: [Int!]!): [Milieu]
    observateur(id: Int!): Observateur
    observateurList(ids: [Int!]!): [Observateur]
    sexe(id: Int!): Sexe
    specimenCountByAge(especeId: Int!): [AgeWithSpecimensCount]
    specimenCountBySexe(especeId: Int!): [SexeWithSpecimensCount]
    ages(params: FindParams): [Age]
    classes(params: FindParams): [Classe]
    communes(params: FindParams, departementId: Int): [Commune]
    comportements(params: FindParams): [Comportement]
    departements(params: FindParams): [Departement]
    especes(params: FindParams, classeId: Int): [Espece]
    lieuxDits(params: FindParams, communeId: Int, departementId: Int): [LieuDit]
    estimationsDistance(params: FindParams): [EstimationDistance]
    estimationsNombre(params: FindParams): [EstimationNombre]
    meteos: [Meteo]
    milieux(params: FindParams): [Milieu]
    observateurs(params: FindParams): [Observateur]
    sexes(params: FindParams): [Sexe]
    nextRegroupement: Int!
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
    paginatedSearchEspeces(searchCriteria: SearchDonneeCriteria, searchParams: SearchDonneeParams, orderBy: EspecesOrderBy, sortOrder: SortOrder): EspecesPaginatedResult
    paginatedSearchDonnees(searchCriteria: SearchDonneeCriteria, searchParams: SearchDonneeParams, orderBy: SearchDonneesOrderBy, sortOrder: SortOrder): PaginatedSearchDonneesResult
    settings: Settings
    importStatus(importId: String!): ImportStatus
    exportAges: String
    exportClasses: String
    exportCommunes: String
    exportComportements: String
    exportDepartements: String
    exportDonnees(searchCriteria: SearchDonneeCriteria): String
    exportEspeces: String
    exportEstimationsDistance: String
    exportEstimationsNombre: String
    exportLieuxDits: String
    exportMeteos: String
    exportMilieux: String
    exportObservateurs: String
    exportSexes: String
    dumpDatabase: String
    version: Version
  }

  type Mutation {
    deleteAge(id: Int!): Int
    deleteClasse(id: Int!): Int
    deleteCommune(id: Int!): Int
    deleteComportement(id: Int!): Int
    deleteDepartement(id: Int!): Int
    deleteDonnee(id: Int!): Int
    deleteEspece(id: Int!): Int
    deleteEstimationDistance(id: Int!): Int
    deleteEstimationNombre(id: Int!): Int
    deleteLieuDit(id: Int!): Int
    deleteMeteo(id: Int!): Int
    deleteMilieu(id: Int!): Int
    deleteObservateur(id: Int!): Int
    deleteSexe(id: Int!): Int
    upsertAge(id: Int, data: InputAge!): Age
    upsertClasse(id: Int, data: InputClasse!): Classe
    upsertCommune(id: Int, data: InputCommune!): Commune
    upsertComportement(id: Int, data: InputComportement!): Comportement
    upsertDepartement(id: Int, data: InputDepartement!): Departement
    upsertDonnee(id: Int, data: InputDonnee!): UpsertDonneeResult
    upsertEspece(id: Int, data: InputEspece!): Espece
    upsertEstimationDistance(id: Int, data: InputEstimationDistance!): EstimationDistance
    upsertEstimationNombre(id: Int, data: InputEstimationNombre!): EstimationNombre
    upsertInventaire(id: Int, data: InputInventaire!, migrateDonneesIfMatchesExistingInventaire: Boolean): UpsertInventaireResult
    upsertLieuDit(id: Int, data: InputLieuDit!): LieuDit
    upsertMeteo(id: Int, data: InputMeteo!): Meteo
    upsertMilieu(id: Int, data: InputMilieu!): Milieu
    upsertObservateur(id: Int, data: InputObservateur!): Observateur
    upsertSexe(id: Int, data: InputSexe!): Sexe
    updateSettings(appConfiguration: InputSettings): Settings
    initializeDatabase: Boolean
    resetDatabase: Boolean
    updateDatabase: Boolean
    userSignup(signupData: UserCreateInput!, role: UserRole) : UserInfo
    userLogin(loginData: UserLoginInput!): UserInfo
    userLogout: Boolean!
    userEdit(id: ID!, editUserData: EditUserData!): UserInfo
    userDelete(id: ID!): Boolean!
  }

`;
