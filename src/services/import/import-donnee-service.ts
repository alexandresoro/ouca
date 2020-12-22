import { Age } from "@ou-ca/ouca-model/age.object";
import { Classe } from "@ou-ca/ouca-model/classe.object";
import { Commune } from "@ou-ca/ouca-model/commune.model";
import { Comportement } from "@ou-ca/ouca-model/comportement.object";
import { areCoordinatesCustomized, CoordinatesSystem, COORDINATES_SYSTEMS_CONFIG } from "@ou-ca/ouca-model/coordinates-system";
import { Coordinates } from "@ou-ca/ouca-model/coordinates.object";
import { Departement } from "@ou-ca/ouca-model/departement.object";
import { Donnee } from "@ou-ca/ouca-model/donnee.object";
import { Espece } from "@ou-ca/ouca-model/espece.model";
import { EstimationDistance } from "@ou-ca/ouca-model/estimation-distance.object";
import { EstimationNombre } from "@ou-ca/ouca-model/estimation-nombre.object";
import { Inventaire } from "@ou-ca/ouca-model/inventaire.object";
import { Lieudit } from "@ou-ca/ouca-model/lieudit.model";
import { Meteo } from "@ou-ca/ouca-model/meteo.object";
import { Milieu } from "@ou-ca/ouca-model/milieu.object";
import { Observateur } from "@ou-ca/ouca-model/observateur.object";
import { Sexe } from "@ou-ca/ouca-model/sexe.object";
import { ImportedDonnee } from "../../objects/import/imported-donnee.object";
import { findAllAges } from "../../sql-api/sql-api-age";
import { findAllClasses } from "../../sql-api/sql-api-classe";
import { findAllCommunes } from "../../sql-api/sql-api-commune";
import { findAllComportements } from "../../sql-api/sql-api-comportement";
import { findCoordinatesSystem } from "../../sql-api/sql-api-configuration";
import { findAllDepartements } from "../../sql-api/sql-api-departement";
import { findExistingDonneeId, persistDonnee } from "../../sql-api/sql-api-donnee";
import { findAllEspeces } from "../../sql-api/sql-api-espece";
import { findAllEstimationsDistance } from "../../sql-api/sql-api-estimation-distance";
import { findAllEstimationsNombre } from "../../sql-api/sql-api-estimation-nombre";
import { findExistingInventaireId, persistInventaire } from "../../sql-api/sql-api-inventaire";
import { findAllLieuxDits } from "../../sql-api/sql-api-lieudit";
import { findAllMeteos } from "../../sql-api/sql-api-meteo";
import { findAllMilieux } from "../../sql-api/sql-api-milieu";
import { findAllObservateurs } from "../../sql-api/sql-api-observateur";
import { findAllSexes } from "../../sql-api/sql-api-sexe";
import { isIdInListIds } from "../../utils/utils";
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
  private donnees: Donnee[];

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
    this.donnees = []; // TODO
  };

  protected importEntity = async (donneeTab: string[]): Promise<string> => {
    const rawDonnee: ImportedDonnee = new ImportedDonnee(donneeTab, this.coordinatesSystem);

    const dataValidity = rawDonnee.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Then start getting the requested sub-objects to create the new "Donnee"

    // Get the "Observateur" or return an error if it doesn't exist
    const observateur: Observateur = this.observateurs.find((obs) => {
      return obs.libelle === rawDonnee.observateur;
    });

    if (!observateur) {
      return `L'observateur ${rawDonnee.observateur} n'existe pas`;
    }

    // Get the "Observateurs associes" or return an error if some of them doesn't exist
    const associesIds: number[] = [];
    for (const associeLibelle of rawDonnee.associes) {
      const associe: Observateur = this.observateurs.find((a) => {
        return a.libelle === associeLibelle;
      });

      if (!associe) {
        return `L'observateur associé ${associeLibelle} n'existe pas`;
      }

      if (!isIdInListIds(associesIds, associe.id)) {
        associesIds.push(associe.id);
      }
    }

    // Get the "Departement" or return an error if it doesn't exist
    const departement: Departement = this.departements.find((dept) => {
      return dept.code === rawDonnee.departement;
    });
    if (!departement) {
      return `Le département ${rawDonnee.departement} n'existe pas`;
    }

    // Get the "Commune" or return an error if it does not exist
    const commune: Commune = this.communes.find((com) => {
      return (
        com.departementId === departement.id &&
        (`${com.code}` === rawDonnee.commune || com.nom === rawDonnee.commune)
      );
    });

    if (!commune) {
      return `La commune avec pour code ou nom ${rawDonnee.commune} n'existe pas dans le département ${departement.code}`;
    }

    // Get the "Lieu-dit" or return an error if it does not exist
    const lieudit = this.lieuxDits.find((lieu) => {
      return lieu.communeId === commune.id && lieu.nom === rawDonnee.lieuDit;
    });

    if (!lieudit) {
      return `Le lieu-dit ${rawDonnee.lieuDit} n'existe pas dans la commune ${commune.code} - ${commune.nom} du département ${departement.code}`;
    }

    // Get the customized coordinates
    let altitude: number = +rawDonnee.altitude;
    let coordinates: Coordinates = {
      longitude: +rawDonnee.longitude,
      latitude: +rawDonnee.latitude,
      system: rawDonnee.coordinatesSystem.code
    };
    if (
      !areCoordinatesCustomized(
        lieudit,
        altitude,
        coordinates.longitude,
        coordinates.latitude,
        rawDonnee.coordinatesSystem.code
      )
    ) {
      altitude = null;
      coordinates = null;
    }

    // Get the "Meteos" or return an error if some of them doesn't exist
    const meteosIds: number[] = [];
    for (const meteoLibelle of rawDonnee.meteos) {
      const meteo: Meteo = this.meteos.find((m) => {
        return m.libelle === meteoLibelle;
      });
      if (!meteo) {
        return `La météo " ${meteoLibelle} n'existe pas`;
      }
      if (!isIdInListIds(meteosIds, meteo.id)) {
        meteosIds.push(meteo.id);
      }
    }

    // Get the "Espece" or return an error if it doesn't exist
    const espece: Espece = this.especes.find((e) => {
      return (
        e.code === rawDonnee.espece ||
        e.nomFrancais === rawDonnee.espece ||
        e.nomLatin === rawDonnee.espece
      );
    });

    if (!espece) {
      return `L'espèce avec pour code, nom français ou nom scientifique ${rawDonnee.espece} n'existe pas`;
    }

    // Get the "Sexe" or return an error if it doesn't exist
    const sexe = this.sexes.find((s) => {
      return s.libelle === rawDonnee.sexe;
    });
    if (!sexe) {
      return `Le sexe ${rawDonnee.sexe} n'existe pas`;
    }

    // Get the "Age" or return an error if it doesn't exist
    const age = this.ages.find((a) => {
      return a.libelle === rawDonnee.age;
    });
    if (!age) {
      return `L'âge ${rawDonnee.age} n'existe pas`;
    }

    // Get the "Estimation du nombre" or return an error if it doesn't exist
    const estimationNombre = this.estimationsNombre.find((e) => {
      return e.libelle === rawDonnee.estimationNombre;
    });
    if (!estimationNombre) {
      return `L'estimation du nombre ${rawDonnee.estimationNombre} n'existe pas`;
    }

    // Get the "Nombre"
    const nombre: number = rawDonnee.nombre ? +rawDonnee.nombre : null;

    if (!estimationNombre.nonCompte && !nombre) {
      // If "Estimation du nombre" is of type "Compté" then "Nombre" should not be empty
      return `Le nombre ne doit pas être vide quand l'estimation du nombre est de type Compté`;
    } else if (!!estimationNombre.nonCompte && !!nombre) {
      // If "Estimation du nombre" is of type "Non-compté" then "Nombre" should be empty
      return `L'estimation du nombre ${estimationNombre.libelle} est de type Non-compté donc le nombre devrait être vide`;
    }

    // Get the "Estimation de la distance" or return an error if it doesn't exist
    let estimationDistance: EstimationDistance = null;
    if (rawDonnee.estimationDistance) {
      estimationDistance = this.estimationsDistance.find((e) => {
        return e.libelle === rawDonnee.estimationDistance;
      });
      if (!estimationDistance) {
        return `L'estimation de la distance ${rawDonnee.estimationDistance} n'existe pas`;
      }
    }

    // Get the "Comportements" or return an error if some of them does not exist
    const comportementsIds: number[] = [];
    for (const comportementStr of rawDonnee.comportements) {
      const comportement = this.comportements.find((c) => {
        return c.code === comportementStr || c.libelle === comportementStr;
      });

      if (!comportement) {
        return `Le comportement avec pour code ou libellé ${comportementStr} n'existe pas`;
      }

      if (!isIdInListIds(comportementsIds, comportement.id)) {
        comportementsIds.push(comportement.id);
      }
    }

    // Get the "Milieux" or return an error if some of them does not exist
    const milieuxIds: number[] = [];
    for (const milieuStr of rawDonnee.milieux) {
      const milieu: Milieu = this.milieux.find((m) => {
        return m.code === milieuStr || m.libelle === milieuStr;
      });

      if (!milieu) {
        return `Le milieu avec pour code ou libellé ${milieuStr} n'existe pas`;
      }

      if (!isIdInListIds(milieuxIds, milieu.id)) {
        milieuxIds.push(milieu.id);
      }
    }

    // Create the "Inventaire" to save
    const inventaireToSave: Inventaire = rawDonnee.buildInventaire(
      observateur.id,
      associesIds,
      lieudit.id,
      meteosIds,
      altitude,
      coordinates
    );

    // TODO
    const existingDonneeByInventaire = this.donnees.find((d) => {
      const i = d.inventaire;
      return (
        i.date === rawDonnee.date &&
        i.heure === rawDonnee.heure &&
        i.duree === rawDonnee.duree &&
        i.lieuditId === lieudit.id &&
        i.temperature === (rawDonnee.temperature ? +rawDonnee.temperature : null) &&
        i.observateurId === observateur.id
      );
    });

    // Save the inventaire
    const existingInventaireId: number = await findExistingInventaireId(
      inventaireToSave
    );
    if (!existingInventaireId) {
      const inventaireSaveResponse = await persistInventaire(inventaireToSave);
      inventaireToSave.id = inventaireSaveResponse.insertId;
    } else {
      inventaireToSave.id = existingInventaireId;
    }

    // Create the "Donnee" to save
    const donneeToSave: Donnee = rawDonnee.buildDonnee(
      inventaireToSave.id,
      espece.id,
      sexe.id,
      age.id,
      estimationNombre.id,
      estimationDistance ? estimationDistance.id : null,
      comportementsIds,
      milieuxIds
    );

    // Save the "Donnee" or return an error if it does not exist
    const existingDonneeId: number = await findExistingDonneeId(donneeToSave);
    if (!existingDonneeId) {
      const saveDonneeResponse = await persistDonnee(donneeToSave);
      if (!saveDonneeResponse?.insertId) {
        return "Une erreur est survenue pendant l'import";
      }
    } else {
      return `Une donnée similaire existe déjà (voir ID=" + ${existingDonneeId} + ")`;
    }

    return null;
  };
}
