import { Commune, DepartementWithCounts } from "../../model/graphql";
import { ImportedCommune } from "../../objects/import/imported-commune.object";
import { findAllCommunes, insertCommunes } from "../entities/commune-service";
import { findAllDepartements } from "../entities/departement-service";
import { ImportService } from "./import-service";

export class ImportCommuneService extends ImportService {

  private departements: DepartementWithCounts[];
  private communes: Omit<Commune, 'departement'>[];

  private communesToInsert: Omit<Commune, 'departement'>[];

  protected getNumberOfColumns = (): number => {
    return 3;
  };

  protected init = async (): Promise<void> => {
    this.communesToInsert = [];
    [this.departements, this.communes] = await Promise.all([findAllDepartements(), findAllCommunes()]);
  };

  protected validateAndPrepareEntity = (communeTab: string[]): string => {
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

    this.communesToInsert.push(communeToSave);
    this.communes.push(communeToSave);
    return null;
  };

  protected persistAllValidEntities = async (): Promise<void> => {
    if (this.communesToInsert.length) {
      await insertCommunes(this.communesToInsert);
    }
  }

}
