import { type LoggedUser } from "@domain/user/logged-user.js";
import { type SpeciesClass } from "@ou-ca/common/api/entities/species-class";
import { type Classe } from "../../repositories/classe/classe-repository-types.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportClasseService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.classService.findAllClasses();
  };

  protected getThisEntityName(): string {
    return "Cette classe espèce";
  }

  protected saveEntities = (
    classes: Omit<Classe, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly SpeciesClass[]> => {
    return this.services.classService.createClasses(classes, loggedUser);
  };
}
