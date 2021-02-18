import { Age, areCoordinatesCustomized, Classe, Commune, Comportement, Coordinates, CoordinatesSystem, COORDINATES_SYSTEMS_CONFIG, Departement, Donnee, Espece, EstimationDistance, EstimationNombre, Inventaire, Lieudit, Meteo, Milieu, Observateur, Sexe } from "@ou-ca/ouca-model";
import { FlatDonneeWithMinimalData } from "../../objects/flat-donnee-with-minimal-data.object";
import { ImportedDonnee } from "../../objects/import/imported-donnee.object";
import { findAllAges } from "../../sql-api/sql-api-age";
import { findAllClasses } from "../../sql-api/sql-api-classe";
import { findAllCommunes } from "../../sql-api/sql-api-commune";
import { findAllComportements } from "../../sql-api/sql-api-comportement";
import { findCoordinatesSystem } from "../../sql-api/sql-api-configuration";
import { findAllDepartements } from "../../sql-api/sql-api-departement";
import { buildDonneeFromFlatDonneeWithMinimalData, findAllFlatDonneesWithMinimalData, persistDonnee } from "../../sql-api/sql-api-donnee";
import { findAllEspeces } from "../../sql-api/sql-api-espece";
import { findAllEstimationsDistance } from "../../sql-api/sql-api-estimation-distance";
import { findAllEstimationsNombre } from "../../sql-api/sql-api-estimation-nombre";
import { persistInventaire } from "../../sql-api/sql-api-inventaire";
import { findAllLieuxDits } from "../../sql-api/sql-api-lieudit";
import { findAllMeteos } from "../../sql-api/sql-api-meteo";
import { findAllMilieux } from "../../sql-api/sql-api-milieu";
import { findAllObservateurs } from "../../sql-api/sql-api-observateur";
import { findAllSexes } from "../../sql-api/sql-api-sexe";
import { areArraysContainingSameValues, isIdInListIds } from "../../utils/utils";
import { ImportService } from "./import-service";

export class ImportDoneeeService extends ImportService {
  private coordinatesSystem: CoordinatesSystem;
  private observateurs: Observateur[];
  private departements: Departement[];
  private communes: Commune[];
  private lieuxDits: Lieudit[];
  private classes: Classe[];
  private especes: Espece[];
  private ages: Age[];
  private sexes: Sexe[];
  private estimationsNombre: EstimationNombre[];
  private estimationsDistance: EstimationDistance[];
  private comportements: Comportement[];
  private milieux: Milieu[];
  private meteos: Meteo[];
  private donnees: FlatDonneeWithMinimalData[];

  protected getNumberOfColumns = (): number => {
    return 32;
  };


  protected init = async (): Promise<void> => {
    const coordinatesSystemType = await findCoordinatesSystem();
    if (!coordinatesSystemType) {
      return Promise.reject("Veuillez choisir le système de coordonnées de l'application dans la page de configuration");
    } else {
      this.coordinatesSystem = COORDINATES_SYSTEMS_CONFIG[coordinatesSystemType];
    }

    this.observateurs = await findAllObservateurs();
    this.departements = await findAllDepartements();
    this.communes = await findAllCommunes();
    this.lieuxDits = await findAllLieuxDits();
    this.meteos = await findAllMeteos();
    this.classes = await findAllClasses();
    this.especes = await findAllEspeces();
    this.sexes = await findAllSexes();
    this.ages = await findAllAges();
    this.estimationsNombre = await findAllEstimationsNombre();
    this.estimationsDistance = await findAllEstimationsDistance();
    this.comportements = await findAllComportements();
    this.milieux = await findAllMilieux();
    this.donnees = await findAllFlatDonneesWithMinimalData();
  };

  protected importEntity = async (donneeTab: string[]): Promise<string> => {
    const importedDonnee: ImportedDonnee = new ImportedDonnee(donneeTab, this.coordinatesSystem);

    const dataValidity = importedDonnee.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Then start getting the requested sub-objects to create the new "Donnee"

    // Get the "Observateur" or return an error if it doesn't exist
    const observateur = this.findObservateur(importedDonnee.observateur);
    if (!observateur) {
      return `L'observateur ${importedDonnee.observateur} n'existe pas`;
    }

    // Get the "Observateurs associes" or return an error if some of them doesn't exist
    const associesIds: number[] = [];
    for (const associeLibelle of importedDonnee.associes) {
      const associe: Observateur = this.findObservateur(associeLibelle);
      if (!associe) {
        return `L'observateur associé ${associeLibelle} n'existe pas`;
      }

      if (!isIdInListIds(associesIds, associe.id)) {
        associesIds.push(associe.id);
      }
    }

    // Get the "Departement" or return an error if it doesn't exist
    const departement: Departement = this.findDepartement(importedDonnee.departement);
    if (!departement) {
      return `Le département ${importedDonnee.departement} n'existe pas`;
    }

    // Get the "Commune" or return an error if it does not exist
    const commune: Commune = this.findCommune(departement.id, importedDonnee.commune);
    if (!commune) {
      return `La commune avec pour code ou nom ${importedDonnee.commune} n'existe pas dans le département ${departement.code}`;
    }

    // Get the "Lieu-dit" or return an error if it does not exist
    const lieudit = this.findLieuDit(commune.id, importedDonnee.lieuDit);
    if (!lieudit) {
      return `Le lieu-dit ${importedDonnee.lieuDit} n'existe pas dans la commune ${commune.code} - ${commune.nom} du département ${departement.code}`;
    }

    // Get the customized coordinates
    let altitude: number = +importedDonnee.altitude;
    let coordinates: Coordinates = {
      longitude: +importedDonnee.longitude,
      latitude: +importedDonnee.latitude,
      system: importedDonnee.coordinatesSystem.code
    };

    // Round the coordinates
    coordinates.longitude = +coordinates.longitude.toFixed(
      COORDINATES_SYSTEMS_CONFIG[importedDonnee.coordinatesSystem.code].decimalPlaces
    );
    coordinates.latitude = +coordinates.latitude.toFixed(
      COORDINATES_SYSTEMS_CONFIG[importedDonnee.coordinatesSystem.code].decimalPlaces
    );

    if (
      !areCoordinatesCustomized(
        lieudit,
        altitude,
        coordinates.longitude,
        coordinates.latitude,
        importedDonnee.coordinatesSystem.code
      )
    ) {
      altitude = null;
      coordinates = null;
    }

    // Get the "Meteos" or return an error if some of them doesn't exist
    const meteosIds: number[] = [];
    for (const libelleMeteo of importedDonnee.meteos) {
      const meteo: Meteo = this.findMeteo(libelleMeteo);
      if (!meteo) {
        return `La météo ${libelleMeteo} n'existe pas`;
      }

      if (!isIdInListIds(meteosIds, meteo.id)) {
        meteosIds.push(meteo.id);
      }
    }

    // Get the "Espece" or return an error if it doesn't exist
    const espece: Espece = this.findEspece(importedDonnee.espece);
    if (!espece) {
      return `L'espèce avec pour code, nom français ou nom scientifique ${importedDonnee.espece} n'existe pas`;
    }

    // Get the "Sexe" or return an error if it doesn't exist
    const sexe = this.findSexe(importedDonnee.sexe);
    if (!sexe) {
      return `Le sexe ${importedDonnee.sexe} n'existe pas`;
    }

    // Get the "Age" or return an error if it doesn't exist
    const age = this.findAge(importedDonnee.age);
    if (!age) {
      return `L'âge ${importedDonnee.age} n'existe pas`;
    }

    // Get the "Estimation du nombre" or return an error if it doesn't exist
    const estimationNombre = this.findEstimationNombre(importedDonnee.estimationNombre);
    if (!estimationNombre) {
      return `L'estimation du nombre ${importedDonnee.estimationNombre} n'existe pas`;
    }

    // Get the "Nombre"
    const nombre: number = importedDonnee.nombre ? +importedDonnee.nombre : null;

    if (!estimationNombre.nonCompte && !nombre) {
      // If "Estimation du nombre" is of type "Compté" then "Nombre" should not be empty
      return `Le nombre ne doit pas être vide quand l'estimation du nombre est de type Compté`;
    } else if (!!estimationNombre.nonCompte && !!nombre) {
      // If "Estimation du nombre" is of type "Non-compté" then "Nombre" should be empty
      return `L'estimation du nombre ${estimationNombre.libelle} est de type Non-compté donc le nombre devrait être vide`;
    }

    // Get the "Estimation de la distance" or return an error if it doesn't exist
    let estimationDistance: EstimationDistance = null;
    if (importedDonnee.estimationDistance) {
      estimationDistance = this.findEstimationDistance(importedDonnee.estimationDistance)
      if (!estimationDistance) {
        return `L'estimation de la distance ${importedDonnee.estimationDistance} n'existe pas`;
      }
    }

    // Get the "Comportements" or return an error if some of them does not exist
    const comportementsIds: number[] = [];
    for (const comportementStr of importedDonnee.comportements) {
      const comportement = this.findComportement(comportementStr);
      if (!comportement) {
        return `Le comportement avec pour code ou libellé ${comportementStr} n'existe pas`;
      }

      if (!isIdInListIds(comportementsIds, comportement.id)) {
        comportementsIds.push(comportement.id);
      }
    }

    // Get the "Milieux" or return an error if some of them does not exist
    const milieuxIds: number[] = [];
    for (const milieuStr of importedDonnee.milieux) {
      const milieu: Milieu = this.findMilieu(milieuStr);
      if (!milieu) {
        return `Le milieu avec pour code ou libellé ${milieuStr} n'existe pas`;
      }

      if (!isIdInListIds(milieuxIds, milieu.id)) {
        milieuxIds.push(milieu.id);
      }
    }

    // OK 68 premières lignes

    // Create the "Inventaire" to save
    const inventaireToSave: Inventaire = importedDonnee.buildInventaire(
      observateur.id,
      associesIds,
      lieudit.id,
      meteosIds,
      altitude,
      coordinates
    );

    const existingDonneesByInventaire = this.donnees.filter((donnee) => {
      return (
        donnee.date === inventaireToSave.date &&
        donnee.heure === inventaireToSave.heure &&
        donnee.duree === inventaireToSave.duree &&
        donnee.lieuditId === inventaireToSave.lieuditId &&
        donnee.altitude === inventaireToSave.customizedAltitude &&
        donnee.longitude === (inventaireToSave.coordinates ? inventaireToSave.coordinates.longitude : null) &&
        donnee.latitude === (inventaireToSave.coordinates ? inventaireToSave.coordinates.latitude : null) &&
        donnee.temperature === inventaireToSave.temperature &&
        donnee.observateurId === inventaireToSave.observateurId
      );
    });

    let existingDonneeByInventaire: FlatDonneeWithMinimalData = null;
    if (existingDonneesByInventaire?.length > 0) {
      let index = 0;
      while (!existingDonneeByInventaire && index < existingDonneesByInventaire.length) {
        const donnee = await buildDonneeFromFlatDonneeWithMinimalData(existingDonneesByInventaire[index]);
        if (areArraysContainingSameValues(inventaireToSave.associesIds, donnee.inventaire.associesIds) &&
          areArraysContainingSameValues(inventaireToSave.meteosIds, donnee.inventaire.meteosIds)) {
          existingDonneeByInventaire = existingDonneesByInventaire[index];
        }

        index++;
      }
    }

    // Save the inventaire
    if (!existingDonneeByInventaire) {
      const inventaireSaveResponse = await persistInventaire(inventaireToSave);
      inventaireToSave.id = inventaireSaveResponse.insertId;
    } else {
      inventaireToSave.id = existingDonneeByInventaire.inventaireId;
    }

    // Create the "Donnee" to save
    const donneeToSave: Donnee = importedDonnee.buildDonnee(
      inventaireToSave.id,
      espece.id,
      sexe.id,
      age.id,
      estimationNombre.id,
      estimationDistance ? estimationDistance.id : null,
      comportementsIds,
      milieuxIds
    );

    const existingDonneesByDonnee = this.donnees.filter((donnee) => {
      return (
        donnee.inventaireId === donneeToSave.inventaireId &&
        donnee.especeId === donneeToSave.especeId &&
        donnee.sexeId === donneeToSave.sexeId &&
        donnee.ageId === donneeToSave.ageId &&
        donnee.nombre === donneeToSave.nombre &&
        donnee.estimationNombreId === donneeToSave.estimationNombreId &&
        donnee.distance === donneeToSave.distance &&
        donnee.estimationDistanceId === donneeToSave.estimationDistanceId &&
        donnee.regroupement === donneeToSave.regroupement &&
        this.compareStrings(donnee.commentaire, donneeToSave.commentaire)
      );
    });

    let existingDonnee: FlatDonneeWithMinimalData = null;
    if (existingDonneesByDonnee?.length > 0) {
      let index = 0;
      while (!existingDonnee && index < existingDonneesByDonnee.length) {
        const donnee = await buildDonneeFromFlatDonneeWithMinimalData(existingDonneesByDonnee[index]);
        if (areArraysContainingSameValues(donneeToSave.comportementsIds, donnee.comportementsIds) &&
          areArraysContainingSameValues(donneeToSave.milieuxIds, donnee.milieuxIds)) {
          existingDonnee = existingDonneesByDonnee[index];
        }

        index++;
      }
    }

    if (existingDonnee) {
      return `Une donnée similaire existe déjà (voir ID=${existingDonnee.id})`;
    } else {
      const saveDonneeResponse = await persistDonnee(donneeToSave);
      if (!saveDonneeResponse?.insertId) {
        return "Une erreur est survenue pendant l'import";
      }
      donneeToSave.id = saveDonneeResponse.insertId;
    }

    const flatDonnee: FlatDonneeWithMinimalData = {
      id: donneeToSave.id,
      inventaireId: inventaireToSave.id,
      observateurId: observateur.id,
      date: inventaireToSave.date,
      heure: inventaireToSave.heure,
      duree: inventaireToSave.duree,
      lieuditId: inventaireToSave.lieuditId,
      latitude: inventaireToSave.coordinates?.latitude,
      longitude: inventaireToSave.coordinates?.longitude,
      altitude: inventaireToSave.customizedAltitude,
      coordinatesSystem: inventaireToSave.coordinates?.system,
      temperature: inventaireToSave.temperature,
      especeId: espece.id,
      sexeId: sexe.id,
      ageId: age.id,
      nombre: donneeToSave.nombre,
      estimationNombreId: donneeToSave.estimationNombreId,
      estimationDistanceId: donneeToSave.estimationDistanceId,
      distance: donneeToSave.distance,
      regroupement: donneeToSave.regroupement,
      commentaire: donneeToSave.commentaire
    }

    this.donnees.push(flatDonnee);
    return null;
  };

  private findObservateur = (libelleObservateur: string): Observateur => {
    return this.observateurs.find((observateur) => {
      return this.compareStrings(observateur.libelle, libelleObservateur);
    });
  }

  private findDepartement = (codeDepartement: string): Departement => {
    return this.departements.find((departement) => {
      return this.compareStrings(departement.code, codeDepartement);
    });
  }

  private findCommune = (departementId: number, nomOrCodeCommune: string): Commune => {
    return this.communes.find((commune) => {
      return (
        commune.departementId === departementId &&
        (this.compareStrings(`${commune.code}`, nomOrCodeCommune) || this.compareStrings(commune.nom, nomOrCodeCommune))
      );
    });
  }

  private findLieuDit = (communeId: number, nomLieuDit: string): Lieudit => {
    return this.lieuxDits.find((lieuDit) => {
      return lieuDit.communeId === communeId && this.compareStrings(lieuDit.nom, nomLieuDit);
    });
  }

  private findMeteo = (libelleMeteo: string): Meteo => {
    return this.meteos.find((meteo) => {
      return this.compareStrings(meteo.libelle, libelleMeteo);
    });
  }

  private findEspece = (codeOrNomEspece: string): Espece => {
    return this.especes.find((espece) => {
      return (
        this.compareStrings(espece.code, codeOrNomEspece) ||
        this.compareStrings(espece.nomFrancais, codeOrNomEspece) ||
        this.compareStrings(espece.nomLatin, codeOrNomEspece)
      );
    });
  }

  private findSexe = (libelleSexe: string): Sexe => {
    return this.sexes.find((sexe) => {
      return this.compareStrings(sexe.libelle, libelleSexe);
    });
  }

  private findAge = (libelleMeteo: string): Age => {
    return this.ages.find((age) => {
      return this.compareStrings(age.libelle, libelleMeteo);
    });
  }

  private findEstimationNombre = (libelleEstimation: string): EstimationNombre => {
    return this.estimationsNombre.find((estimation) => {
      return this.compareStrings(estimation.libelle, libelleEstimation);
    });
  }

  private findEstimationDistance = (libelleEstimation: string): EstimationDistance => {
    return this.estimationsDistance.find((estimation) => {
      return this.compareStrings(estimation.libelle, libelleEstimation);
    });
  }

  private findComportement = (codeOrLibelleComportement: string): Comportement => {
    return this.comportements.find((comportement) => {
      return this.compareStrings(comportement.code, codeOrLibelleComportement) || this.compareStrings(comportement.libelle, codeOrLibelleComportement);
    });
  }

  private findMilieu = (codeOrLibelleMilieu: string): Milieu => {
    return this.milieux.find((milieu) => {
      return this.compareStrings(milieu.code, codeOrLibelleMilieu) || this.compareStrings(milieu.libelle, codeOrLibelleMilieu);
    });
  }
}
