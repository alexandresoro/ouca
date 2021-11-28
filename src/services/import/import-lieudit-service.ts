import { Commune, Departement, Lieudit } from "@prisma/client";
import { COORDINATES_SYSTEMS_CONFIG } from "../../model/coordinates-system/coordinates-system-list.object";
import { CoordinatesSystem, CoordinatesSystemType } from "../../model/coordinates-system/coordinates-system.object";
import { ImportedLieuDit } from "../../objects/import/imported-lieu-dit.object";
import { findAllCommunes } from "../entities/commune-service";
import { findCoordinatesSystem } from "../entities/configuration-service";
import { findAllDepartements } from "../entities/departement-service";
import { createLieuxDits, findAllLieuxDits, LieuDitWithCoordinatesAsNumber } from "../entities/lieu-dit-service";
import { ImportService } from "./import-service";

export class ImportLieuxditService extends ImportService {
  private departements: Departement[];
  private communes: Commune[];
  private lieuxDits: (Omit<Lieudit, 'id'> | LieuDitWithCoordinatesAsNumber)[];

  private lieuxDitsToInsert: Omit<Lieudit, 'id'>[];
  private coordinatesSystem: CoordinatesSystem;

  protected getNumberOfColumns = (): number => {
    return 6;
  };

  protected init = async (): Promise<void> => {
    this.lieuxDitsToInsert = [];
    let coordinatesSystemType: CoordinatesSystemType;

    [this.departements, this.communes, this.lieuxDits, coordinatesSystemType] = await Promise.all([findAllDepartements({ includeCounts: false }), findAllCommunes(), findAllLieuxDits(), findCoordinatesSystem()]);

    if (!coordinatesSystemType) {
      return Promise.reject("Veuillez choisir le système de coordonnées de l'application dans la page de configuration");
    } else {
      this.coordinatesSystem = COORDINATES_SYSTEMS_CONFIG[coordinatesSystemType];
    }
  }

  protected validateAndPrepareEntity = (lieuDitTab: string[]): string => {
    const importedLieuDit = new ImportedLieuDit(lieuDitTab, this.coordinatesSystem);

    const dataValidity = importedLieuDit.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the departement exists
    const departement = this.departements.find((departement) => {
      return this.compareStrings(departement.code, importedLieuDit.departement);
    });
    if (!departement) {
      return "Le département n'existe pas";
    }

    // Check that the commune exists
    const commune = this.communes.find((commune) => {
      return (
        commune.departementId === departement.id &&
        (this.compareStrings(`${commune.code}`, importedLieuDit.commune) ||
          this.compareStrings(commune.nom, importedLieuDit.commune))
      );
    });
    if (!commune) {
      return "La commune n'existe pas dans ce département";
    }

    // Check that the lieu-dit does not exist yet
    const lieudit = this.lieuxDits.find((lieuDit) => {
      return (
        lieuDit.communeId === commune.id && this.compareStrings(lieuDit.nom, importedLieuDit.nom)
      );
    });
    if (lieudit) {
      return "Il existe déjà un lieu-dit avec ce nom dans cette commune";
    }

    const lieuditToSave = importedLieuDit.buildLieudit(
      commune.id
    );

    this.lieuxDitsToInsert.push(lieuditToSave);
    this.lieuxDits.push(lieuditToSave);

    return null;
  };

  protected persistAllValidEntities = async (): Promise<void> => {
    if (this.lieuxDitsToInsert.length) {
      await createLieuxDits(this.lieuxDitsToInsert);
    }
  }

}
