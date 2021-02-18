import { Classe, Espece } from "@ou-ca/ouca-model";
import { ImportedEspece } from "../../objects/import/imported-espece.object";
import { findAllClasses } from "../../sql-api/sql-api-classe";
import { findAllEspeces, persistEspece } from "../../sql-api/sql-api-espece";
import { ImportService } from "./import-service";

export class ImportEspeceService extends ImportService {

  private classes: Classe[];
  private especes: Espece[];

  protected getNumberOfColumns = (): number => {
    return 4;
  };

  protected init = async (): Promise<void> => {
    this.classes = await findAllClasses();
    this.especes = await findAllEspeces();
  }

  protected importEntity = async (especeTab: string[]): Promise<string> => {
    const importedEspece = new ImportedEspece(especeTab);

    const dataValidity = importedEspece.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the classe exists
    const classe = this.classes.find((classe) => {
      return this.compareStrings(classe.libelle, importedEspece.classe);
    });

    if (!classe) {
      return "La classe de cette espèce n'existe pas";
    }

    // Check that the espece does not exists
    const especeByCode = this.especes.find((espece) => {
      return this.compareStrings(espece.code, importedEspece.code);
    });
    if (especeByCode) {
      return "Il existe déjà une espèce avec ce code";
    }

    const especeByNomFrancais = this.especes.find((espece) => {
      return this.compareStrings(espece.nomFrancais, importedEspece.nomFrancais);
    });
    if (especeByNomFrancais) {
      return "Il existe déjà une espèce avec ce nom français";
    }

    const especeByNomLatin = this.especes.find((espece) => {
      return this.compareStrings(espece.nomLatin, importedEspece.nomLatin);
    });

    if (especeByNomLatin) {
      return "Il existe déjà une espèce avec ce nom scientifique";
    }

    // Create and save the espece
    const especeToSave = importedEspece.buildEspece(classe.id)

    const saveResult = await persistEspece(especeToSave);
    if (!saveResult?.insertId) {
      return "Une erreur est survenue pendant l'import";
    }

    this.especes.push(especeToSave);
    return null;
  };


}
