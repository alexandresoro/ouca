import { Departement } from "@ou-ca/ouca-model";
import { ImportedDepartement } from "../../objects/import/imported-departement.object";
import { findAllDepartements, persistDepartement } from "../../sql-api/sql-api-departement";
import { ImportServiceSingle } from "./import-service-single";

export class ImportDepartementService extends ImportServiceSingle {
  private departements: Departement[];

  protected getNumberOfColumns = (): number => {
    return 1;
  };


  protected init = async (): Promise<void> => {
    this.departements = await findAllDepartements();
  };

  protected importEntity = async (departementTab: string[]): Promise<string> => {
    const importedDepartement = new ImportedDepartement(departementTab);

    const dataValidity = importedDepartement.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the departement does not exist
    const existingDepartement = this.departements.find((d) => {
      return this.compareStrings(d.code, importedDepartement.code);
    });
    if (existingDepartement) {
      return "Ce département existe déjà";
    }

    // Create and save the commune
    const departementToSave = importedDepartement.buildDepartement();

    const saveResult = await persistDepartement(departementToSave);
    if (!saveResult?.insertId) {
      return "Une erreur est survenue pendant l'import";
    }

    this.departements.push(departementToSave);
    return null;
  };


}
