import * as _ from "lodash";
import { Age } from "ouca-common/age.object";
import { Commune } from "ouca-common/commune.object";
import { Comportement } from "ouca-common/comportement.object";
import { LAMBERT_93 } from "ouca-common/coordinates-system/coordinates-system.object";
import { Departement } from "ouca-common/departement.object";
import { Donnee } from "ouca-common/donnee.object";
import { Espece } from "ouca-common/espece.object";
import { EstimationDistance } from "ouca-common/estimation-distance.object";
import { EstimationNombre } from "ouca-common/estimation-nombre.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { Lieudit } from "ouca-common/lieudit.object";
import { Meteo } from "ouca-common/meteo.object";
import { Milieu } from "ouca-common/milieu.object";
import { Observateur } from "ouca-common/observateur.object";
import { Sexe } from "ouca-common/sexe.object";
import { ImportedDonnee } from "../../objects/imported-donnee.object";
import {
  getEntityByCode,
  getEntityByLibelle
} from "../../sql-api/sql-api-common";
import { getCommuneByDepartementIdAndCode } from "../../sql-api/sql-api-commune";
import { getDepartementByCode } from "../../sql-api/sql-api-departement";
import { findEspeceByCode } from "../../sql-api/sql-api-espece";
import { getLieuditByCommuneIdAndNom } from "../../sql-api/sql-api-lieudit";
import { findMeteoByLibelle } from "../../sql-api/sql-api-meteo";
import { findObservateurByLibelle } from "../../sql-api/sql-api-observateur";
import {
  TABLE_AGE,
  TABLE_COMPORTEMENT,
  TABLE_ESTIMATION_DISTANCE,
  TABLE_ESTIMATION_NOMBRE,
  TABLE_MILIEU,
  TABLE_SEXE
} from "../../utils/constants";
import { getOriginCoordinates } from "../../utils/coordinates-utils";
import {
  getFormattedTime,
  isIdInListIds,
  isTimeValid
} from "../../utils/utils";
import { ImportService } from "./import-service";

export class ImportDoneeeService extends ImportService {
  private OBSERVATEUR_INDEX: number = 0;
  private ASSOCIES_INDEX: number = 1;
  private DATE_INDEX: number = 2;
  private HEURE_INDEX: number = 3;
  private DUREE_INDEX: number = 4;
  private DEPARTEMENT_INDEX: number = 5;
  private CODE_COMMUNE_INDEX: number = 6;
  private LIEUDIT_INDEX: number = 7;
  private ALTITUDE_INDEX: number = 8;
  private LONGITUDE_INDEX: number = 9;
  private LATITUDE_INDEX: number = 10;
  private TEMPERATURE_INDEX: number = 11;
  private METEOS_INDEX: number = 12;
  private CODE_ESPECE_INDEX: number = 13;
  private ESTIMATION_NOMBRE_INDEX: number = 14;
  private NOMBRE_INDEX: number = 15;
  private SEXE_INDEX: number = 16;
  private AGE_INDEX: number = 17;
  private ESTIMATION_DISTANCE_INDEX: number = 18;
  private DISTANCE_INDEX: number = 19;
  private REGROUPEMENT_INDEX: number = 20;
  private CODE_COMP_1_INDEX: number = 21;
  private CODE_COMP_6_INDEX: number = 26;
  private CODE_MILIEU_1_INDEX: number = 27;
  private CODE_MILIEU_4_INDEX: number = 30;
  private COMMENTAIRE_INDEX: number = 31;

  private LIST_SEPARATOR: string = ",";

  protected getNumberOfColumns = (): number => {
    return 32;
  };

  protected buildEntity = (
    inventaireId: number,
    especeId: number,
    sexeId: number,
    ageId: number,
    estimationNombreId: number,
    nombre: number | null,
    estimationDistanceId: number | null,
    distance: number | null,
    regroupement: number | null,
    comportementsIds: number[],
    milieuxIds: number[],
    commentaire: string | null
  ): Donnee => {
    return {
      id: null,
      inventaireId,
      especeId,
      sexeId,
      ageId,
      estimationNombreId,
      nombre,
      estimationDistanceId,
      distance,
      regroupement,
      comportementsIds,
      milieuxIds,
      commentaire
    };
  };

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    const rawDonnee: ImportedDonnee = this.getrawDonnee(entityTab);

    // First check the format of the fields
    // Return an error if some of the attributes are missing wrongly formatted
    if (
      !this.areInventaireAttributesValid(rawDonnee) ||
      !this.areDonneeAttributesValid(rawDonnee)
    ) {
      return false;
    }

    // Then start getting the requested sub-objects to create the new "Donnee"

    // Get the "Observateur" or return an error if it doesn't exist
    const observateur: Observateur = await findObservateurByLibelle(
      rawDonnee.observateur
    );

    if (!observateur) {
      this.message =
        "L'observateur \"" + rawDonnee.observateur + "\" n'existe pas";
      return false;
    }

    // Get the "Observateurs associes" or return an error if some of them doesn't exist
    const associesIds: number[] = [];
    for (const associeLibelle of rawDonnee.associes) {
      const associe: Observateur = await findObservateurByLibelle(
        associeLibelle
      );

      if (!associe) {
        this.message =
          "L'observateur associé \"" + associeLibelle + "\" n'existe pas";
        return false;
      }

      if (!isIdInListIds(associesIds, associe.id)) {
        associesIds.push(associe.id);
      }
    }

    // Get the "Date"
    const date = rawDonnee.date; // TO DO

    // Get the "Heure"
    const heure: string = getFormattedTime(rawDonnee.heure);

    // Get the "Duree"
    const duree: string = getFormattedTime(rawDonnee.duree);

    // Get the "Departement" or return an error if it doesn't exist
    const departement: Departement = await getDepartementByCode(
      rawDonnee.departement
    );
    if (!departement) {
      this.message =
        'Le département "' + rawDonnee.departement + "\" n'existe pas";
      return false;
    }

    // Get the "Commune" or return an error if it does not exist
    const commune: Commune = await getCommuneByDepartementIdAndCode(
      departement.id,
      +rawDonnee.codeCommune
    );

    if (!commune) {
      this.message =
        'La commune avec pour code "' +
        rawDonnee.codeCommune +
        '" n\'existe pas dans le département "' +
        departement.code +
        '"';
      return false;
    }

    // Get the "Lieu-dit" or return an error if it does not exist
    const lieudit: Lieudit = await getLieuditByCommuneIdAndNom(
      commune.id,
      rawDonnee.lieudit
    );

    if (!lieudit) {
      this.message =
        'Le lieu-dit "' +
        rawDonnee.lieudit +
        '" n\'existe pas dans la commune "' +
        commune.code +
        " - " +
        commune.nom +
        '" du département ' +
        departement.code +
        '"';
      return false;
    }

    // Get the customized coordinates
    let altitude: number = null;
    let longitude: number = null;
    let latitude: number = null;
    if (
      this.areCoordinatesCustomized(
        lieudit,
        +rawDonnee.altitude,
        +rawDonnee.longitude,
        +rawDonnee.latitude
      )
    ) {
      altitude = +rawDonnee.altitude;
      longitude = +rawDonnee.longitude;
      latitude = +rawDonnee.latitude;
    }

    // Get the "Temperature"
    // TO DO check that 0 is accepted
    // TO DO bug quand la temperature n'est pas renseignée ça met 0
    const temperature: number | null = _.isNil(rawDonnee.temperature)
      ? null
      : +rawDonnee.temperature;

    console.log("Temperature", rawDonnee.temperature, temperature);

    // Get the "Meteos" or return an error if some of them doesn't exist
    const meteosIds: number[] = [];
    for (const meteoLibelle of rawDonnee.meteos) {
      const meteo: Meteo = await findMeteoByLibelle(meteoLibelle);
      if (!meteo) {
        this.message = 'La météo "' + meteoLibelle + "\" n'existe pas";
        return false;
      }
      if (!isIdInListIds(meteosIds, meteo.id)) {
        meteosIds.push(meteo.id);
      }
    }

    // Get the "Espece" or return an error if it doesn't exist
    const espece: Espece = await findEspeceByCode(rawDonnee.codeEspece);
    if (!espece) {
      this.message =
        "L'espèce avec pour code \"" + rawDonnee.codeEspece + "\" n'existe pas";
      return false;
    }

    // Get the "Sexe" or return an error if it doesn't exist
    const sexe: Sexe = (await getEntityByLibelle(
      rawDonnee.sexe,
      TABLE_SEXE
    )) as Sexe;

    if (!sexe) {
      this.message = 'Le sexe "' + rawDonnee.sexe + "\" n'existe pas";
      return false;
    }

    // Get the "Age" or return an error if it doesn't exist
    const age: Age = (await getEntityByLibelle(
      rawDonnee.age,
      TABLE_AGE
    )) as Age;

    if (!age) {
      this.message = "L'âge \"" + rawDonnee.age + "\" n'existe pas";
      return false;
    }

    // Get the "Estimation du nombre" or return an error if it doesn't exist
    const estimationNombre: EstimationNombre = (await getEntityByLibelle(
      rawDonnee.estimationNombre,
      TABLE_ESTIMATION_NOMBRE
    )) as EstimationNombre;

    if (!estimationNombre) {
      this.message =
        "L'estimation du nombre \"" +
        rawDonnee.estimationNombre +
        "\" n'existe pas";
      return false;
    }

    // Get the "Nombre"
    // TO DO check that 0 is OK
    const nombre: number = rawDonnee.nombre ? +rawDonnee.nombre : null;

    // If "Estimation du nombre" is of type "Non-compte" then "Nombre" should be empty
    if (estimationNombre.nonCompte && !!nombre) {
      this.message =
        "L'estimation du nombre \"" +
        estimationNombre.libelle +
        '" est de type non-compté donc le nombre devrait être vide';
      return false;
    }

    // Get the "Estimation de la distance" or return an error if it doesn't exist
    let estimationDistance: EstimationDistance = null;
    if (rawDonnee.estimationDistance) {
      estimationDistance = (await getEntityByLibelle(
        rawDonnee.estimationDistance,
        TABLE_ESTIMATION_DISTANCE
      )) as EstimationDistance;

      if (!estimationDistance) {
        this.message =
          "L'estimation de la distance \"" +
          rawDonnee.estimationDistance +
          "\" n'existe pas";
        return false;
      }
    }

    // Get the "Distance"
    const distance: number =
      rawDonnee.distance != null ? +rawDonnee.distance : null;

    // Get the "Regroupement"
    const regroupement: number = rawDonnee.regroupement
      ? +rawDonnee.regroupement
      : null;

    // Get the "Comportements" or return an error if some of them does not exist
    const comportementsIds: number[] = [];
    for (const codeComportement of rawDonnee.comportements) {
      const comportement: Comportement = (await getEntityByCode(
        codeComportement,
        TABLE_COMPORTEMENT
      )) as Comportement;

      if (!comportement) {
        this.message =
          'Le comportement avec pour code "' +
          codeComportement +
          "\" n'existe pas";
        return false;
      }

      if (!isIdInListIds(comportementsIds, comportement.id)) {
        comportementsIds.push(comportement.id);
      }
    }

    // Get the "Milieux" or return an error if some of them does not exist
    const milieuxIds: number[] = [];
    for (const codeMilieu of rawDonnee.milieux) {
      const milieu: Milieu = (await getEntityByCode(
        codeMilieu,
        TABLE_MILIEU
      )) as Milieu;

      if (!milieu) {
        this.message =
          'Le milieu avec pour code "' + codeMilieu + "\" n'existe pas";
        return false;
      }

      if (!isIdInListIds(milieuxIds, milieu.id)) {
        milieuxIds.push(milieu.id);
      }
    }

    // Get the "Commentaire" and replace forbidden character
    const commentaire: string = rawDonnee.commentaire
      ? rawDonnee.commentaire.replace(";", ",")
      : null;

    // Create the "Inventaire" to save
    const inventaireToSave: Inventaire = this.buildInventaire(
      observateur.id,
      associesIds,
      date,
      heure,
      duree,
      lieudit.id,
      temperature,
      meteosIds,
      altitude,
      longitude,
      latitude
    );

    console.log(inventaireToSave);

    // Save the "Inventaire" if it doesn't exist or get the existing ID otherwise
    let inventaire: Inventaire = null; // TO DO
    if (!inventaire) {
      // Save the inventaire
      /*await saveEntity(
        TABLE_INVENTAIRE,
        inventaireToSave,
        DB_SAVE_MAPPING.inventaire
      );*/
      inventaire = null; // TO DO
    }

    inventaireToSave.id = inventaire ? inventaire.id : null;

    // Create the "Donnee" to save
    const donneeToSave: Donnee = this.buildEntity(
      inventaireToSave.id,
      espece.id,
      sexe.id,
      age.id,
      estimationNombre.id,
      nombre,
      estimationDistance ? estimationDistance.id : null,
      distance,
      regroupement,
      comportementsIds,
      milieuxIds,
      commentaire
    );

    console.log(donneeToSave);

    // Save the "Donnee" or return an error if it does not exist
    const donnee: Donnee = null; // TO DO
    if (!donnee) {
      /*return await saveEntity(
        TABLE_DONNEE,
        donneeToSave,
        DB_SAVE_MAPPING.donnee
      );*/
    } else {
      this.message = "Une donnée similaire existe déjà avec l'ID " + donnee.id;
      return false;
    }
  };

  private areInventaireAttributesValid = (
    donneeToImport: ImportedDonnee
  ): boolean => {
    if (
      !this.isObservateurValid(donneeToImport.observateur) ||
      !this.isDateValid(donneeToImport.date) ||
      !this.isHeureValid(donneeToImport.heure) ||
      !this.isDureeValid(donneeToImport.duree) ||
      !this.isDepartementValid(donneeToImport.departement) ||
      !this.isCodeCommuneValid(donneeToImport.codeCommune) ||
      !this.isLieuditValid(donneeToImport.lieudit) ||
      !this.isAltitudeValid(donneeToImport.altitude) ||
      !this.isLongitudeValid(donneeToImport.longitude) ||
      !this.isLatitudeValid(donneeToImport.latitude) ||
      !this.isTemperatureValid(donneeToImport.temperature)
    ) {
      return false;
    }
    return true;
  };

  private areDonneeAttributesValid = (
    donneeToImport: ImportedDonnee
  ): boolean => {
    if (
      !this.isCodeEspeceValid(donneeToImport.codeEspece) ||
      !this.isSexeValid(donneeToImport.sexe) ||
      !this.isAgeValid(donneeToImport.age) ||
      !this.isNombreValid(donneeToImport.nombre) ||
      !this.isEstimationNombreValid(donneeToImport.estimationNombre) ||
      !this.isDistanceValid(donneeToImport.distance) ||
      !this.isRegroupementValid(donneeToImport.regroupement)
    ) {
      return false;
    }
    return true;
  };

  private areCoordinatesCustomized = (
    lieudit: Lieudit,
    altitude: number,
    longitude: number,
    latitude: number
  ): boolean => {
    return (
      !!lieudit &&
      (altitude !== lieudit.altitude ||
        longitude !== getOriginCoordinates(lieudit).longitude ||
        latitude !== getOriginCoordinates(lieudit).latitude)
    );
  };

  private buildInventaire = (
    observateurId: number,
    associesIds: number[],
    date: string,
    heure: string | null,
    duree: string | null,
    lieuditId: number,
    temperature: number | null,
    meteosIds: number[],
    altitude: number | null,
    longitude: number | null,
    latitude: number | null
  ): Inventaire => {
    const inventaire: Inventaire = {
      id: null,
      observateurId,
      associesIds,
      date: date,
      heure: heure,
      duree: duree,
      lieuditId,
      customizedAltitude: altitude,
      coordinates: {
        lambert93: {
          longitude,
          latitude,
          system: LAMBERT_93
        }
      },
      temperature: temperature,
      meteosIds
    };

    return inventaire;
  };

  private isObservateurValid = (observateur: string): boolean => {
    return this.isNotEmptyString(observateur, "L'observateur");
  };

  private isDateValid = (dateStr: string): boolean => {
    return true; // TO DO
  };

  private isHeureValid = (heure: string): boolean => {
    if (!!heure && !isTimeValid(heure)) {
      this.message = "L'heure ne respecte pas le format demandé: hh:ss";
      return false;
    }
    return true;
  };

  private isDureeValid = (duree: string): boolean => {
    if (!!duree && !isTimeValid(duree)) {
      this.message = "La durée ne respecte pas le format demandé: hh:ss";
      return false;
    }
    return true;
  };

  private isDepartementValid = (departement: string): boolean => {
    return this.isNotEmptyString(departement, "Le département");
  };

  private isCodeCommuneValid = (code: string): boolean => {
    code = code.trim();

    console.log(code);

    if (!code) {
      this.message = "Le code de la commune du lieu-dit ne peut pas être vide";
      return false;
    }

    if (!Number.isInteger(Number(code))) {
      this.message = "Le code de la commune du lieu-dit doit être un entier";
      return false;
    }

    return true;
  };

  private isLieuditValid = (lieudit: string): boolean => {
    return this.isNotEmptyString(lieudit, "Le lieu-dit");
  };

  private isAltitudeValid(altitudeStr: string): boolean {
    if (!altitudeStr) {
      this.message = "L'altitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const altitude = Number(altitudeStr);

    if (!Number.isInteger(altitude)) {
      this.message = "L'altitude du lieu-dit doit être un entier";
      return false;
    }

    if (altitude < 0 || altitude > 99999) {
      this.message =
        "L'altitude du lieu-dit doit être un entier compris entre 0 et 99999";
      return false;
    }

    return true;
  }

  private isLongitudeValid(longitudeStr: string): boolean {
    if (!longitudeStr) {
      this.message = "La longitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const longitude = Number(longitudeStr);

    if (!Number.isInteger(longitude)) {
      this.message = "La longitude du lieu-dit doit être un entier";
      return false;
    }

    if (longitude < 0 || longitude > 99999999) {
      this.message =
        "La longitude du lieu-dit doit être un entier compris entre 0 et 99999999";
      return false;
    }

    return true;
  }

  private isLatitudeValid(latitudeStr: string): boolean {
    if (!latitudeStr) {
      this.message = "La latitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const latitude = Number(latitudeStr);

    if (!Number.isInteger(latitude)) {
      this.message = "La latitude du lieu-dit doit être un entier";
      return false;
    }

    if (latitude < 0 || latitude > 99999999) {
      this.message =
        "La latitude du lieu-dit doit être un entier compris entre 0 et 99999999";
      return false;
    }

    return true;
  }

  private isTemperatureValid = (temperatureStr: string): boolean => {
    if (temperatureStr) {
      const temperature = Number(temperatureStr);

      if (!Number.isInteger(temperature)) {
        this.message = "La température doit être un entier";
        return false;
      }

      if (temperature < -128 || temperature > 127) {
        this.message =
          "La temperature doit être un entier compris entre -128 et 127";
        return false;
      }
    }
    return true;
  };

  private isCodeEspeceValid = (code: string): boolean => {
    return this.isNotEmptyString(code, "Le code de l'espèce");
  };

  private isSexeValid = (sexe: string): boolean => {
    return this.isNotEmptyString(sexe, "Le sexe");
  };

  private isAgeValid = (age: string): boolean => {
    return this.isNotEmptyString(age, "L'âge");
  };

  private isEstimationNombreValid = (estimation: string): boolean => {
    return this.isNotEmptyString(estimation, "L'estimation du nombre");
  };

  private isNombreValid = (nombreStr: string): boolean => {
    if (nombreStr) {
      const nombre = Number(nombreStr);

      if (!Number.isInteger(nombre)) {
        this.message = "Le nombre d'individus doit être un entier";
        return false;
      }

      if (nombre < 1 || nombre > 99999) {
        this.message =
          "Le nombre d'individus doit être un entier compris entre 1 et 99999";
        return false;
      }
    }
    return true;
  };

  private isDistanceValid = (distanceStr: string): boolean => {
    if (distanceStr) {
      const distance = Number(distanceStr);

      if (!Number.isInteger(distance)) {
        this.message = "La distance de contact doit être un entier";
        return false;
      }

      if (distance < 0 || distance > 99999) {
        this.message =
          "La distance de contact doit être un entier compris entre 0 et 99999";
        return false;
      }
    }
    return true;
  };

  private isRegroupementValid = (regroupementStr: string): boolean => {
    if (regroupementStr) {
      const regroupement = Number(regroupementStr);

      if (!Number.isInteger(regroupement)) {
        this.message = "La numéro de regroupement doit être un entier";
        return false;
      }

      if (regroupement < 1 || regroupement > 99999) {
        this.message =
          "Le numéro de regroupement doit être un entier compris entre 1 et 99999";
        return false;
      }
    }
    return true;
  };

  private isNotEmptyString = (str: string, attributeType: string): boolean => {
    str = str.trim();

    if (!str) {
      this.message = attributeType + " ne peut pas être vide";
      return false;
    }

    return true;
  };

  private getrawDonnee = (attributes: string[]): ImportedDonnee => {
    const comportements: string[] = [];
    for (
      let comportementIndex = this.CODE_COMP_1_INDEX;
      comportementIndex < this.CODE_COMP_6_INDEX;
      comportementIndex++
    ) {
      const comportement: string = attributes[comportementIndex];
      if (comportement) {
        comportements.push(comportement);
      }
    }

    const milieux: string[] = [];
    for (
      let milieuIndex = this.CODE_MILIEU_1_INDEX;
      milieuIndex < this.CODE_MILIEU_4_INDEX;
      milieuIndex++
    ) {
      const milieu: string = attributes[milieuIndex];
      if (milieu) {
        milieux.push(milieu);
      }
    }

    return {
      observateur: attributes[this.OBSERVATEUR_INDEX],
      associes: attributes[this.ASSOCIES_INDEX]
        ? attributes[this.ASSOCIES_INDEX].split(this.LIST_SEPARATOR)
        : [],
      date: attributes[this.DATE_INDEX],
      heure: attributes[this.HEURE_INDEX],
      duree: attributes[this.DUREE_INDEX],
      departement: attributes[this.DEPARTEMENT_INDEX],
      codeCommune: attributes[this.CODE_COMMUNE_INDEX],
      lieudit: attributes[this.LIEUDIT_INDEX],
      altitude: attributes[this.ALTITUDE_INDEX],
      longitude: attributes[this.LONGITUDE_INDEX],
      latitude: attributes[this.LATITUDE_INDEX],
      temperature: attributes[this.TEMPERATURE_INDEX],
      meteos: attributes[this.METEOS_INDEX]
        ? attributes[this.METEOS_INDEX].split(this.LIST_SEPARATOR)
        : [],
      codeEspece: attributes[this.CODE_ESPECE_INDEX],
      age: attributes[this.AGE_INDEX],
      sexe: attributes[this.SEXE_INDEX],
      nombre: attributes[this.NOMBRE_INDEX],
      estimationNombre: attributes[this.ESTIMATION_NOMBRE_INDEX],
      distance: attributes[this.DISTANCE_INDEX],
      estimationDistance: attributes[this.ESTIMATION_DISTANCE_INDEX],
      regroupement: attributes[this.REGROUPEMENT_INDEX],
      comportements,
      milieux,
      commentaire: attributes[this.COMMENTAIRE_INDEX]
    };
  };
}
