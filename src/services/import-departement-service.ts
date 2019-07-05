import { Departement } from "../basenaturaliste-model/departement.object";
import { saveEntity } from "../sql-api/sql-api-common";
import { getDepartementByCode } from "../sql-api/sql-api-departement";
import { DB_SAVE_MAPPING } from "../sql/sql-queries-utils";
import { TABLE_DEPARTEMENT } from "../utils/constants";
import { ImportService } from "./import-service";

export class ImportDepartementService extends ImportService {
  private CODE_INDEX: number = 0;

  protected getNumberOfColumns = () => {
    return 1;
  }

  protected buildEntity = (entityTab: string[]): Departement => {
    return {
      id: null,
      code: entityTab[this.CODE_INDEX].trim()
    };
  }

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    if (!this.isCodeValid(entityTab[this.CODE_INDEX])) {
      return false;
    }

    // Check that the departement does not exist
    const departement: Departement = await getDepartementByCode(
      entityTab[this.CODE_INDEX]
    );

    if (departement) {
      this.message = "Ce département existe déjà";
      return false;
    }

    // Create and save the commune
    const departementToSave: Departement = this.buildEntity(entityTab);

    return await saveEntity(
      TABLE_DEPARTEMENT,
      departementToSave,
      DB_SAVE_MAPPING.departement
    );
  }

  private isCodeValid = (code: string): boolean => {
    code = code.trim();

    if (!code) {
      this.message = "Le département ne peut pas être vide";
      return false;
    }

    if (code.length > 100) {
      this.message =
        "La longueur maximale du département est de 100 caractères";
      return false;
    }

    return true;
  }
}
