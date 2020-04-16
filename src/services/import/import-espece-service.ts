import { Classe } from "ouca-common/classe.object";
import { Espece } from "ouca-common/espece.model";
import { getClasseByLibelle } from "../../sql-api/sql-api-classe";
import { saveEntity } from "../../sql-api/sql-api-common";
import {
  findEspeceByCode,
  getEspeceByNomFrancais,
  getEspeceByNomLatin
} from "../../sql-api/sql-api-espece";
import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import { TABLE_ESPECE } from "../../utils/constants";
import { ImportService } from "./import-service";

export class ImportEspeceService extends ImportService {
  private CLASSE_INDEX: number = 0;
  private CODE_INDEX: number = 1;
  private NOM_FRANCAIS_INDEX: number = 2;
  private NOM_LATIN_INDEX: number = 3;

  protected getNumberOfColumns = (): number => {
    return 4;
  };

  protected buildEntity = (entityTab: string[], classeId: number): Espece => {
    return {
      id: null,
      classeId,
      code: entityTab[this.CODE_INDEX].trim(),
      nomFrancais: entityTab[this.NOM_FRANCAIS_INDEX].trim(),
      nomLatin: entityTab[this.NOM_LATIN_INDEX].trim()
    };
  };

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    if (
      !this.isClasseValid(entityTab[this.CLASSE_INDEX]) ||
      !this.isCodeValid(entityTab[this.CODE_INDEX]) ||
      !this.isNomFrancaisValid(entityTab[this.NOM_FRANCAIS_INDEX]) ||
      !this.isNomLatinValid(entityTab[this.NOM_LATIN_INDEX])
    ) {
      return false;
    }

    // Check that the classe exists
    const classe: Classe = await getClasseByLibelle(
      entityTab[this.CLASSE_INDEX]
    );

    if (!classe) {
      this.message = "La classe de cette espèce n'existe pas";
      return false;
    }

    // Check that the espece does not exists
    const especeByCode: Espece = await findEspeceByCode(
      entityTab[this.CODE_INDEX]
    );

    if (especeByCode) {
      this.message = "Il existe déjà une espèce avec ce code";
      return false;
    }

    const especeByNomFrancais: Espece = await getEspeceByNomFrancais(
      entityTab[this.NOM_FRANCAIS_INDEX]
    );

    if (especeByNomFrancais) {
      this.message = "Il existe déjà une espèce avec ce nom français";
      return false;
    }

    const especeByNomLatin: Espece = await getEspeceByNomLatin(
      entityTab[this.NOM_LATIN_INDEX]
    );

    if (especeByNomLatin) {
      this.message = "Il existe déjà une espèce avec ce nom latin";
      return false;
    }

    // Create and save the espece
    const especeToSave: Espece = this.buildEntity(entityTab, classe.id);

    return await saveEntity(TABLE_ESPECE, especeToSave, DB_SAVE_MAPPING.espece);
  };

  private isClasseValid = (classe: string): boolean => {
    classe = classe.trim();

    if (!classe) {
      this.message = "La classe de l'espèce ne peut pas être vide";
      return false;
    }
    return true;
  };

  private isCodeValid = (code: string): boolean => {
    code = code.trim();

    if (!code) {
      this.message = "Le code de l'espèce ne peut pas être vide";
      return false;
    }

    if (code.length > 20) {
      this.message =
        "La longueur maximale du code de l'espèce est de 20 caractères";
      return false;
    }

    return true;
  };

  private isNomFrancaisValid = (code: string): boolean => {
    code = code.trim();

    if (!code) {
      this.message = "Le nom français ne peut pas être vide";
      return false;
    }

    if (code.length > 100) {
      this.message =
        "La longueur maximale du nom français est de 100 caractères";
      return false;
    }

    return true;
  };

  private isNomLatinValid = (code: string): boolean => {
    code = code.trim();

    if (!code) {
      this.message = "Le nom latin ne peut pas être vide";
      return false;
    }

    if (code.length > 100) {
      this.message = "La longueur maximale du nom latin est de 100 caractères";
      return false;
    }

    return true;
  };
}
