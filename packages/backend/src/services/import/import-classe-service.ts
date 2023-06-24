import { type SpeciesClass } from "@ou-ca/common/entities/species-class";
import { type Classe } from "../../repositories/classe/classe-repository-types.js";
import { type LoggedUser } from "../../types/User.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportClasseService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.classeService.findAllClasses();
  };

  protected getThisEntityName(): string {
    return "Cette classe espèce";
  }

  protected saveEntities = (
    classes: Omit<Classe, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly SpeciesClass[]> => {
    return this.services.classeService.createClasses(classes, loggedUser);
  };
}
