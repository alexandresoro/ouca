import { Departement } from "@prisma/client";
import { ImportedDepartement } from "../../objects/import/imported-departement.object";
import { LoggedUser } from "../../types/LoggedUser";
import { createDepartements, findDepartements } from "../entities/departement-service";
import { ImportService } from "./import-service";

export class ImportDepartementService extends ImportService {
  private departements!: (Departement | Omit<Departement, "id" | "ownerId">)[];

  private departementsToInsert!: Omit<Departement, "id" | "ownerId">[];

  protected getNumberOfColumns = (): number => {
    return 1;
  };

  protected init = async (): Promise<void> => {
    this.departementsToInsert = [];
    this.departements = await findDepartements(null);
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
      await createDepartements(this.departementsToInsert, loggedUser);
    }
  };
}
