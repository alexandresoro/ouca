import { Commune } from "ouca-common/commune.model";
import { Departement } from "ouca-common/departement.object";
import { Lieudit } from "ouca-common/lieudit.model";
import { findCommuneByDepartementIdAndCodeAndNom } from "../../sql-api/sql-api-commune";
import { getDepartementByCode } from "../../sql-api/sql-api-departement";
import {
  findLieuDitByCommuneIdAndNom,
  persistLieuDit
} from "../../sql-api/sql-api-lieudit";
import { ImportService } from "./import-service";

export class ImportLieuxditService extends ImportService {
  private DEPARTEMENT_INDEX: number = 0;
  private CODE_COMMUNE_INDEX: number = 1;
  private NOM_COMMUNE_INDEX: number = 2;
  private NOM_INDEX: number = 3;
  private ALTITUDE_INDEX: number = 4;
  private LONGITUDE_INDEX: number = 5;
  private LATITUDE_INDEX: number = 6;

  protected getNumberOfColumns = (): number => {
    return 7;
  };

  protected buildEntity = (entityTab: string[], communeId: number): Lieudit => {
    return {
      id: null,
      communeId,
      nom: entityTab[this.NOM_INDEX].trim(),
      altitude: +entityTab[this.ALTITUDE_INDEX].trim(),
      coordinates: null
    };
  };

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    if (
      !this.isDepartementValid(entityTab[this.DEPARTEMENT_INDEX]) ||
      !this.isCodeCommuneValid(entityTab[this.CODE_COMMUNE_INDEX]) ||
      !this.isNomCommuneValid(entityTab[this.NOM_COMMUNE_INDEX]) ||
      !this.isNomLieuditValid(entityTab[this.NOM_INDEX]) ||
      !this.isAltitudeValid(entityTab[this.ALTITUDE_INDEX]) ||
      !this.isLongitudeValid(entityTab[this.LONGITUDE_INDEX]) ||
      !this.isLatitudeValid(entityTab[this.LATITUDE_INDEX])
    ) {
      return false;
    }

    // Check that the departement exists
    const departement: Departement = await getDepartementByCode(
      entityTab[this.DEPARTEMENT_INDEX]
    );

    if (!departement) {
      this.message = "Le département n'existe pas";
      return false;
    }

    // Check that the commune exists
    const commune: Commune = await findCommuneByDepartementIdAndCodeAndNom(
      departement.id,
      +entityTab[this.CODE_COMMUNE_INDEX],
      entityTab[this.NOM_COMMUNE_INDEX]
    );

    if (!commune) {
      this.message = "La commune n'existe pas dans ce département";
      return false;
    }

    // Check that the lieu-dit does not exist yet
    const lieudit: Lieudit = await findLieuDitByCommuneIdAndNom(
      commune.id,
      entityTab[this.NOM_INDEX]
    );

    if (lieudit && lieudit.id) {
      this.message =
        "Il existe déjà un lieu-dit avec ce nom dans cette commune";
      return false;
    }

    const lieuditToSave = this.buildEntity(entityTab, commune.id);

    const saveResult = await persistLieuDit(lieuditToSave);
    return !!saveResult?.insertId;
  };

  private isDepartementValid = (departement: string): boolean => {
    departement = departement.trim();

    if (!departement) {
      this.message = "Le département du lieu-dit ne peut pas être vide";
      return false;
    }
    return true;
  };

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
  };

  private isNomCommuneValid = (nom: string): boolean => {
    nom = nom.trim();

    if (!nom) {
      this.message = "Le nom de la commune du lieu-dit ne peut pas être vide";
      return false;
    }

    return true;
  };

  private isNomLieuditValid = (nom: string): boolean => {
    nom = nom.trim();

    if (!nom) {
      this.message = "Le nom du lieu-dit ne peut pas être vide";
      return false;
    }

    if (nom.length > 150) {
      this.message =
        "La longueur maximale du nom du lieu-dit est de 150 caractères";
      return false;
    }

    return true;
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
}
