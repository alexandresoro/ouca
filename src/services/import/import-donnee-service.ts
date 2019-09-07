import { Age } from "basenaturaliste-model/age.object";
import { Commune } from "basenaturaliste-model/commune.object";
import { Comportement } from "basenaturaliste-model/comportement.object";
import { Departement } from "basenaturaliste-model/departement.object";
import { Donnee } from "basenaturaliste-model/donnee.object";
import { Espece } from "basenaturaliste-model/espece.object";
import { EstimationDistance } from "basenaturaliste-model/estimation-distance.object";
import { EstimationNombre } from "basenaturaliste-model/estimation-nombre.object";
import { Inventaire } from "basenaturaliste-model/inventaire.object";
import { Lieudit } from "basenaturaliste-model/lieudit.object";
import { Meteo } from "basenaturaliste-model/meteo.object";
import { Milieu } from "basenaturaliste-model/milieu.object";
import { Observateur } from "basenaturaliste-model/observateur.object";
import { Sexe } from "basenaturaliste-model/sexe.object";
import {
  getEntityByCode,
  getEntityByLibelle,
  saveEntity
} from "../../sql-api/sql-api-common";
import { getCommuneByDepartementIdAndCode } from "../../sql-api/sql-api-commune";
import { getDepartementByCode } from "../../sql-api/sql-api-departement";
import { getLieuditByCommuneIdAndNom } from "../../sql-api/sql-api-lieudit";
import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import {
  TABLE_AGE,
  TABLE_COMPORTEMENT,
  TABLE_DONNEE,
  TABLE_ESTIMATION_DISTANCE,
  TABLE_ESTIMATION_NOMBRE,
  TABLE_INVENTAIRE,
  TABLE_METEO,
  TABLE_MILIEU,
  TABLE_OBSERVATEUR,
  TABLE_SEXE
} from "../../utils/constants";
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

  protected getNumberOfColumns = () => {
    return 32;
  }

  protected buildEntity = (
    entityTab: string[],
    inventaireId: number,
    especeId: number,
    sexeId: number,
    ageId: number,
    estimationNombreId: number,
    estimationDistanceId: number,
    comportementsIds: number[],
    milieuxIds: number[]
  ): Donnee => {
    return {
      id: null,
      inventaireId,
      especeId,
      sexeId,
      ageId,
      estimationNombreId,
      nombre: +entityTab[this.NOMBRE_INDEX],
      estimationDistanceId,
      distance: +entityTab[this.DISTANCE_INDEX],
      regroupement: +entityTab[this.REGROUPEMENT_INDEX],
      comportementsIds,
      milieuxIds,
      commentaire: !!entityTab[this.COMMENTAIRE_INDEX]
        ? entityTab[this.COMMENTAIRE_INDEX].replace(";", ",")
        : null
    };
  }

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    if (
      !this.isObservateurValid(entityTab[this.OBSERVATEUR_INDEX]) ||
      !this.isDateValid(entityTab[this.DATE_INDEX]) ||
      !this.isHeureValid(entityTab[this.HEURE_INDEX]) ||
      !this.isDureeValid(entityTab[this.DUREE_INDEX]) ||
      !this.isDepartementValid(entityTab[this.DEPARTEMENT_INDEX]) ||
      !this.isCodeCommuneValid(entityTab[this.CODE_COMMUNE_INDEX]) ||
      !this.isLieuditValid(entityTab[this.LIEUDIT_INDEX]) ||
      !this.isAltitudeValid(entityTab[this.ALTITUDE_INDEX]) ||
      !this.isLongitudeValid(entityTab[this.LONGITUDE_INDEX]) ||
      !this.isLatitudeValid(entityTab[this.LATITUDE_INDEX]) ||
      !this.isTemperatureValid(entityTab[this.TEMPERATURE_INDEX])
    ) {
      return false;
    }

    if (
      !this.isCodeEspeceValid(entityTab[this.CODE_ESPECE_INDEX]) ||
      !this.isSexeValid(entityTab[this.SEXE_INDEX]) ||
      !this.isAgeValid(entityTab[this.AGE_INDEX]) ||
      !this.isNombreValid(entityTab[this.NOMBRE_INDEX]) ||
      !this.isEstimationNombreValid(entityTab[this.ESTIMATION_NOMBRE_INDEX]) ||
      !this.isDistanceValid(entityTab[this.DISTANCE_INDEX]) ||
      !this.isEstimationDistanceValid(
        entityTab[this.ESTIMATION_DISTANCE_INDEX]
      ) ||
      !this.isRegroupementValid(entityTab[this.REGROUPEMENT_INDEX]) ||
      !this.areComportementsValid(entityTab) ||
      !this.areMilieuxValid(entityTab) ||
      !this.isCommentaireValid(entityTab[this.COMMENTAIRE_INDEX])
    ) {
      return false;
    }

    // Check that the observateur exists
    const observateur: Observateur = (await getEntityByLibelle(
      entityTab[this.OBSERVATEUR_INDEX],
      TABLE_OBSERVATEUR
    )) as Observateur;

    if (!observateur) {
      this.message =
        "L'observateur " + entityTab[this.OBSERVATEUR_INDEX] + " n'existe pas";
      return false;
    }

    // Check that the associes exist
    const associesIds: number[] = [];
    const associesTab: string[] = entityTab[this.ASSOCIES_INDEX].split(
      this.LIST_SEPARATOR
    );
    for (const associeStr of associesTab) {
      const associe: Observateur = (await getEntityByLibelle(
        associeStr,
        TABLE_OBSERVATEUR
      )) as Observateur;

      if (!associe) {
        this.message = "L'observateur associé " + associeStr + " n'existe pas";
        return false;
      }

      if (
        !associesIds.find((id) => {
          return id === associe.id;
        })
      ) {
        associesIds.push(associe.id);
      }
    }

    // Check that the departement exists
    const departement: Departement = await getDepartementByCode(
      entityTab[this.DEPARTEMENT_INDEX]
    );

    if (!departement) {
      this.message =
        "Le département " + entityTab[this.DEPARTEMENT_INDEX] + " n'existe pas";
      return false;
    }

    // Check that the commune exists
    const commune: Commune = await getCommuneByDepartementIdAndCode(
      departement.id,
      +entityTab[this.CODE_COMMUNE_INDEX]
    );

    if (!commune) {
      this.message =
        "La commune avec pour code " +
        entityTab[this.CODE_COMMUNE_INDEX] +
        " n'existe pas dans le département " +
        departement.code;
      return false;
    }

    // Check that the lieu-dit exists
    const lieudit: Lieudit = await getLieuditByCommuneIdAndNom(
      commune.id,
      entityTab[this.LIEUDIT_INDEX]
    );

    if (!lieudit) {
      this.message =
        "Le lieu-dit " +
        entityTab[this.LIEUDIT_INDEX] +
        " n'existe pas dans la commune " +
        commune.code +
        " - " +
        commune.nom +
        " du département " +
        departement.code;
      return false;
    }

    // Check if the coordinates are updated
    const areCoordinatesCustomized: boolean = this.areCoordinatesCustomized(
      lieudit,
      +entityTab[this.ALTITUDE_INDEX],
      +entityTab[this.LONGITUDE_INDEX],
      +entityTab[this.LATITUDE_INDEX]
    );

    // Check that the meteos exist
    const meteosIds: number[] = [];
    const meteosTab: string[] = entityTab[this.METEOS_INDEX].split(
      this.LIST_SEPARATOR
    );
    for (const meteoStr of meteosTab) {
      const meteo: Meteo = (await getEntityByLibelle(
        meteoStr,
        TABLE_METEO
      )) as Meteo;

      if (!meteo) {
        this.message = "La météo " + meteoStr + " n'existe pas";
        return false;
      }

      if (
        !meteosIds.find((id) => {
          return id === meteo.id;
        })
      ) {
        meteosIds.push(meteo.id);
      }
    }

    // Check that the espece exixts
    const espece: Espece = null;

    // Check that the sexe exists
    const sexe: Sexe = (await getEntityByLibelle(
      entityTab[this.SEXE_INDEX],
      TABLE_SEXE
    )) as Sexe;

    if (!sexe) {
      this.message = "Le sexe " + entityTab[this.SEXE_INDEX] + " n'existe pas";
      return false;
    }

    // Check that the age exists
    const age: Age = (await getEntityByLibelle(
      entityTab[this.AGE_INDEX],
      TABLE_AGE
    )) as Age;

    if (!age) {
      this.message = "L'âge " + entityTab[this.AGE_INDEX] + " n'existe pas";
      return false;
    }

    // Check that the estimation nombre exists
    const estimationNombre: EstimationNombre = (await getEntityByLibelle(
      entityTab[this.ESTIMATION_NOMBRE_INDEX],
      TABLE_ESTIMATION_NOMBRE
    )) as EstimationNombre;

    if (!estimationNombre) {
      this.message =
        "L'estimation du nombre " +
        entityTab[this.ESTIMATION_NOMBRE_INDEX] +
        " n'existe pas";
      return false;
    }

    // Check that if 'Non-compte' then the nombre is empty
    if (estimationNombre.nonCompte && !!entityTab[this.NOMBRE_INDEX]) {
      this.message =
        "L'estimation du nombre " +
        estimationNombre.libelle +
        " est de type non-compté donc le nombre devrait être vide";
      return false;
    }

    // Check that the estimation distance exists
    const estimationDistance: EstimationDistance = (await getEntityByLibelle(
      entityTab[this.ESTIMATION_DISTANCE_INDEX],
      TABLE_ESTIMATION_DISTANCE
    )) as EstimationDistance;

    if (!estimationDistance) {
      this.message =
        "L'estimation de la distance " +
        entityTab[this.ESTIMATION_DISTANCE_INDEX] +
        " n'existe pas";
      return false;
    }

    // Check that the comportements exist
    const comportementsIds: number[] = [];
    for (
      let compIndex = this.CODE_COMP_1_INDEX;
      compIndex < this.CODE_COMP_6_INDEX;
      compIndex++
    ) {
      const comportement: Comportement = (await getEntityByCode(
        entityTab[compIndex],
        TABLE_COMPORTEMENT
      )) as Comportement;

      if (!comportement) {
        this.message =
          "Le comportement avec pour code " +
          entityTab[compIndex] +
          " n'existe pas";
        return false;
      }

      if (
        !comportementsIds.find((id) => {
          return id === comportement.id;
        })
      ) {
        comportementsIds.push(comportement.id);
      }
    }

    // Check that the milieux exist
    const milieuxIds: number[] = [];
    for (
      let milieuIndex = this.CODE_MILIEU_1_INDEX;
      milieuIndex < this.CODE_MILIEU_4_INDEX;
      milieuIndex++
    ) {
      const milieu: Milieu = (await getEntityByCode(
        entityTab[milieuIndex],
        TABLE_MILIEU
      )) as Milieu;

      if (!milieu) {
        this.message =
          "Le milieu avec pour code " +
          entityTab[milieuIndex] +
          " n'existe pas";
        return false;
      }

      if (
        !milieuxIds.find((id) => {
          return id === milieu.id;
        })
      ) {
        milieuxIds.push(milieu.id);
      }
    }

    // Create the inventaire to save
    const inventaireToSave: Inventaire = this.buildInventaire(
      entityTab,
      observateur.id,
      associesIds,
      lieudit.id,
      meteosIds,
      areCoordinatesCustomized
    );

    // Save the inventaire if it does not exists or get the existing ID otherwise
    let inventaire: Inventaire = null; // TO DO
    if (!inventaire) {
      // Save the inventaire
      await saveEntity(
        TABLE_INVENTAIRE,
        inventaireToSave,
        DB_SAVE_MAPPING.inventaire
      );
      inventaire = null; // TO DO
    }

    inventaireToSave.id = inventaire.id;

    // Create the donnee to save
    const donneeToSave: Donnee = this.buildEntity(
      entityTab,
      inventaireToSave.id,
      espece.id,
      sexe.id,
      age.id,
      estimationNombre.id,
      estimationDistance ? estimationDistance.id : null,
      comportementsIds,
      milieuxIds
    );

    // Save the donnee if it does not exists already
    const donnee: Donnee = null; // TO DO
    if (!donnee) {
      return await saveEntity(
        TABLE_DONNEE,
        donneeToSave,
        DB_SAVE_MAPPING.donnee
      );
    } else {
      this.message = "Une donnée similaire existe déjà avec l'ID " + donnee.id;
      return false;
    }
  }

  private areCoordinatesCustomized = (
    lieudit: Lieudit,
    altitude: number,
    longitude: number,
    latitude: number
  ): boolean => {
    return (
      !!lieudit &&
      (altitude !== lieudit.altitude ||
        longitude !== lieudit.longitude ||
        latitude !== lieudit.latitude)
    );
  }

  private buildInventaire = (
    entityTab: string[],
    observateurId: number,
    associesIds: number[],
    lieuditId: number,
    meteosIds: number[],
    areCoordinatesCustomized: boolean
  ): Inventaire => {
    const inventaire: Inventaire = {
      id: null,
      observateurId,
      associesIds,
      date: entityTab[this.DATE_INDEX] as any,
      heure: entityTab[this.HEURE_INDEX],
      duree: entityTab[this.DUREE_INDEX],
      lieuditId,
      altitude: null,
      longitude: null,
      latitude: null,
      temperature: !!entityTab[this.TEMPERATURE_INDEX]
        ? +entityTab[this.TEMPERATURE_INDEX]
        : null,
      meteosIds
    };

    if (areCoordinatesCustomized) {
      inventaire.altitude = +entityTab[this.ALTITUDE_INDEX];
      inventaire.longitude = +entityTab[this.LONGITUDE_INDEX];
      inventaire.latitude = +entityTab[this.LATITUDE_INDEX];
    }

    return inventaire;
  }

  private isObservateurValid = (observateur: string): boolean => {
    return this.isNotEmptyString(observateur, "L'observateur");
  }

  private isDateValid = (dateStr: string): boolean => {
    return true; // TO DO
  }

  private isHeureValid = (heure: string): boolean => {
    return true; // TO DO
  }

  private isDureeValid = (duree: string): boolean => {
    return true; // TO DO
  }

  private isDepartementValid = (departement: string): boolean => {
    return this.isNotEmptyString(departement, "Le département");
  }

  private isCodeCommuneValid = (code: string): boolean => {
    code = code.trim();

    if (!code) {
      this.message = "Le code de la commune du lieu-dit ne peut pas être vide";
      return false;
    }

    if (!Number.isInteger(Number(code))) {
      this.message = "Le code de la commune du lieu-dit doit être un entier";
      return false;
    }

    return true;
  }

  private isLieuditValid = (lieudit: string): boolean => {
    return this.isNotEmptyString(lieudit, "Le lieu-dit");
  }

  private isAltitudeValid(altitudeStr: string) {
    if (!altitudeStr) {
      this.message = "L'altitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const altitude: number = Number(altitudeStr);

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

  private isLongitudeValid(longitudeStr: string) {
    if (!longitudeStr) {
      this.message = "La longitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const longitude: number = Number(longitudeStr);

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

  private isLatitudeValid(latitudeStr: string) {
    if (!latitudeStr) {
      this.message = "La latitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const latitude: number = Number(latitudeStr);

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
      const temperature: number = Number(temperatureStr);

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
  }

  private isCodeEspeceValid = (code: string): boolean => {
    return this.isNotEmptyString(code, "Le code de l'espèce");
  }

  private isSexeValid = (sexe: string): boolean => {
    return this.isNotEmptyString(sexe, "Le sexe");
  }

  private isAgeValid = (age: string): boolean => {
    return this.isNotEmptyString(age, "L'âge");
  }

  private isEstimationNombreValid = (estimation: string): boolean => {
    return this.isNotEmptyString(estimation, "L'estimation du nombre");
  }

  private isNombreValid = (nombreStr: string): boolean => {
    if (nombreStr) {
      const nombre: number = Number(nombreStr);

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
  }

  private isEstimationDistanceValid = (estimation: string): boolean => {
    return true;
  }

  private isDistanceValid = (distanceStr: string): boolean => {
    if (distanceStr) {
      const distance: number = Number(distanceStr);

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
  }

  private isRegroupementValid = (regroupementStr: string): boolean => {
    if (regroupementStr) {
      const regroupement: number = Number(regroupementStr);

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
  }

  private areComportementsValid = (entityTab: string[]): boolean => {
    return true;
  }

  private areMilieuxValid = (entityTab: string[]): boolean => {
    return true;
  }

  private isCommentaireValid = (commentaire: string): boolean => {
    return true;
  }

  private isNotEmptyString = (str: string, attributeType: string): boolean => {
    str = str.trim();

    if (!str) {
      this.message = attributeType + " ne peut pas être vide";
      return false;
    }

    return true;
  }
}
