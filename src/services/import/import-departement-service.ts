import { ImportedDepartement } from "../../objects/import/imported-departement.object";
import { type Departement } from "../../repositories/departement/departement-repository-types";
import { type LoggedUser } from "../../types/User";
import { ImportService } from "./import-service";

export class ImportDepartementService extends ImportService {
  private departements!: (Departement | Omit<Departement, "id" | "ownerId">)[];

  private departementsToInsert!: Omit<Departement, "id" | "ownerId">[];

  protected getNumberOfColumns = (): number => {
    return 1;
  };

  protected init = async (): Promise<void> => {
    this.departementsToInsert = [];
    this.departements = await this.services.departementService.findAllDepartements();
  };

  protected validateAndPrepareEntity = (departementTab: string[]): string | null => {
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

  protected persistAllValidEntities = async (loggedUser: LoggedUser): Promise<void> => {
    if (this.departementsToInsert.length) {
      await this.services.departementService.createDepartements(this.departementsToInsert, loggedUser);
    }
  };
}
