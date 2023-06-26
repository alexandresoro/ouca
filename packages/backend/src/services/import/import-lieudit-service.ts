import { COORDINATES_SYSTEMS_CONFIG } from "@ou-ca/common/coordinates-system/coordinates-system-list.object";
import {
  type CoordinatesSystem,
  type CoordinatesSystemType,
} from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { type Department } from "@ou-ca/common/entities/department";
import { type Locality } from "@ou-ca/common/entities/locality";
import { type Town } from "@ou-ca/common/entities/town";
import { ImportedLieuDit } from "../../objects/import/imported-lieu-dit.object.js";
import { type LieuditCreateInput } from "../../repositories/lieudit/lieudit-repository-types.js";
import { type LoggedUser } from "../../types/User.js";
import { ImportService } from "./import-service.js";

export class ImportLieuxditService extends ImportService {
  private departements!: Department[];
  private communes!: Town[];
  private lieuxDits!: (Locality | ImportedLieuDit)[];

  private lieuxDitsToInsert!: Omit<LieuditCreateInput, "owner_id">[];
  private coordinatesSystem!: CoordinatesSystem;

  protected getNumberOfColumns = (): number => {
    return 6;
  };

  protected init = async (loggedUser: LoggedUser): Promise<void> => {
    this.lieuxDitsToInsert = [];
    let coordinatesSystemType: CoordinatesSystemType | undefined;

    [this.departements, this.communes, this.lieuxDits, coordinatesSystemType] = await Promise.all([
      this.services.departementService.findAllDepartements(),
      this.services.communeService.findAllCommunes(),
      this.services.lieuditService.findAllLieuxDits(),
      this.services.settingsService.findCoordinatesSystem(loggedUser),
    ]);

    if (!coordinatesSystemType) {
      return Promise.reject(
        "Veuillez choisir le système de coordonnées de l'application dans la page de configuration"
      );
    } else {
      this.coordinatesSystem = COORDINATES_SYSTEMS_CONFIG[coordinatesSystemType];
    }
  };

  protected validateAndPrepareEntity = (lieuDitTab: string[]): string | null => {
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
        commune.departmentId === departement.id &&
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
        ((lieuDit as Locality)?.townId === commune.id || (lieuDit as ImportedLieuDit)?.commune === commune.nom) &&
        this.compareStrings(lieuDit.nom, importedLieuDit.nom)
      );
    });
    if (lieudit) {
      return "Il existe déjà un lieu-dit avec ce nom dans cette commune";
    }

    const lieuditToSave = importedLieuDit.buildLieudit(commune.id);

    this.lieuxDitsToInsert.push(lieuditToSave);
    this.lieuxDits.push(importedLieuDit);

    return null;
  };

  protected persistAllValidEntities = async (loggedUser: LoggedUser): Promise<void> => {
    if (this.lieuxDitsToInsert.length) {
      await this.services.lieuditService.createLieuxDits(this.lieuxDitsToInsert, loggedUser);
    }
  };
}
