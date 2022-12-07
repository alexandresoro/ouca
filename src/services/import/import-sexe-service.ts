import { type Sexe } from "../../repositories/sexe/sexe-repository-types";
import { type LoggedUser } from "../../types/User";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportSexeService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.sexeService.findAllSexes();
  };

  protected getThisEntityName(): string {
    return "Ce sexe";
  }

  protected saveEntities = (ages: Omit<Sexe, "id" | "ownerId">[], loggedUser: LoggedUser): Promise<readonly Sexe[]> => {
    return this.services.sexeService.createSexes(ages, loggedUser);
  };
}
