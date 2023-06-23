import { type Sex } from "@ou-ca/common/entities/sex";
import { type LoggedUser } from "../../types/User.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportSexeService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.sexeService.findAllSexes();
  };

  protected getThisEntityName(): string {
    return "Ce sexe";
  }

  protected saveEntities = (ages: Omit<Sex, "id" | "ownerId">[], loggedUser: LoggedUser): Promise<readonly Sex[]> => {
    return this.services.sexeService.createSexes(ages, loggedUser);
  };
}
