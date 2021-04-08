import { Classe } from "../../model/types/classe.object";
import { Espece } from "../../model/types/espece.model";
import { ImportedEspece } from "../../objects/import/imported-espece.object";
import { findAllClasses } from "../../sql-api/sql-api-classe";
import { findAllEspeces, insertEspeces } from "../../sql-api/sql-api-espece";
import { ImportService } from "./import-service";

export class ImportEspeceService extends ImportService {

  private classes: Classe[];
  private especes: Espece[];

  private especesToInsert: Espece[];

  protected getNumberOfColumns = (): number => {
    return 4;
  };

  protected init = async (): Promise<void> => {
    this.especesToInsert = [];
    this.classes = await findAllClasses();
    this.especes = await findAllEspeces();
  }

  protected validateAndPrepareEntity = (especeTab: string[]): string => {
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

    this.especesToInsert.push(especeToSave);
    this.especes.push(especeToSave);
    return null;
  };

  protected persistAllValidEntities = async (): Promise<void> => {
    if (this.especesToInsert.length) {
      await insertEspeces(this.especesToInsert);
    }
  }


}
