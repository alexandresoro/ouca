import { Commune } from "ouca-common/commune.model";
import {
  CoordinatesSystem,
  CoordinatesSystemType,
  COORDINATES_SYSTEMS_CONFIG
} from "ouca-common/coordinates-system";
import { Departement } from "ouca-common/departement.object";
import { Lieudit } from "ouca-common/lieudit.model";
import {
  findCommuneByDepartementIdAndCode,
  findCommuneByDepartementIdAndNom
} from "../../sql-api/sql-api-commune";
import { findCoordinatesSystem } from "../../sql-api/sql-api-configuration";
import { getDepartementByCode } from "../../sql-api/sql-api-departement";
import {
  findLieuDitByCommuneIdAndNom,
  persistLieuDit
} from "../../sql-api/sql-api-lieudit";
import { ImportService } from "./import-service";

export class ImportLieuxditService extends ImportService {
  private readonly DEPARTEMENT_INDEX = 0;
  private readonly COMMUNE_INDEX = 1;
  private readonly NOM_INDEX = 2;
  private readonly LATITUDE_INDEX = 3;
  private readonly LONGITUDE_INDEX = 4;
  private readonly ALTITUDE_INDEX = 5;

  private readonly LIEUDIT_MAX_LENGTH = 150;
  private readonly ALTITUDE_MIN_VALUE = 0;
  private readonly ALTITUDE_MAX_VALUE = 65535;

  protected getNumberOfColumns = (): number => {
    return 6;
  };

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    const coordinatesSystemType = await findCoordinatesSystem();
    if (!coordinatesSystemType) {
      this.message =
        "Veuillez choisir le système de coordonnées de l'application dans la page de configuration";
      return false;
    }
    const coordinatesSystem = COORDINATES_SYSTEMS_CONFIG[coordinatesSystemType];

    if (
      !this.isDepartementValid(entityTab[this.DEPARTEMENT_INDEX]) ||
      !this.isCommuneValid(entityTab[this.COMMUNE_INDEX]) ||
      !this.isNomLieuditValid(entityTab[this.NOM_INDEX]) ||
      !this.isAltitudeValid(entityTab[this.ALTITUDE_INDEX].replace(",", ".")) ||
      !this.isLongitudeValid(
        entityTab[this.LONGITUDE_INDEX].replace(",", "."),
        coordinatesSystem
      ) ||
      !this.isLatitudeValid(
        entityTab[this.LATITUDE_INDEX].replace(",", "."),
        coordinatesSystem
      )
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
    const communeStr = entityTab[this.COMMUNE_INDEX];
    let commune: Commune = await findCommuneByDepartementIdAndNom(
      departement.id,
      communeStr
    );

    if (!commune && Number.isInteger(Number(communeStr))) {
      commune = await findCommuneByDepartementIdAndCode(
        departement.id,
        +communeStr
      );
    }

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

    const lieuditToSave = this.buildEntity(
      entityTab,
      commune.id,
      coordinatesSystemType
    );

    const saveResult = await persistLieuDit(lieuditToSave);
    return !!saveResult?.insertId;
  };

  protected buildEntity = (
    entityTab: string[],
    communeId: number,
    coordinatesSystemType: CoordinatesSystemType
  ): Lieudit => {
    return {
      id: null,
      communeId,
      nom: entityTab[this.NOM_INDEX].trim(),
      altitude: +entityTab[this.ALTITUDE_INDEX].replace(",", ".").trim(),
      coordinates: {
        longitude: +entityTab[this.LONGITUDE_INDEX].replace(",", ".").trim(),
        latitude: +entityTab[this.LATITUDE_INDEX].replace(",", ".").trim(),
        system: coordinatesSystemType
      }
    };
  };

  private isDepartementValid = (departement: string): boolean => {
    departement = departement.trim();

    if (!departement) {
      this.message = "Le département du lieu-dit ne peut pas être vide";
      return false;
    }
    return true;
  };

  private isCommuneValid = (code: string): boolean => {
    code = code.trim();

    if (!code) {
      this.message = "La commune du lieu-dit ne peut pas être vide";
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

    if (nom.length > this.LIEUDIT_MAX_LENGTH) {
      this.message =
        "La longueur maximale du nom du lieu-dit est de " +
        this.LIEUDIT_MAX_LENGTH +
        " caractères";
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

    if (
      altitude < this.ALTITUDE_MIN_VALUE ||
      altitude > this.ALTITUDE_MAX_VALUE
    ) {
      this.message =
        "L'altitude du lieu-dit doit être un entier compris entre " +
        this.ALTITUDE_MIN_VALUE +
        " et " +
        this.ALTITUDE_MAX_VALUE;
      return false;
    }

    return true;
  }

  private isLongitudeValid(
    longitudeStr: string,
    coordinatesSystem: CoordinatesSystem
  ): boolean {
    if (!longitudeStr) {
      this.message = "La longitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const longitude = Number(longitudeStr);

    if (
      isNaN(longitude) ||
      longitude < coordinatesSystem.longitudeRange.min ||
      longitude > coordinatesSystem.longitudeRange.max
    ) {
      this.message =
        "La longitude du lieu-dit doit être un nombre compris entre " +
        coordinatesSystem.longitudeRange.min +
        " et " +
        coordinatesSystem.longitudeRange.max;
      return false;
    }

    return true;
  }

  private isLatitudeValid(
    latitudeStr: string,
    coordinatesSystem: CoordinatesSystem
  ): boolean {
    if (!latitudeStr) {
      this.message = "La latitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const latitude = Number(latitudeStr);

    if (
      isNaN(latitude) ||
      latitude < coordinatesSystem.latitudeRange.min ||
      latitude > coordinatesSystem.latitudeRange.max
    ) {
      this.message =
        "La latitude du lieu-dit doit être un entier compris entre " +
        coordinatesSystem.latitudeRange.min +
        " et " +
        coordinatesSystem.latitudeRange.max;
      return false;
    }

    return true;
  }
}
