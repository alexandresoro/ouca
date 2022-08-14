import {
  ImportType,
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
} from "../../model/import-types";
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
import { ImportService } from "./import-service";
import { ImportSexeService } from "./import-sexe-service";

export const getNewImportServiceForRequestType = (requestType: ImportType): ImportService => {
  switch (requestType) {
    case IMPORT_OBSERVATEUR:
      return new ImportObservateurService();
    case IMPORT_DEPARTEMENT:
      return new ImportDepartementService();
    case IMPORT_COMMUNE:
      return new ImportCommuneService();
    case IMPORT_LIEUDIT:
      return new ImportLieuxditService();
    case IMPORT_METEO:
      return new ImportMeteoService();
    case IMPORT_CLASSE:
      return new ImportClasseService();
    case IMPORT_ESPECE:
      return new ImportEspeceService();
    case IMPORT_AGE:
      return new ImportAgeService();
    case IMPORT_SEXE:
      return new ImportSexeService();
    case IMPORT_ESTIMATION_NOMBRE:
      return new ImportEstimationNombreService();
    case IMPORT_ESTIMATION_DISTANCE:
      return new ImportEstimationDistanceService();
    case IMPORT_COMPORTEMENT:
      return new ImportComportementService();
    case IMPORT_MILIEU:
      return new ImportMilieuService();
    case IMPORT_DONNEE:
      return new ImportDonneeService();
    default:
      return null as unknown as ImportService;
  }
};
