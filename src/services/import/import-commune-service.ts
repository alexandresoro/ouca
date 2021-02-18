import { Commune, Departement } from "@ou-ca/ouca-model";
import { ImportedCommune } from "../../objects/import/imported-commune.object";
import { findAllCommunes, persistCommune } from "../../sql-api/sql-api-commune";
import { findAllDepartements } from "../../sql-api/sql-api-departement";
import { ImportService } from "./import-service";

export class ImportCommuneService extends ImportService {

  private departements: Departement[];
  private communes: Commune[];

  protected getNumberOfColumns = (): number => {
    return 3;
  };

  protected init = async (): Promise<void> => {
    [this.departements, this.communes] = await Promise.all([findAllDepartements(), findAllCommunes()]);
  };

  protected importEntity = async (communeTab: string[]): Promise<string> => {
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
        commune.departementId === departement.id &&
        (commune.code === +importedCommune.code ||
          this.compareStrings(commune.nom, importedCommune.nom))
      );
    });
    if (commune) {
      return "Il existe déjà une commune avec ce code ou ce nom dans ce département";
    }

    // Create and save the commune
    const communeToSave = importedCommune.buildCommune(departement.id);

    const saveResult = await persistCommune(communeToSave);
    if (!saveResult?.insertId) {
      return "Une erreur est survenue pendant l'import";
    }

    this.communes.push(communeToSave);
    return null;
  };

}
