import { type Observer } from "@ou-ca/common/entities/observer";
import { type Observateur } from "../../repositories/observateur/observateur-repository-types.js";
import { type LoggedUser } from "../../types/User.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportObservateurService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.observateurService.findAllObservateurs();
  };

  protected getThisEntityName(): string {
    return "Cet observateur";
  }

  protected saveEntities = (
    observateurs: Omit<Observateur, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly Observer[]> => {
    return this.services.observateurService.createObservateurs(observateurs, loggedUser);
  };
}
