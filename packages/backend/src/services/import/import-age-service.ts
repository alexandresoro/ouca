import { type Age } from "../../repositories/age/age-repository-types.js";
import { type LoggedUser } from "../../types/User.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportAgeService extends ImportEntiteAvecLibelleService<Age> {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.ageService.findAllAges();
  };

  protected getThisEntityName(): string {
    return "Cet âge";
  }

  protected saveEntities = (ages: Omit<Age, "id" | "ownerId">[], loggedUser: LoggedUser): Promise<readonly Age[]> => {
    return this.services.ageService.createAges(ages, loggedUser);
  };
}
