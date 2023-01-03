import { ImportedCommune } from "../../objects/import/imported-commune.object";
import { type Commune, type CommuneCreateInput } from "../../repositories/commune/commune-repository-types";
import { type Departement } from "../../repositories/departement/departement-repository-types";
import { type LoggedUser } from "../../types/User";
import { ImportService } from "./import-service";

export class ImportCommuneService extends ImportService {
  private departements!: Departement[];
  private communes!: (Commune | ImportedCommune)[];

  private communesToInsert!: Omit<CommuneCreateInput, "owner_id">[];

  protected getNumberOfColumns = (): number => {
    return 3;
  };

  protected init = async (): Promise<void> => {
    this.communesToInsert = [];
    [this.departements, this.communes] = await Promise.all([
      this.services.departementService.findAllDepartements(),
      this.services.communeService.findAllCommunes(),
    ]);
  };

  protected validateAndPrepareEntity = (communeTab: string[]): string | null => {
    const importedCommune = new ImportedCommune(communeTab);

    const dataValidity = importedCommune.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the departement exists
    const departement = this.departements.find((departement) => {
      return this.compareStrings(departement.code, importedCommune.departement);
    });
    if (!departement) {
      return "Le département n'existe pas";
    }

    // Check that the commune does not exists
    const commune = this.communes.find((commune) => {
      return (
        ((commune as Commune)?.departementId === departement.id ||
          (commune as ImportedCommune)?.departement === departement.code) &&
        (commune.code === +importedCommune.code || this.compareStrings(commune.nom, importedCommune.nom))
      );
    });
    if (commune) {
      return "Il existe déjà une commune avec ce code ou ce nom dans ce département";
    }

    // Create and save the commune
    const communeToSave = importedCommune.buildCommune(departement.id);

    this.communesToInsert.push(communeToSave);
    this.communes.push(importedCommune);
    return null;
  };

  protected persistAllValidEntities = async (loggedUser: LoggedUser): Promise<void> => {
    if (this.communesToInsert.length) {
      await this.services.communeService.createCommunes(this.communesToInsert, loggedUser);
    }
  };
}
