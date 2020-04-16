import { Commune } from "ouca-common/commune.model";
import { Departement } from "ouca-common/departement.object";
import { saveEntity } from "../../sql-api/sql-api-common";
import {
  getCommuneByDepartementIdAndCode,
  getCommuneByDepartementIdAndNom
} from "../../sql-api/sql-api-commune";
import { getDepartementByCode } from "../../sql-api/sql-api-departement";
import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import { TABLE_COMMUNE } from "../../utils/constants";
import { ImportService } from "./import-service";

export class ImportCommuneService extends ImportService {
  private DEPARTEMENT_INDEX: number = 0;
  private CODE_INDEX: number = 1;
  private NOM_INDEX: number = 2;

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
    const departement: Departement = await getDepartementByCode(
      entityTab[this.DEPARTEMENT_INDEX]
    );

    if (!departement) {
      this.message = "Le département n'existe pas";
      return false;
    }

    // Check that the commune does not exists
    const communeByCode: Commune = await getCommuneByDepartementIdAndCode(
      departement.id,
      +entityTab[this.CODE_INDEX]
    );

    if (communeByCode && communeByCode.id) {
      this.message =
        "Il existe déjà une commune avec ce code dans ce département";
      return false;
    }

    const communeByNom: Commune = await getCommuneByDepartementIdAndNom(
      departement.id,
      entityTab[this.NOM_INDEX]
    );

    if (communeByNom && communeByNom.id) {
      this.message =
        "Il existe déjà une commune avec ce nom dans ce département";
      return false;
    }

    // Create and save the commune
    const communeToSave: Commune = this.buildEntity(entityTab, departement.id);

    return await saveEntity(
      TABLE_COMMUNE,
      communeToSave,
      DB_SAVE_MAPPING.commune
    );
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

    if (codeCommune < 0 || codeCommune > 99999) {
      this.message =
        "Le code de la commune doit être un entier compris entre 0 et 99999";
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

    if (nom.length > 100) {
      this.message =
        "La longueur maximale du nom de la commune est de 100 caractères";
      return false;
    }

    return true;
  };
}
