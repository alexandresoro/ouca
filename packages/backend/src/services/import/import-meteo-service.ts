import { type Meteo } from "../../repositories/meteo/meteo-repository-types.js";
import { type LoggedUser } from "../../types/User.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportMeteoService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.meteoService.findAllMeteos();
  };

  protected getThisEntityName(): string {
    return "Cette météo";
  }

  protected saveEntities = (
    ages: Omit<Meteo, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly Meteo[]> => {
    return this.services.meteoService.createMeteos(ages, loggedUser);
  };
}
