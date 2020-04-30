import { Espece } from "ouca-common/espece.model";
import { findClasseByLibelle } from "../../sql-api/sql-api-classe";
import {
  findEspeceByCode,
  findEspeceByNomFrancais,
  findEspeceByNomLatin,
  persistEspece
} from "../../sql-api/sql-api-espece";
import { ImportService } from "./import-service";

export class ImportEspeceService extends ImportService {
  private readonly CLASSE_INDEX = 0;
  private readonly CODE_INDEX = 1;
  private readonly NOM_FRANCAIS_INDEX = 2;
  private readonly NOM_LATIN_INDEX = 3;

  private readonly CODE_MAX_LENGTH = 20;
  private readonly NOM_FRANCAIS_MAX_LENGTH = 100;
  private readonly NOM_LATIN_MAX_LENGTH = 100;

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
    const classe = await findClasseByLibelle(entityTab[this.CLASSE_INDEX]);

    if (!classe) {
      this.message = "La classe de cette espèce n'existe pas";
      return false;
    }

    // Check that the espece does not exists
    const especeByCode = await findEspeceByCode(entityTab[this.CODE_INDEX]);

    if (especeByCode) {
      this.message = "Il existe déjà une espèce avec ce code";
      return false;
    }

    const especeByNomFrancais = await findEspeceByNomFrancais(
      entityTab[this.NOM_FRANCAIS_INDEX]
    );

    if (especeByNomFrancais) {
      this.message = "Il existe déjà une espèce avec ce nom français";
      return false;
    }

    const especeByNomLatin = await findEspeceByNomLatin(
      entityTab[this.NOM_LATIN_INDEX]
    );

    if (especeByNomLatin) {
      this.message = "Il existe déjà une espèce avec ce nom latin";
      return false;
    }

    // Create and save the espece
    const especeToSave = this.buildEntity(entityTab, classe.id);

    const saveResult = await persistEspece(especeToSave);
    return !!saveResult?.insertId;
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

    if (code.length > this.CODE_MAX_LENGTH) {
      this.message =
        "La longueur maximale du code de l'espèce est de " +
        this.CODE_MAX_LENGTH +
        " caractères";
      return false;
    }

    return true;
  };

  private isNomFrancaisValid = (nom: string): boolean => {
    nom = nom.trim();

    if (!nom) {
      this.message = "Le nom français ne peut pas être vide";
      return false;
    }

    if (nom.length > this.NOM_FRANCAIS_MAX_LENGTH) {
      this.message =
        "La longueur maximale du nom français est de " +
        this.NOM_FRANCAIS_MAX_LENGTH +
        " caractères";
      return false;
    }

    return true;
  };

  private isNomLatinValid = (nom: string): boolean => {
    nom = nom.trim();

    if (!nom) {
      this.message = "Le nom latin ne peut pas être vide";
      return false;
    }

    if (nom.length > this.NOM_LATIN_MAX_LENGTH) {
      this.message =
        "La longueur maximale du nom latin est de " +
        this.NOM_LATIN_MAX_LENGTH +
        " caractères";
      return false;
    }

    return true;
  };
}
