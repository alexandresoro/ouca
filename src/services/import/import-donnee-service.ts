import {
  Age,
  Commune,
  Comportement,
  Departement,
  Espece,
  EstimationDistance,
  EstimationNombre,
  Meteo,
  Milieu,
  Observateur,
  Sexe
} from "@prisma/client";
import { areCoordinatesCustomized } from "../../model/coordinates-system/coordinates-helper";
import { COORDINATES_SYSTEMS_CONFIG } from "../../model/coordinates-system/coordinates-system-list.object";
import { CoordinatesSystem } from "../../model/coordinates-system/coordinates-system.object";
import { InputDonnee } from "../../model/graphql";
import { Coordinates } from "../../model/types/coordinates.object";
import { ImportedDonnee } from "../../objects/import/imported-donnee.object";
import { LoggedUser } from "../../types/LoggedUser";
import { areSetsContainingSameValues, isIdInListIds } from "../../utils/utils";
import { findAges } from "../entities/age-service";
import { findAllCommunes } from "../entities/commune-service";
import { findAllComportements } from "../entities/comportement-service";
import { findCoordinatesSystem } from "../entities/configuration-service";
import { findAllDepartements } from "../entities/departement-service";
import { createDonnee, DonneeWithRelations, findAllDonnees } from "../entities/donnee-service";
import { findAllEspeces } from "../entities/espece-service";
import { findEstimationsDistance } from "../entities/estimation-distance-service";
import { findEstimationsNombre } from "../entities/estimation-nombre-service";
import { findAllInventaires, InventaireWithRelations, upsertInventaire } from "../entities/inventaire-service";
import { findAllLieuxDits, LieuDitWithCoordinatesAsNumber } from "../entities/lieu-dit-service";
import { findMeteos } from "../entities/meteo-service";
import { findMilieux } from "../entities/milieu-service";
import { findObservateurs } from "../entities/observateur-service";
import { findSexes } from "../entities/sexe-service";
import { ImportService } from "./import-service";

export class ImportDonneeService extends ImportService {
  private coordinatesSystem!: CoordinatesSystem;
  private observateurs!: Observateur[];
  private departements!: Departement[];
  private communes!: Commune[];
  private lieuxDits!: LieuDitWithCoordinatesAsNumber[];
  private especes!: Espece[];
  private ages!: Age[];
  private sexes!: Sexe[];
  private estimationsNombre!: EstimationNombre[];
  private estimationsDistance!: EstimationDistance[];
  private comportements!: Comportement[];
  private milieux!: Milieu[];
  private meteos!: Meteo[];
  private inventaires: InventaireWithRelations[] = []; // The list of existing inventaires + the ones we created along with the validation

  private existingDonnees!: DonneeWithRelations[];

  private newDonnees!: InputDonnee[];

  protected getNumberOfColumns = (): number => {
    return 32;
  };

  protected init = async (loggedUser: LoggedUser): Promise<void> => {
    this.newDonnees = [];

    const coordinatesSystemType = await findCoordinatesSystem(loggedUser);
    if (!coordinatesSystemType) {
      return Promise.reject(
        "Veuillez choisir le système de coordonnées de l'application dans la page de configuration"
      );
    } else {
      this.coordinatesSystem = COORDINATES_SYSTEMS_CONFIG[coordinatesSystemType];
    }

    this.observateurs = await findObservateurs();
    this.departements = await findAllDepartements();
    this.communes = await findAllCommunes();
    this.lieuxDits = await findAllLieuxDits();
    this.meteos = await findMeteos();
    this.especes = await findAllEspeces();
    this.sexes = await findSexes();
    this.ages = await findAges();
    this.estimationsNombre = await findEstimationsNombre();
    this.estimationsDistance = await findEstimationsDistance();
    this.comportements = await findAllComportements();
    this.milieux = await findMilieux();
    this.inventaires = await findAllInventaires();
    this.existingDonnees = await findAllDonnees();
  };

  protected validateAndPrepareEntity = async (donneeTab: string[], loggedUser: LoggedUser): Promise<string | null> => {
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
      const associe = this.findObservateur(associeLibelle);
      if (!associe) {
        return `L'observateur associé ${associeLibelle} n'existe pas`;
      }

      if (!isIdInListIds(associesIds, associe.id)) {
        associesIds.add(associe.id);
      }
    }

    // Get the "Departement" or return an error if it doesn't exist
    const departement = this.findDepartement(importedDonnee.departement);
    if (!departement) {
      return `Le département ${importedDonnee.departement} n'existe pas`;
    }

    // Get the "Commune" or return an error if it does not exist
    const commune = this.findCommune(departement.id, importedDonnee.commune);
    if (!commune) {
      return `La commune avec pour code ou nom ${importedDonnee.commune} n'existe pas dans le département ${departement.code}`;
    }

    // Get the "Lieu-dit" or return an error if it does not exist
    const lieudit = this.findLieuDit(commune.id, importedDonnee.lieuDit);
    if (!lieudit) {
      return `Le lieu-dit ${importedDonnee.lieuDit} n'existe pas dans la commune ${commune.code} - ${commune.nom} du département ${departement.code}`;
    }

    // Get the customized coordinates
    let altitude: number | null = +importedDonnee.altitude;
    let coordinates: Coordinates | null = {
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
      const meteo = this.findMeteo(libelleMeteo);
      if (!meteo) {
        return `La météo ${libelleMeteo} n'existe pas`;
      }

      if (!isIdInListIds(meteosIds, meteo.id)) {
        meteosIds.add(meteo.id);
      }
    }

    // Get the "Espece" or return an error if it doesn't exist
    const espece = this.findEspece(importedDonnee.espece);
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
    const nombre = importedDonnee.nombre ? +importedDonnee.nombre : null;

    if (!estimationNombre.nonCompte && !nombre) {
      // If "Estimation du nombre" is of type "Compté" then "Nombre" should not be empty
      return `Le nombre ne doit pas être vide quand l'estimation du nombre est de type Compté`;
    } else if (!!estimationNombre.nonCompte && !!nombre) {
      // If "Estimation du nombre" is of type "Non-compté" then "Nombre" should be empty
      return `L'estimation du nombre ${estimationNombre.libelle} est de type Non-compté donc le nombre devrait être vide`;
    }

    // Get the "Estimation de la distance" or return an error if it doesn't exist
    let estimationDistance: EstimationDistance | undefined | null = null;
    if (importedDonnee.estimationDistance) {
      estimationDistance = this.findEstimationDistance(importedDonnee.estimationDistance);
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
      const milieu = this.findMilieu(milieuStr);
      if (!milieu) {
        return `Le milieu avec pour code ou libellé ${milieuStr} n'existe pas`;
      }

      if (!isIdInListIds(milieuxIds, milieu.id)) {
        milieuxIds.add(milieu.id);
      }
    }

    // OK 68 premières lignes

    const inputInventaire = importedDonnee.buildInputInventaire(
      observateur.id,
      associesIds,
      lieudit.id,
      meteosIds,
      altitude,
      coordinates
    );

    // Find if we already have an existing inventaire that matches the one from the current donnee
    const existingInventaire = this.inventaires.find((existingInventaire) => {
      return (
        existingInventaire.observateurId === inputInventaire.observateurId &&
        existingInventaire.date === inputInventaire.date &&
        existingInventaire.heure === inputInventaire.heure &&
        existingInventaire.duree === inputInventaire.duree &&
        existingInventaire.lieuDitId === inputInventaire.lieuDitId &&
        existingInventaire.customizedCoordinates?.altitude === inputInventaire.altitude &&
        existingInventaire.customizedCoordinates?.longitude === inputInventaire.longitude &&
        existingInventaire.customizedCoordinates?.latitude === inputInventaire.latitude &&
        existingInventaire.temperature === inputInventaire.temperature &&
        areSetsContainingSameValues(
          new Set(existingInventaire.associes?.map((associe) => associe?.id)),
          new Set(inputInventaire.associesIds)
        ) &&
        areSetsContainingSameValues(
          new Set(existingInventaire.meteos?.map((meteo) => meteo?.id)),
          new Set(inputInventaire.meteosIds)
        )
      );
    });

    // Check if already have a similar donnee in the database
    const existingDonneeDatabase = this.existingDonnees.find((donnee) => {
      return (
        donnee.inventaireId === existingInventaire?.id &&
        donnee.especeId === espece.id &&
        donnee.sexeId === sexe.id &&
        donnee.ageId === age.id &&
        donnee.nombre === (importedDonnee.nombre ? +importedDonnee.nombre : null) &&
        donnee.estimationNombreId === estimationNombre.id &&
        donnee.distance === (importedDonnee.distance ? +importedDonnee.distance : null) &&
        donnee.estimationDistanceId === (estimationDistance?.id ?? null) &&
        donnee.regroupement === (importedDonnee.regroupement ? +importedDonnee.regroupement : null) &&
        this.compareStrings(donnee.commentaire, importedDonnee.commentaire) &&
        areSetsContainingSameValues(
          new Set(donnee.comportements?.map((comportement) => comportement?.id)),
          comportementsIds
        ) &&
        areSetsContainingSameValues(new Set(donnee.milieux?.map((milieu) => milieu?.id)), milieuxIds)
      );
    });

    if (existingDonneeDatabase) {
      return `Une donnée similaire existe déjà (voir ID=${existingDonneeDatabase.id})`;
    }

    // Check if already have a similar donnee in the ones we want to create
    const existingDonneeNew = this.newDonnees.find((donnee) => {
      return (
        donnee.inventaireId === existingInventaire?.id &&
        donnee.especeId === espece.id &&
        donnee.sexeId === sexe.id &&
        donnee.ageId === age.id &&
        donnee.nombre === (importedDonnee.nombre ? +importedDonnee.nombre : null) &&
        donnee.estimationNombreId === estimationNombre.id &&
        donnee.distance === (importedDonnee.distance ? +importedDonnee.distance : null) &&
        donnee.estimationDistanceId === (estimationDistance?.id ?? null) &&
        donnee.regroupement === (importedDonnee.regroupement ? +importedDonnee.regroupement : null) &&
        this.compareStrings(donnee.commentaire, importedDonnee.commentaire) &&
        areSetsContainingSameValues(new Set(donnee.comportementsIds), comportementsIds) &&
        areSetsContainingSameValues(new Set(donnee.milieuxIds), milieuxIds)
      );
    });

    if (existingDonneeNew) {
      return `Une donnée similaire existe déjà dans la liste à importer`;
    }

    // Now we know that we need to add this donnee
    let inventaireId: number;

    if (!existingInventaire) {
      // Create the inventaire if it does not exist yet
      const inventaire = await upsertInventaire(
        {
          data: inputInventaire
        },
        loggedUser
      );
      inventaireId = inventaire?.id;

      // Add the inventaire to the list
      this.inventaires.push(inventaire);
    } else {
      inventaireId = existingInventaire.id;
    }

    // Build the donnee
    const newDonnee = importedDonnee.buildInputDonnee(
      inventaireId,
      espece.id,
      sexe.id,
      age.id,
      estimationNombre.id,
      estimationDistance?.id ?? null,
      comportementsIds,
      milieuxIds
    );

    this.newDonnees.push(newDonnee);

    return null;
  };

  protected persistAllValidEntities = async (): Promise<void> => {
    for (const inputDonnee of this.newDonnees) {
      await createDonnee(inputDonnee);
    }
  };

  private findObservateur = (libelleObservateur: string): Observateur | undefined => {
    return this.observateurs.find((observateur) => {
      return this.compareStrings(observateur.libelle, libelleObservateur);
    });
  };

  private findDepartement = (codeDepartement: string): Departement | undefined => {
    return this.departements.find((departement) => {
      return this.compareStrings(departement.code, codeDepartement);
    });
  };

  private findCommune = (departementId: number, nomOrCodeCommune: string): Omit<Commune, "departement"> | undefined => {
    return this.communes.find((commune) => {
      return (
        commune.departementId === departementId &&
        (this.compareStrings(`${commune.code}`, nomOrCodeCommune) || this.compareStrings(commune.nom, nomOrCodeCommune))
      );
    });
  };

  private findLieuDit = (communeId: number, nomLieuDit: string): LieuDitWithCoordinatesAsNumber | undefined => {
    return this.lieuxDits.find((lieuDit) => {
      return lieuDit.communeId === communeId && this.compareStrings(lieuDit.nom, nomLieuDit);
    });
  };

  private findMeteo = (libelleMeteo: string): Meteo | undefined => {
    return this.meteos.find((meteo) => {
      return this.compareStrings(meteo.libelle, libelleMeteo);
    });
  };

  private findEspece = (codeOrNomEspece: string): Espece | undefined => {
    return this.especes.find((espece) => {
      return (
        this.compareStrings(espece.code, codeOrNomEspece) ||
        this.compareStrings(espece.nomFrancais, codeOrNomEspece) ||
        this.compareStrings(espece.nomLatin, codeOrNomEspece)
      );
    });
  };

  private findSexe = (libelleSexe: string): Sexe | undefined => {
    return this.sexes.find((sexe) => {
      return this.compareStrings(sexe.libelle, libelleSexe);
    });
  };

  private findAge = (libelleMeteo: string): Age | undefined => {
    return this.ages.find((age) => {
      return this.compareStrings(age.libelle, libelleMeteo);
    });
  };

  private findEstimationNombre = (libelleEstimation: string): EstimationNombre | undefined => {
    return this.estimationsNombre.find((estimation) => {
      return this.compareStrings(estimation.libelle, libelleEstimation);
    });
  };

  private findEstimationDistance = (libelleEstimation: string): EstimationDistance | undefined => {
    return this.estimationsDistance.find((estimation) => {
      return this.compareStrings(estimation.libelle, libelleEstimation);
    });
  };

  private findComportement = (codeOrLibelleComportement: string): Comportement | undefined => {
    return this.comportements.find((comportement) => {
      return (
        this.compareStrings(comportement.code, codeOrLibelleComportement) ||
        this.compareStrings(comportement.libelle, codeOrLibelleComportement)
      );
    });
  };

  private findMilieu = (codeOrLibelleMilieu: string): Milieu | undefined => {
    return this.milieux.find((milieu) => {
      return (
        this.compareStrings(milieu.code, codeOrLibelleMilieu) ||
        this.compareStrings(milieu.libelle, codeOrLibelleMilieu)
      );
    });
  };
}
