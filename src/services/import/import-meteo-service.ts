import { type Meteo } from "../../repositories/meteo/meteo-repository-types";
import { type LoggedUser } from "../../types/User";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

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
