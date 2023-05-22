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
} from "@ou-ca/common/import/import-types";
import { type Services } from "../services.js";
import { ImportAgeService } from "./import-age-service.js";
import { ImportClasseService } from "./import-classe-service.js";
import { ImportCommuneService } from "./import-commune-service.js";
import { ImportComportementService } from "./import-comportement-service.js";
import { ImportDepartementService } from "./import-departement-service.js";
import { ImportDonneeService } from "./import-donnee-service.js";
import { ImportEspeceService } from "./import-espece-service.js";
import { ImportEstimationDistanceService } from "./import-estimation-distance-service.js";
import { ImportEstimationNombreService } from "./import-estimation-nombre-service.js";
import { ImportLieuxditService } from "./import-lieudit-service.js";
import { ImportMeteoService } from "./import-meteo-service.js";
import { ImportMilieuService } from "./import-milieu-service.js";
import { ImportObservateurService } from "./import-observateur-service.js";
import { type ImportService } from "./import-service.js";
import { ImportSexeService } from "./import-sexe-service.js";

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
