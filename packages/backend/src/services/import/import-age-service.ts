import { type LoggedUser } from "@domain/user/logged-user.js";
import { type AgeSimple } from "@ou-ca/common/entities/age";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportAgeService extends ImportEntiteAvecLibelleService<AgeSimple> {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.ageService.findAllAges();
  };

  protected getThisEntityName(): string {
    return "Cet âge";
  }

  protected saveEntities = (
    ages: Omit<AgeSimple, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly AgeSimple[]> => {
    return this.services.ageService.createAges(ages, loggedUser);
  };
}
