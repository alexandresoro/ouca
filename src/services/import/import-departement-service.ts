import { Departement } from "../../model/types/departement.object";
import { ImportedDepartement } from "../../objects/import/imported-departement.object";
import { findAllDepartements, insertDepartements } from "../../sql-api/sql-api-departement";
import { ImportService } from "./import-service";

export class ImportDepartementService extends ImportService {
  private departements: Departement[];

  private departementsToInsert: Departement[];

  protected getNumberOfColumns = (): number => {
    return 1;
  };


  protected init = async (): Promise<void> => {
    this.departementsToInsert = [];
    this.departements = await findAllDepartements();
  };

  protected validateAndPrepareEntity = (departementTab: string[]): string => {
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

    this.departementsToInsert.push(departementToSave);
    this.departements.push(departementToSave);
    return null;
  };

  protected persistAllValidEntities = async (): Promise<void> => {
    if (this.departementsToInsert.length) {
      await insertDepartements(this.departementsToInsert);
    }
  }


}
