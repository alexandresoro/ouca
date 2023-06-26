import { type Species } from "@ou-ca/common/entities/species";
import { type SpeciesClass } from "@ou-ca/common/entities/species-class";
import { ImportedEspece } from "../../objects/import/imported-espece.object.js";
import { type EspeceCreateInput } from "../../repositories/espece/espece-repository-types.js";
import { type LoggedUser } from "../../types/User.js";
import { ImportService } from "./import-service.js";

export class ImportEspeceService extends ImportService {
  private classes!: SpeciesClass[];
  private especes!: (Species | ImportedEspece)[];

  private especesToInsert!: Omit<EspeceCreateInput, "owner_id">[];

  protected getNumberOfColumns = (): number => {
    return 4;
  };

  protected init = async (): Promise<void> => {
    this.especesToInsert = [];
    this.classes = await this.services.classeService.findAllClasses();
    this.especes = await this.services.especeService.findAllEspeces();
  };

  protected validateAndPrepareEntity = (especeTab: string[]): string | null => {
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
    const especeToSave = importedEspece.buildEspece(parseInt(classe.id));

    this.especesToInsert.push(especeToSave);
    this.especes.push(importedEspece);
    return null;
  };

  protected persistAllValidEntities = async (loggedUser: LoggedUser): Promise<void> => {
    if (this.especesToInsert.length) {
      await this.services.especeService.createEspeces(this.especesToInsert, loggedUser);
    }
  };
}
