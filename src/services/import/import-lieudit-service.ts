
import { Commune, CoordinatesSystem, CoordinatesSystemType, COORDINATES_SYSTEMS_CONFIG, Departement, Lieudit } from "@ou-ca/ouca-model";
import { ImportedLieuDit } from "../../objects/import/imported-lieu-dit.object";
import { findAllCommunes } from "../../sql-api/sql-api-commune";
import { findCoordinatesSystem } from "../../sql-api/sql-api-configuration";
import { findAllDepartements } from "../../sql-api/sql-api-departement";
import { findAllLieuxDits, persistLieuDit } from "../../sql-api/sql-api-lieudit";
import { ImportServiceSingle } from "./import-service-single";

export class ImportLieuxditService extends ImportServiceSingle {
  private departements: Departement[];
  private communes: Commune[];
  private lieuxDits: Lieudit[];
  private coordinatesSystem: CoordinatesSystem;

  protected getNumberOfColumns = (): number => {
    return 6;
  };

  protected init = async (): Promise<void> => {
    let coordinatesSystemType: CoordinatesSystemType;

    [this.departements, this.communes, this.lieuxDits, coordinatesSystemType] = await Promise.all([findAllDepartements(), findAllCommunes(), findAllLieuxDits(), findCoordinatesSystem()]);

    if (!coordinatesSystemType) {
      return Promise.reject("Veuillez choisir le système de coordonnées de l'application dans la page de configuration");
    } else {
      this.coordinatesSystem = COORDINATES_SYSTEMS_CONFIG[coordinatesSystemType];
    }
  }

  protected importEntity = async (lieuDitTab: string[]): Promise<string> => {
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
    const lieudit: Lieudit = this.lieuxDits.find((lieuDit) => {
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

    const saveResult = await persistLieuDit(lieuditToSave);
    if (!saveResult?.insertId) {
      return "Une erreur est survenue pendant l'import";
    }

    this.lieuxDits.push(lieuditToSave);

    return null;
  };


}
