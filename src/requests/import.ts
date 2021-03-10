import { Worker } from "worker_threads";
import WebSocket from "ws";
import { HttpParameters } from "../http/httpParameters";
import { ImportUpdateMessage, IMPORT_COMPLETE, STATUS_UPDATE, VALIDATION_PROGRESS } from "../model/import/import-update-message";
import { ImportAgeService } from "../services/import/import-age-service";
import { ImportClasseService } from "../services/import/import-classe-service";
import { ImportComportementService } from "../services/import/import-comportement-service";
import { ImportDepartementService } from "../services/import/import-departement-service";
import { ImportDoneeeService } from "../services/import/import-donnee-service";
import { ImportEspeceService } from "../services/import/import-espece-service";
import { ImportEstimationDistanceService } from "../services/import/import-estimation-distance-service";
import { ImportEstimationNombreService } from "../services/import/import-estimation-nombre-service";
import { ImportLieuxditService } from "../services/import/import-lieudit-service";
import { ImportMeteoService } from "../services/import/import-meteo-service";
import { ImportMilieuService } from "../services/import/import-milieu-service";
import { ImportObservateurService } from "../services/import/import-observateur-service";
import { ImportSexeService } from "../services/import/import-sexe-service";
import { TABLE_COMMUNE } from "../utils/constants";
import { onTableUpdate } from "../ws/ws-messages";

const processImport = (workerPath: string, workerData: string, tableToUpdate: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, {
      workerData
    });

    worker.on('message', (postMessage: ImportUpdateMessage) => {

      if (postMessage.type === IMPORT_COMPLETE) {
        // When an import has been processed, 
        // inform all clients
        // Compared to the standard update, we need to to it manually here
        // once the worker has returned, as it is another "thread" 
        // that does not have the proper visibility
        onTableUpdate(tableToUpdate);

        resolve(postMessage.result);
      } else if (postMessage.type === VALIDATION_PROGRESS) {
        console.log(postMessage.progress);
      } else if (STATUS_UPDATE.includes(postMessage.type)) {
        console.log(postMessage.type);
      }

    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (exitCode) => {
      (exitCode > 0) && reject(exitCode);
    });

  });
}

export const importObservateurs = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportObservateurService();
  return importService.importFile(httpParameters.postData);
};

export const importDepartements = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportDepartementService();
  return importService.importFile(httpParameters.postData);
};

export const importCommunes = (
  httpParameters: HttpParameters
): Promise<string> => {
  return processImport('./dist/services/import/import-worker.js', httpParameters.postData, TABLE_COMMUNE);
};

export const importWebsocket = (
  client: WebSocket,
  httpParameters: HttpParameters
): Promise<string> => {
  return null;
};

export const importLieuxdits = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportLieuxditService();
  return importService.importFile(httpParameters.postData);
};

export const importMeteos = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportMeteoService();
  return importService.importFile(httpParameters.postData);
};

export const importClasses = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportClasseService();
  return importService.importFile(httpParameters.postData);
};

export const importEspeces = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportEspeceService();
  return importService.importFile(httpParameters.postData);
};

export const importAges = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportAgeService();
  return importService.importFile(httpParameters.postData);
};

export const importSexes = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportSexeService();
  return importService.importFile(httpParameters.postData);
};

export const importEstimationsNombre = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportEstimationNombreService();
  return importService.importFile(httpParameters.postData);
};

export const importEstimationsDistance = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportEstimationDistanceService();
  return importService.importFile(httpParameters.postData);
};

export const importComportements = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportComportementService();
  return importService.importFile(httpParameters.postData);
};

export const importMilieux = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportMilieuService();
  return importService.importFile(httpParameters.postData);
};

export const importDonnees = (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportDoneeeService();
  return importService.importFile(httpParameters.postData);
};
