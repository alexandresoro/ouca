import {
  IMPORT_AGE,
  IMPORT_CLASSE,
  IMPORT_COMMUNE,
  IMPORT_COMPORTEMENT,
  IMPORT_DEPARTEMENT,
  IMPORT_DONNEE,
  IMPORT_ESPECE,
  IMPORT_ESTIMATION_DISTANCE,
  IMPORT_ESTIMATION_NOMBRE,
  IMPORT_LIEUDIT,
  IMPORT_METEO,
  IMPORT_MILIEU,
  IMPORT_OBSERVATEUR,
  IMPORT_SEXE,
  type ImportType,
} from "../../model/import-types";
import { type Services } from "../services";
import { ImportAgeService } from "./import-age-service";
import { ImportClasseService } from "./import-classe-service";
import { ImportCommuneService } from "./import-commune-service";
import { ImportComportementService } from "./import-comportement-service";
import { ImportDepartementService } from "./import-departement-service";
import { ImportDonneeService } from "./import-donnee-service";
import { ImportEspeceService } from "./import-espece-service";
import { ImportEstimationDistanceService } from "./import-estimation-distance-service";
import { ImportEstimationNombreService } from "./import-estimation-nombre-service";
import { ImportLieuxditService } from "./import-lieudit-service";
import { ImportMeteoService } from "./import-meteo-service";
import { ImportMilieuService } from "./import-milieu-service";
import { ImportObservateurService } from "./import-observateur-service";
import { type ImportService } from "./import-service";
import { ImportSexeService } from "./import-sexe-service";

export const getNewImportServiceForRequestType = (requestType: ImportType, services: Services): ImportService => {
  switch (requestType) {
    case IMPORT_OBSERVATEUR:
      return new ImportObservateurService(services);
    case IMPORT_DEPARTEMENT:
      return new ImportDepartementService(services);
    case IMPORT_COMMUNE:
      return new ImportCommuneService(services);
    case IMPORT_LIEUDIT:
      return new ImportLieuxditService(services);
    case IMPORT_METEO:
      return new ImportMeteoService(services);
    case IMPORT_CLASSE:
      return new ImportClasseService(services);
    case IMPORT_ESPECE:
      return new ImportEspeceService(services);
    case IMPORT_AGE:
      return new ImportAgeService(services);
    case IMPORT_SEXE:
      return new ImportSexeService(services);
    case IMPORT_ESTIMATION_NOMBRE:
      return new ImportEstimationNombreService(services);
    case IMPORT_ESTIMATION_DISTANCE:
      return new ImportEstimationDistanceService(services);
    case IMPORT_COMPORTEMENT:
      return new ImportComportementService(services);
    case IMPORT_MILIEU:
      return new ImportMilieuService(services);
    case IMPORT_DONNEE:
      return new ImportDonneeService(services);
    default:
      throw new Error("I,port of unknown type requested");
  }
};
