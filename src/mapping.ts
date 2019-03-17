import { configurationInit } from "./requests/configuration";
import {
  creationDonnee,
  creationInit,
  creationInventaire,
  deleteDonnee,
  getNextDonnee,
  getNextRegroupement,
  getPreviousDonnee
} from "./requests/creation";
import {
  getAges,
  getClasses,
  getCommunes,
  getComportements,
  getDepartements,
  getEspeces,
  getEstimationsDistance,
  getEstimationsNombre,
  getLieuxDits,
  getMeteos,
  getMilieux,
  getObservateurs,
  getSexes
} from "./requests/gestion";

export const REQUEST_MAPPING: {
  [path: string]: (
    isMockDatabaseMode: boolean,
    callbackFn?: (errors, result) => void
  ) => void;
} = {
  "/api/creation/init": creationInit,
  "/api/inventaire/create": creationInventaire,
  "/api/donnee/create": creationDonnee,
  "/api/donnee/delete": deleteDonnee,
  "/api/donnee/next_donnee": getNextDonnee,
  "/api/donnee/previous_donnee": getPreviousDonnee,
  "/api/donnee/next_regroupement": getNextRegroupement,
  "/api/observateur/all": getObservateurs,
  "/api/departement/all": getDepartements,
  "/api/commune/all": getCommunes,
  "/api/lieudit/all": getLieuxDits,
  "/api/meteo/all": getMeteos,
  "/api/classe/all": getClasses,
  "/api/espece/all": getEspeces,
  "/api/sexe/all": getSexes,
  "/api/age/all": getAges,
  "/api/estimation-nombre/all": getEstimationsNombre,
  "/api/estimation-distance/all": getEstimationsDistance,
  "/api/comportement/all": getComportements,
  "/api/milieu/all": getMilieux,
  "/api/configuration/init": configurationInit
};
