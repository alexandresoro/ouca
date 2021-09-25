import { areCoordinatesCustomized } from "../../model/coordinates-system/coordinates-helper";
import { COORDINATES_SYSTEMS_CONFIG } from "../../model/coordinates-system/coordinates-system-list.object";
import { CoordinatesSystem } from "../../model/coordinates-system/coordinates-system.object";
import { Commune, ComportementWithCounts, DepartementWithCounts, LieuDit, MeteoWithCounts, ObservateurWithCounts } from "../../model/graphql";
import { Age } from "../../model/types/age.object";
import { Coordinates } from "../../model/types/coordinates.object";
import { Espece } from "../../model/types/espece.model";
import { EstimationDistance } from "../../model/types/estimation-distance.object";
import { EstimationNombre } from "../../model/types/estimation-nombre.object";
import { Milieu } from "../../model/types/milieu.object";
import { Sexe } from "../../model/types/sexe.object";
import { DonneeCompleteWithIds } from "../../objects/db/donnee-db.type";
import { InventaireCompleteWithIds } from "../../objects/db/inventaire-db.object";
import { ImportedDonnee } from "../../objects/import/imported-donnee.object";
import { areSetsContainingSameValues, isIdInListIds } from "../../utils/utils";
import { findAllAges } from "../entities/age-service";
import { findAllCommunes } from "../entities/commune-service";
import { findAllComportements } from "../entities/comportement-service";
import { findCoordinatesSystem } from "../entities/configuration-service";
import { findAllDepartements } from "../entities/departement-service";
import { findAllDonneesWithIds, insertDonnees } from "../entities/donnee-service";
import { findAllEspeces } from "../entities/espece-service";
import { findAllEstimationsDistance } from "../entities/estimation-distance-service";
import { findAllEstimationsNombre } from "../entities/estimation-nombre-service";
import { findAllInventairesWithIds, insertInventaires } from "../entities/inventaire-service";
import { findAllLieuxDits } from "../entities/lieu-dit-service";
import { findAllMeteos } from "../entities/meteo-service";
import { findAllMilieux } from "../entities/milieu-service";
import { findAllObservateurs } from "../entities/observateur-service";
import { findAllSexes } from "../entities/sexe-service";
import { ImportService } from "./import-service";

export class ImportDonneeService extends ImportService {
  private coordinatesSystem: CoordinatesSystem;
  private observateurs: ObservateurWithCounts[];
  private departements: DepartementWithCounts[];
  private communes: Commune[];
  private lieuxDits: LieuDit[];
  private especes: Espece[];
  private ages: Age[];
  private sexes: Sexe[];
  private estimationsNombre: EstimationNombre[];
  private estimationsDistance: EstimationDistance[];
  private comportements: ComportementWithCounts[];
  private milieux: Milieu[];
  private meteos: MeteoWithCounts[];
  private existingInventaires: InventaireCompleteWithIds[];

  private newInventaires: InventaireCompleteWithIds[]; // New inventaires that do not yet exist and will need to be created, their id is a temporary one < 0

  private temporaryIdIndex = -1;

  private existingDonnees: DonneeCompleteWithIds[];

  private newDonnees: DonneeCompleteWithIds[];

  protected getNumberOfColumns = (): number => {
    return 32;
  };


  protected init = async (): Promise<void> => {
    this.newInventaires = [];
    this.newDonnees = [];

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
    this.especes = await findAllEspeces();
    this.sexes = await findAllSexes();
    this.ages = await findAllAges();
    this.estimationsNombre = await findAllEstimationsNombre();
    this.estimationsDistance = await findAllEstimationsDistance();
    this.comportements = await findAllComportements();
    this.milieux = await findAllMilieux();
    this.existingInventaires = await findAllInventairesWithIds();
    this.existingDonnees = await findAllDonneesWithIds();
  };

  protected validateAndPrepareEntity = (donneeTab: string[]): string => {
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
    const associesIds = new Set<number>();
    for (const associeLibelle of importedDonnee.associes) {
      const associe: ObservateurWithCounts = this.findObservateur(associeLibelle);
      if (!associe) {
        return `L'observateur associé ${associeLibelle} n'existe pas`;
      }

      if (!isIdInListIds(associesIds, associe.id)) {
        associesIds.add(associe.id);
      }
    }

    // Get the "Departement" or return an error if it doesn't exist
    const departement: DepartementWithCounts = this.findDepartement(importedDonnee.departement);
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
    const meteosIds = new Set<number>();
    for (const libelleMeteo of importedDonnee.meteos) {
      const meteo: MeteoWithCounts = this.findMeteo(libelleMeteo);
      if (!meteo) {
        return `La météo ${libelleMeteo} n'existe pas`;
      }

      if (!isIdInListIds(meteosIds, meteo.id)) {
        meteosIds.add(meteo.id);
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
    const comportementsIds = new Set<number>();
    for (const comportementStr of importedDonnee.comportements) {
      const comportement = this.findComportement(comportementStr);
      if (!comportement) {
        return `Le comportement avec pour code ou libellé ${comportementStr} n'existe pas`;
      }

      if (!isIdInListIds(comportementsIds, comportement.id)) {
        comportementsIds.add(comportement.id);
      }
    }

    // Get the "Milieux" or return an error if some of them does not exist
    const milieuxIds = new Set<number>();
    for (const milieuStr of importedDonnee.milieux) {
      const milieu: Milieu = this.findMilieu(milieuStr);
      if (!milieu) {
        return `Le milieu avec pour code ou libellé ${milieuStr} n'existe pas`;
      }

      if (!isIdInListIds(milieuxIds, milieu.id)) {
        milieuxIds.add(milieu.id);
      }
    }

    // OK 68 premières lignes

    let associatedInventaire = importedDonnee.buildInventaireWithIds(
      this.temporaryIdIndex--,
      observateur.id,
      associesIds,
      lieudit.id,
      meteosIds,
      altitude,
      coordinates
    );

    // Find if we already have an existing inventaire that matches
    const existingInventaire = [...this.existingInventaires, ...this.newInventaires].find((existingInventaire) => {
      return (
        existingInventaire.observateur_id === associatedInventaire.observateur_id &&
        existingInventaire.date === associatedInventaire.date &&
        existingInventaire.heure === associatedInventaire.heure &&
        existingInventaire.duree === associatedInventaire.duree &&
        existingInventaire.lieudit_id === associatedInventaire.lieudit_id &&
        existingInventaire.altitude === associatedInventaire.altitude &&
        existingInventaire.longitude === associatedInventaire.longitude &&
        existingInventaire.latitude === associatedInventaire.latitude &&
        existingInventaire.temperature === associatedInventaire.temperature &&
        areSetsContainingSameValues(existingInventaire.associes_ids, associatedInventaire.associes_ids) &&
        areSetsContainingSameValues(existingInventaire.meteos_ids, associatedInventaire.meteos_ids)
      );
    });

    if (existingInventaire) {
      associatedInventaire = existingInventaire;
    }

    // Create the "Donnee" to save
    const donneeWithIds = importedDonnee.buildDonneeWithIds(
      associatedInventaire.id,
      espece.id,
      sexe.id,
      age.id,
      estimationNombre.id,
      estimationDistance?.id ?? null,
      comportementsIds,
      milieuxIds
    );

    // Check if already have a similar donnee
    const existingDonnee = [...this.existingDonnees, ...this.newDonnees].find((donnee) => {
      return (
        donnee.inventaire_id === donneeWithIds.inventaire_id &&
        donnee.espece_id === donneeWithIds.espece_id &&
        donnee.sexe_id === donneeWithIds.sexe_id &&
        donnee.age_id === donneeWithIds.age_id &&
        donnee.nombre === donneeWithIds.nombre &&
        donnee.estimation_nombre_id === donneeWithIds.estimation_nombre_id &&
        donnee.distance === donneeWithIds.distance &&
        donnee.estimation_distance_id === donneeWithIds.estimation_distance_id &&
        donnee.regroupement === donneeWithIds.regroupement &&
        this.compareStrings(donnee.commentaire, donneeWithIds.commentaire) &&
        areSetsContainingSameValues(donnee.comportements_ids, donneeWithIds.comportements_ids) &&
        areSetsContainingSameValues(donnee.milieux_ids, donneeWithIds.milieux_ids)
      );
    });

    if (existingDonnee) {
      return `Une donnée similaire existe déjà (voir ID=${existingDonnee.id})`;
    }

    if (!existingInventaire) {
      this.newInventaires.push(associatedInventaire);
    }
    this.newDonnees.push(donneeWithIds);

    return null;
  };

  protected persistAllValidEntities = async (): Promise<void> => {

    // Insert all new inventaires and map each temporary inventaire id to the real inserted one e.g. -13 => 14441, -14 => 14442...
    let inventairesId: number[] = [];
    const mappingInventairesIds: { [key: number]: number } = {};
    if (this.newInventaires.length) {
      inventairesId = (await insertInventaires(this.newInventaires)).map(inserted => inserted.id);
      this.newInventaires.forEach((inventaire, index) => {
        mappingInventairesIds[inventaire.id] = inventairesId[index];
      });
    }

    // Replace the temporary inventaire ids of each donnee with their real one, 
    // now that the inventaire have been properly inserted

    let donneesToInsert = this.newDonnees;
    if (Object.entries(mappingInventairesIds).length) {
      donneesToInsert = this.newDonnees.map((donnee) => {
        const { inventaire_id, ...otherDataDonnee } = donnee;
        if (inventaire_id > 0) {
          // This is not a donnee for which a new inventaire has been inserted
          return donnee;
        }
        return {
          ...otherDataDonnee,
          inventaire_id: mappingInventairesIds[inventaire_id]
        }
      });
    }

    if (donneesToInsert.length) {
      await insertDonnees(donneesToInsert);
    }
  }

  private findObservateur = (libelleObservateur: string): ObservateurWithCounts => {
    return this.observateurs.find((observateur) => {
      return this.compareStrings(observateur.libelle, libelleObservateur);
    });
  }

  private findDepartement = (codeDepartement: string): DepartementWithCounts => {
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

  private findLieuDit = (communeId: number, nomLieuDit: string): LieuDit => {
    return this.lieuxDits.find((lieuDit) => {
      return lieuDit.communeId === communeId && this.compareStrings(lieuDit.nom, nomLieuDit);
    });
  }

  private findMeteo = (libelleMeteo: string): MeteoWithCounts => {
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

  private findComportement = (codeOrLibelleComportement: string): ComportementWithCounts => {
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
