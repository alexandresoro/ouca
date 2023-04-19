import { graphql } from "../../../gql";

export const GET_EXISTING_INVENTAIRE = graphql(`
query GetExistingInventaire($inventoryId: Int!) {
  inventaire(id: $inventoryId) {
    id
    observateur {
      id
      libelle
    }
    associes {
      id
      libelle
    }
    date
    heure
    duree
    lieuDit {
      id
      latitude
      longitude
      altitude
      commune {
        id
        code
        nom
        departement {
          id
          code
        }
      }
    }
    customizedCoordinates {
      latitude
      longitude
      altitude
    }
    meteos {
      id
      libelle
    }
    temperature
  }
}
`);
