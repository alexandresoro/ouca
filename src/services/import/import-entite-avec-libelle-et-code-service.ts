import { EntiteAvecLibelleEtCode } from "ouca-common/entite-avec-libelle-et-code.object";
import {
  getEntityByCode,
  getEntityByLibelle,
  saveEntity
} from "../../sql-api/sql-api-common";
import { ImportService } from "./import-service";

export abstract class ImportEntiteAvecLibelleEtCodeService extends ImportService {
  private CODE_INDEX: number = 0;
  private LIBELLE_INDEX: number = 1;

  protected getNumberOfColumns = (): number => {
    return 2;
  };

  protected buildEntity = (entityTab: string[]): EntiteAvecLibelleEtCode => {
    return {
      id: null,
      code: entityTab[this.CODE_INDEX].trim(),
      libelle: entityTab[this.LIBELLE_INDEX].trim()
    };
  };

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    if (
      !this.isCodeValid(entityTab[this.CODE_INDEX]) ||
      !this.isLibelleValid(entityTab[this.LIBELLE_INDEX])
    ) {
      return false;
    }

    // Check that the entity does not exist
    const entityByCode: EntiteAvecLibelleEtCode = (await getEntityByCode(
      entityTab[this.CODE_INDEX],
      this.getTableName()
    )) as EntiteAvecLibelleEtCode;

    if (entityByCode) {
      this.message =
        "Il existe déjà " + this.getAnEntityName() + " avec ce code";
      return false;
    }

    const entityByLibelle: EntiteAvecLibelleEtCode = (await getEntityByLibelle(
      entityTab[this.LIBELLE_INDEX],
      this.getTableName()
    )) as EntiteAvecLibelleEtCode;

    if (entityByLibelle) {
      this.message =
        "Il existe déjà " + this.getAnEntityName() + " avec ce libellé";
      return false;
    }

    // Create and save the entity
    const entityToSave: EntiteAvecLibelleEtCode = this.buildEntity(entityTab);

    return await saveEntity(
      this.getTableName(),
      entityToSave,
      this.getDbMapping()
    );
  };

  protected abstract getTableName(): string;

  protected abstract getDbMapping(): { [column: string]: string };

  protected abstract getAnEntityName(): string;

  private isCodeValid = (code: string): boolean => {
    code = code.trim();

    if (!code) {
      this.message = "Le code ne peut pas être vide";
      return false;
    }

    if (code.length > 6) {
      this.message = "La longueur maximale du code est de 6 caractères";
      return false;
    }

    return true;
  };

  private isLibelleValid = (libelle: string): boolean => {
    libelle = libelle.trim();

    if (!libelle) {
      this.message = "Le libellé ne peut pas être vide";
      return false;
    }

    if (libelle.length > 100) {
      this.message = "La longueur maximale du libellé est de 100 caractères";
      return false;
    }

    return true;
  };
}
