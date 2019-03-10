import { Age } from "./age.object";
import { AppConfiguration } from "./app-configuration.object";
import { Departement } from "./departement.object";
import { EstimationNombre } from "./estimation-nombre.object";
import { Observateur } from "./observateur.object";
import { Sexe } from "./sexe.object";

export interface ConfigurationPage {
  appConfiguration: AppConfiguration;

  observateurs: Observateur[];

  departements: Departement[];

  estimationsNombre: EstimationNombre[];

  sexes: Sexe[];

  ages: Age[];
}
