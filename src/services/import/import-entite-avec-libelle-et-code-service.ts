import { EntiteAvecLibelleEtCode } from "ouca-common/entite-avec-libelle-et-code.object";
import {
  findEntityByCode,
  findEntityByLibelle,
  persistEntity
} from "../../sql-api/sql-api-common";
import { ImportService } from "./import-service";

export abstract class ImportEntiteAvecLibelleEtCodeService extends ImportService {
  private readonly CODE_INDEX = 0;
  private readonly LIBELLE_INDEX = 1;

  private readonly CODE_MAX_LENGTH = 6;
  private readonly LIBELLE_MAX_LENGTH = 100;

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
    const entityByCode = await findEntityByCode<EntiteAvecLibelleEtCode>(
      entityTab[this.CODE_INDEX],
      this.getTableName()
    );

    if (entityByCode) {
      this.message =
        "Il existe déjà " + this.getAnEntityName() + " avec ce code";
      return false;
    }

    const entityByLibelle = await findEntityByLibelle<EntiteAvecLibelleEtCode>(
      entityTab[this.LIBELLE_INDEX],
      this.getTableName()
    );

    if (entityByLibelle) {
      this.message =
        "Il existe déjà " + this.getAnEntityName() + " avec ce libellé";
      return false;
    }

    // Create and save the entity
    const entityToSave = this.buildEntity(entityTab);

    const saveResult = await persistEntity(
      this.getTableName(),
      entityToSave,
      this.getDbMapping()
    );
    return !!saveResult?.insertId;
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

    if (code.length > this.CODE_MAX_LENGTH) {
      this.message =
        "La longueur maximale du code est de " +
        this.CODE_MAX_LENGTH +
        " caractères";
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

    if (libelle.length > this.LIBELLE_MAX_LENGTH) {
      this.message =
        "La longueur maximale du libellé est de " +
        this.LIBELLE_MAX_LENGTH +
        " caractères";
      return false;
    }

    return true;
  };
}
