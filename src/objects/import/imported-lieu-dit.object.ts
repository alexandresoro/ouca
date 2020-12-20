import { CoordinatesSystem } from "@ou-ca/ouca-model/coordinates-system";
import { Lieudit } from "@ou-ca/ouca-model/lieudit.model";

const DEPARTEMENT_INDEX = 0;
const COMMUNE_INDEX = 1;
const NOM_INDEX = 2;
const LATITUDE_INDEX = 3;
const LONGITUDE_INDEX = 4;
const ALTITUDE_INDEX = 5;

const LIEUDIT_MAX_LENGTH = 150;
const ALTITUDE_MIN_VALUE = 0;
const ALTITUDE_MAX_VALUE = 65535;

export class ImportedLieuDit {

  departement: string;
  commune: string;
  nom: string;
  latitude: string;
  altitude: string;
  longitude: string;
  coordinatesSystem: CoordinatesSystem;

  constructor(lieuDitTab: string[], coordinatesSystem: CoordinatesSystem) {
    this.departement = lieuDitTab[DEPARTEMENT_INDEX].trim();
    this.commune = lieuDitTab[COMMUNE_INDEX].trim();
    this.nom = lieuDitTab[NOM_INDEX].trim();
    this.latitude = lieuDitTab[LATITUDE_INDEX].trim().replace(",", ".");
    this.longitude = lieuDitTab[LONGITUDE_INDEX].trim().replace(",", ".");
    this.altitude = lieuDitTab[ALTITUDE_INDEX].trim().replace(",", ".");
    this.coordinatesSystem = coordinatesSystem;
  }

  buildLieudit = (
    communeId: number
  ): Lieudit => {
    return {
      id: null,
      communeId,
      nom: this.nom,
      altitude: +this.altitude,
      coordinates: {
        longitude: +this.longitude,
        latitude: +this.latitude,
        system: this.coordinatesSystem.code
      }
    };
  };

  checkValidity = (): string => {
    const departementError = this.checkDepartementValidity();
    if(departementError){
      return departementError;
    }

    const communeError = this.checkCommuneValidity();
    if(communeError){
      return communeError;
    }

    const nomLieuditError = this.checkNomValidity();
    if(nomLieuditError){
      return nomLieuditError;
    }

    const altitudeError = this.checkAltitudeValidity();
    if(altitudeError){
      return altitudeError;
    }

    const longitudeError =this.checkLongitudeValidity(
    );
    if(longitudeError){
      return longitudeError;
    }

    const latitudeError =  this.checkLatitudeValidity(
    );
    if(latitudeError){
      return latitudeError;
    }
  }


  private checkDepartementValidity = (): string => {
    return this.departement ? null : "Le département du lieu-dit ne peut pas être vide";
  };

  private checkCommuneValidity = (): string => {
      return this.commune ? null :  "La commune du lieu-dit ne peut pas être vide";   
  };

  private checkNomValidity = (): string => {
    if (!this.nom) {
      return "Le nom du lieu-dit ne peut pas être vide";
    }

    if (this.nom.length > LIEUDIT_MAX_LENGTH) {
      return `La longueur maximale du nom du lieu-dit est de ${LIEUDIT_MAX_LENGTH} caractères`;
    }

    return null;
  };

  private checkAltitudeValidity(): string {
    if (!this.altitude) {
      return "L'altitude du lieu-dit ne peut pas être vide";
    }

    const altitude = Number(this.altitude);

    if (!Number.isInteger(altitude)) {
      return "L'altitude du lieu-dit doit être un entier";
    }

    if (
      altitude < ALTITUDE_MIN_VALUE ||
      altitude > ALTITUDE_MAX_VALUE
    ) {
    return `L'altitude du lieu-dit doit être un entier compris entre ${ALTITUDE_MIN_VALUE} et ${ALTITUDE_MAX_VALUE}`;
    }

    return null;
  }

  private checkLongitudeValidity(
  ): string {
    if (!this.longitude) {
    return "La longitude du lieu-dit ne peut pas être vide";
    }

    const longitude = Number(this.longitude);

    if (
      isNaN(longitude) ||
      longitude < this.coordinatesSystem.longitudeRange.min ||
      longitude > this.coordinatesSystem.longitudeRange.max
    ) {
      return `La longitude du lieu-dit doit être un nombre compris entre ${this.coordinatesSystem.longitudeRange.min} et ${this.coordinatesSystem.longitudeRange.max}`;
    }
  }

  private checkLatitudeValidity(): string {
    if (!this.latitude) {
      return "La latitude du lieu-dit ne peut pas être vide";
    }

    const latitude = Number(this.latitude);

    if (
      isNaN(latitude) ||
      latitude < this.coordinatesSystem.latitudeRange.min ||
      latitude > this.coordinatesSystem.latitudeRange.max
    ) {
      return `La latitude du lieu-dit doit être un entier compris entre " ${this.coordinatesSystem.latitudeRange.min} et ${this.coordinatesSystem.latitudeRange.max}`;
    }
  }
}