import { Age } from "basenaturaliste-model/age.object";
import { Classe } from "basenaturaliste-model/classe.object";
import { Commune } from "basenaturaliste-model/commune.object";
import { Comportement } from "basenaturaliste-model/comportement.object";
import { Departement } from "basenaturaliste-model/departement.object";
import { Espece } from "basenaturaliste-model/espece.object";
import { EstimationDistance } from "basenaturaliste-model/estimation-distance.object";
import { EstimationNombre } from "basenaturaliste-model/estimation-nombre.object";
import { Lieudit } from "basenaturaliste-model/lieudit.object";
import { Meteo } from "basenaturaliste-model/meteo.object";
import { Milieu } from "basenaturaliste-model/milieu.object";
import { Observateur } from "basenaturaliste-model/observateur.object";
import { Sexe } from "basenaturaliste-model/sexe.object";
import * as _ from "lodash";
import * as mysql from "mysql";
import { HttpParameters } from "../http/httpParameters.js";
import agesMock from "../mocks/gestion-base-pages/ages.json";
import classesMock from "../mocks/gestion-base-pages/classes.json";
import communesMock from "../mocks/gestion-base-pages/communes.json";
import comportementsMock from "../mocks/gestion-base-pages/comportements.json";
import departementsMock from "../mocks/gestion-base-pages/departements.json";
import especesMock from "../mocks/gestion-base-pages/especes.json";
import estimationsDistanceMock from "../mocks/gestion-base-pages/estimations-distance.json";
import estimationsNombreMock from "../mocks/gestion-base-pages/estimations-nombre.json";
import lieuxDitsMock from "../mocks/gestion-base-pages/lieuxdits.json";
import meteosMock from "../mocks/gestion-base-pages/meteos.json";
import milieuxMock from "../mocks/gestion-base-pages/milieux.json";
import observateursMock from "../mocks/gestion-base-pages/observateurs.json";
import sexesMock from "../mocks/gestion-base-pages/sexes.json";
import { SqlConnection } from "../sql/sql-connection.js";
import {
  DB_SAVE_MAPPING,
  getDeleteEntityByIdQuery,
  getFindAllQuery,
  getFindNumberOfCommunesByDepartementIdQuery,
  getFindNumberOfDonneesByAgeIdQuery,
  getFindNumberOfDonneesByClasseIdQuery,
  getFindNumberOfDonneesByCommuneIdQuery,
  getFindNumberOfDonneesByDepartementIdQuery,
  getFindNumberOfDonneesByDoneeeEntityIdQuery,
  getFindNumberOfDonneesByEstimationNombreIdQuery,
  getFindNumberOfDonneesByLieuditIdQuery,
  getFindNumberOfDonneesByObservateurIdQuery,
  getFindNumberOfDonneesBySexeIdQuery,
  getFindNumberOfEspecesByClasseIdQuery,
  getFindNumberOfLieuxditsByCommuneIdQuery,
  getFindNumberOfLieuxditsByDepartementIdQuery,
  getSaveEntityQuery
} from "../sql/sql-queries-utils.js";

export function getObservateurs(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Observateur[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, observateursMock as Observateur[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("observateur", "libelle", "ASC") +
        getFindNumberOfDonneesByObservateurIdQuery(),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          console.log(results);
          callbackFn(errors, results[0] as Observateur[]);
        }
      }
    );
  }
}

export function saveObservateur(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, insertId: number) => void
) {
  if (isMockDatabaseMode) {
    // TODO
    // callbackFn(null, observateursMock as Observateur[]);
  } else {
    // TODO
    SqlConnection.query(
      getSaveEntityQuery("observateur", null, DB_SAVE_MAPPING.observateur),
      (error, result) => {
        if (error) {
          callbackFn(error, null);
        } else {
          console.log("SQL Result:", result);
          callbackFn(error, result.insertId);
        }
      }
    );
  }
}

export function deleteObservateur(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, numberOfDeletedRows: number) => void
) {
  if (isMockDatabaseMode) {
    // TODO
    // callbackFn(null, observateursMock as Observateur[]);
  } else {
    // TODO
    SqlConnection.query(
      getDeleteEntityByIdQuery(
        "observateur",
        +httpParameters.queryParameters.id
      ),
      (error, result) => {
        if (error) {
          callbackFn(error, null);
        } else {
          console.log("SQL Result:", result);
          callbackFn(error, result.affectedRows);
        }
      }
    );
  }
}

export function getDepartements(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Departement[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, departementsMock as Departement[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("departement", "code", "ASC") +
        getFindNumberOfCommunesByDepartementIdQuery() +
        getFindNumberOfLieuxditsByDepartementIdQuery() +
        getFindNumberOfDonneesByDepartementIdQuery(),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          callbackFn(errors, results[0] as Departement[]);
        }
      }
    );
  }
}

export function saveDepartement(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteDepartement(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getCommunes(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Commune[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, communesMock as any[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("commune", "nom", "ASC") +
        getFindNumberOfLieuxditsByCommuneIdQuery() +
        getFindNumberOfDonneesByCommuneIdQuery(),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          const communes: Commune[] = _.map(results[0], (classeDb) => {
            const { departement_id, ...otherParams } = classeDb;
            return {
              ...otherParams,
              departementId: classeDb.departement_id
            };
          });
          callbackFn(errors, communes);
        }
      }
    );
  }
}

export function saveCommune(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteCommune(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getLieuxdits(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Lieudit[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, lieuxDitsMock as Lieudit[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("lieudit", "nom", "ASC") +
        getFindNumberOfDonneesByLieuditIdQuery(),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          const lieuxdits: Lieudit[] = _.map(results[0], (lieuditDb) => {
            const { commune_id, ...otherParams } = lieuditDb;
            return {
              ...otherParams,
              communeId: lieuditDb.commune_id
            };
          });
          callbackFn(errors, lieuxdits);
        }
      }
    );
  }
}

export function saveLieudit(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteLieudit(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getMeteos(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Meteo[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, meteosMock as Meteo[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("meteo", "libelle", "ASC"),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          callbackFn(errors, results as Meteo[]);
        }
      }
    );
  }
}

export function saveMeteo(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteMeteo(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getClasses(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Classe[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, classesMock as Classe[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("classe", "libelle", "ASC") +
        getFindNumberOfEspecesByClasseIdQuery() +
        getFindNumberOfDonneesByClasseIdQuery(),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          callbackFn(errors, results[0] as Classe[]);
        }
      }
    );
  }
}

export function saveClasse(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteClasse(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getEspeces(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Espece[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, especesMock as Espece[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("espece", "code", "ASC") +
        getFindNumberOfDonneesByDoneeeEntityIdQuery("espece_id"),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          const especes: Espece[] = _.map(results[0], (especeDb) => {
            const { espece_id, ...otherParams } = especeDb;
            return {
              ...otherParams,
              especeId: especeDb.espece_id
            };
          });
          callbackFn(errors, especes);
        }
      }
    );
  }
}

export function saveEspece(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteEspece(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getSexes(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Sexe[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, sexesMock as Sexe[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("sexe", "libelle", "ASC") +
        getFindNumberOfDonneesBySexeIdQuery(),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          callbackFn(errors, results[0] as Sexe[]);
        }
      }
    );
  }
}

export function saveSexe(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteSexe(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getAges(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Age[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, agesMock as Age[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("age", "libelle", "ASC") +
        getFindNumberOfDonneesByAgeIdQuery(),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          callbackFn(errors, results[0] as Age[]);
        }
      }
    );
  }
}

export function saveAge(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteAge(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getEstimationsNombre(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: EstimationNombre[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, estimationsNombreMock as EstimationNombre[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("estimation_nombre", "libelle", "ASC") +
        getFindNumberOfDonneesByEstimationNombreIdQuery(),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          callbackFn(errors, results[0] as EstimationNombre[]);
        }
      }
    );
  }
}

export function saveEstimationNombre(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteEstimationNombre(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getEstimationsDistance(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: EstimationDistance[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, estimationsDistanceMock as EstimationDistance[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("estimation_distance", "libelle", "ASC"),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          callbackFn(errors, results as EstimationDistance[]);
        }
      }
    );
  }
}

export function saveEstimationDistance(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteEstimationDistance(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getComportements(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Comportement[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, comportementsMock as Comportement[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("comportement", "libelle", "ASC"),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          callbackFn(errors, results as Comportement[]);
        }
      }
    );
  }
}

export function saveComportement(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteComportement(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function getMilieux(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: Milieu[]) => void
) {
  if (isMockDatabaseMode) {
    callbackFn(null, milieuxMock as Milieu[]);
  } else {
    SqlConnection.query(
      getFindAllQuery("milieu", "libelle", "ASC"),
      (errors, results) => {
        if (errors) {
          callbackFn(errors, null);
        } else {
          callbackFn(errors, results as Milieu[]);
        }
      }
    );
  }
}

export function saveMilieu(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}

export function deleteMilieu(
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  callbackFn: (errors: mysql.MysqlError, result: any) => void
) {
  if (isMockDatabaseMode) {
    // TODO
  } else {
    // TODO
  }
}
