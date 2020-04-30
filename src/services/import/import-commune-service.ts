import { Commune } from "ouca-common/commune.model";
import {
  findCommuneByDepartementIdAndCode,
  findCommuneByDepartementIdAndNom,
  persistCommune
} from "../../sql-api/sql-api-commune";
import { getDepartementByCode } from "../../sql-api/sql-api-departement";
import { ImportService } from "./import-service";

export class ImportCommuneService extends ImportService {
  private readonly DEPARTEMENT_INDEX = 0;
  private readonly CODE_INDEX = 1;
  private readonly NOM_INDEX = 2;

  private readonly CODE_MIN_VALUE = 0;
  private readonly CODE_MAX_VALUE = 65535;
  private readonly NOM_MAX_LENGTH = 100;

  protected getNumberOfColumns = (): number => {
    return 3;
  };

  protected buildEntity = (
    entityTab: string[],
    departementId: number
  ): Commune => {
    return {
      id: null,
      departementId,
      code: +entityTab[this.CODE_INDEX].trim(),
      nom: entityTab[this.NOM_INDEX].trim()
    };
  };

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    if (
      !this.isDepartementValid(entityTab[this.DEPARTEMENT_INDEX]) ||
      !this.isCodeCommuneValid(entityTab[this.CODE_INDEX]) ||
      !this.isNomCommuneValid(entityTab[this.NOM_INDEX])
    ) {
      return false;
    }

    // Check that the departement exists
    const departement = await getDepartementByCode(
      entityTab[this.DEPARTEMENT_INDEX]
    );

    if (!departement) {
      this.message = "Le département n'existe pas";
      return false;
    }

    // Check that the commune does not exists
    const communeByCode = await findCommuneByDepartementIdAndCode(
      departement.id,
      +entityTab[this.CODE_INDEX]
    );

    if (communeByCode?.id) {
      this.message =
        "Il existe déjà une commune avec ce code dans ce département";
      return false;
    }

    const communeByNom = await findCommuneByDepartementIdAndNom(
      departement.id,
      entityTab[this.NOM_INDEX]
    );

    if (communeByNom?.id) {
      this.message =
        "Il existe déjà une commune avec ce nom dans ce département";
      return false;
    }

    // Create and save the commune
    const communeToSave = this.buildEntity(entityTab, departement.id);

    const saveResult = await persistCommune(communeToSave);
    return !!saveResult?.insertId;
  };

  private isDepartementValid = (departement: string): boolean => {
    departement = departement.trim();

    if (!departement) {
      this.message = "Le département de la commune ne peut pas être vide";
      return false;
    }
    return true;
  };

  private isCodeCommuneValid = (codeStr: string): boolean => {
    codeStr = codeStr.trim();

    if (!codeStr) {
      this.message = "Le code de la commune ne peut pas être vide";
      return false;
    }

    const codeCommune = Number(codeStr);

    if (!Number.isInteger(codeCommune)) {
      this.message = "Le code de la commune doit être un entier";
      return false;
    }

    if (
      codeCommune < this.CODE_MIN_VALUE ||
      codeCommune > this.CODE_MAX_VALUE
    ) {
      this.message =
        "Le code de la commune doit être un entier compris entre " +
        this.CODE_MIN_VALUE +
        " et " +
        this.CODE_MAX_VALUE;
      return false;
    }

    return true;
  };

  private isNomCommuneValid = (nom: string): boolean => {
    nom = nom.trim();

    if (!nom) {
      this.message = "Le nom de la commune ne peut pas être vide";
      return false;
    }

    if (nom.length > this.NOM_MAX_LENGTH) {
      this.message =
        "La longueur maximale du nom de la commune est de " +
        this.NOM_MAX_LENGTH +
        " caractères";
      return false;
    }

    return true;
  };
}
