import { graphql } from "../../../gql";

export const GET_INVENTAIRE = graphql(`
query GetInventaire($id: Int!) {
  inventaire(id: $id) {
    id
    observateur {
      id
    }
    associes {
      id
    }
    date
    heure
    duree
    lieuDit {
      id
      commune {
        id
        departement {
          id
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
    }
    temperature
  }
}
`);

export const GET_INVENTORY_DEFAULTS_SETTINGS = graphql(`
query GetInventoryDefaultSettings {
  settings {
    defaultObservateurId
    defaultDepartementId
    areAssociesDisplayed
    isMeteoDisplayed
  }
}
`);
