import { type Classe } from "@prisma/client";
import { type LoggedUser } from "../../types/User";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

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
  ): Promise<readonly Classe[]> => {
    return this.services.classeService.createClasses(classes, loggedUser);
  };
}
