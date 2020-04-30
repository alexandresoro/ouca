import { Departement } from "ouca-common/departement.object";
import {
  getDepartementByCode,
  persistDepartement
} from "../../sql-api/sql-api-departement";
import { ImportService } from "./import-service";

export class ImportDepartementService extends ImportService {
  private readonly CODE_INDEX = 0;

  private readonly CODE_MAX_LENGTH = 100;

  protected getNumberOfColumns = (): number => {
    return 1;
  };

  protected buildEntity = (entityTab: string[]): Departement => {
    return {
      id: null,
      code: entityTab[this.CODE_INDEX].trim()
    };
  };

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    if (!this.isCodeValid(entityTab[this.CODE_INDEX])) {
      return false;
    }

    // Check that the departement does not exist
    const departement = await getDepartementByCode(entityTab[this.CODE_INDEX]);

    if (departement) {
      this.message = "Ce département existe déjà";
      return false;
    }

    // Create and save the commune
    const departementToSave = this.buildEntity(entityTab);

    const saveResult = await persistDepartement(departementToSave);
    return !!saveResult?.insertId;
  };

  private isCodeValid = (code: string): boolean => {
    code = code.trim();

    if (!code) {
      this.message = "Le département ne peut pas être vide";
      return false;
    }

    if (code.length > this.CODE_MAX_LENGTH) {
      this.message =
        "La longueur maximale du département est de " +
        this.CODE_MAX_LENGTH +
        " caractères";
      return false;
    }

    return true;
  };
}
