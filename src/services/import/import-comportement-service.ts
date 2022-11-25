import { type Comportement, type Prisma } from "@prisma/client";
import { type LoggedUser } from "../../types/LoggedUser";
import { createComportements, findComportements } from "../entities/comportement-service";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportComportementService extends ImportEntiteAvecLibelleEtCodeService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findComportements(null);
  };

  protected getAnEntityName(): string {
    return "un comportement";
  }

  protected saveEntities = (
    comportements: Omit<Comportement, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<Prisma.BatchPayload> => {
    return createComportements(comportements, loggedUser);
  };
}
