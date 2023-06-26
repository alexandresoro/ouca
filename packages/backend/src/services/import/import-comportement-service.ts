import { type Behavior } from "@ou-ca/common/entities/behavior";
import { type Comportement } from "../../repositories/comportement/comportement-repository-types.js";
import { type LoggedUser } from "../../types/User.js";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service.js";

export class ImportComportementService extends ImportEntiteAvecLibelleEtCodeService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.comportementService.findAllComportements();
  };

  protected getAnEntityName(): string {
    return "un comportement";
  }

  protected saveEntities = (
    comportements: Omit<Comportement, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly Behavior[]> => {
    return this.services.comportementService.createComportements(comportements, loggedUser);
  };
}
