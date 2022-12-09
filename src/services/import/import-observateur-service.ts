import { type Observateur } from "../../repositories/observateur/observateur-repository-types";
import { type LoggedUser } from "../../types/User";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

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
  ): Promise<readonly Observateur[]> => {
    return this.services.observateurService.createObservateurs(observateurs, loggedUser);
  };
}
