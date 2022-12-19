import { type Milieu } from "../../repositories/milieu/milieu-repository-types";
import { type LoggedUser } from "../../types/User";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportMilieuService extends ImportEntiteAvecLibelleEtCodeService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.milieuService.findAllMilieux();
  };

  protected getAnEntityName(): string {
    return "un milieu";
  }

  protected saveEntities = (
    milieux: Omit<Milieu, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly Milieu[]> => {
    return this.services.milieuService.createMilieux(milieux, loggedUser);
  };
}
