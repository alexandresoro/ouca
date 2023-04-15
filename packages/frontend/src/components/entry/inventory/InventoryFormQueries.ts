import { graphql } from "../../../gql";

export const GET_INVENTAIRE = graphql(`
query GetInventaire($inventoryId: Int!) {
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

export const UPSERT_INVENTAIRE = graphql(`
mutation UpsertInventaire($upsertInventaireId: Int, $data: InputInventaire!) {
  upsertInventaire(id: $upsertInventaireId, data: $data) {
    inventaire {
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
    failureReason {
      correspondingInventaireFound
      inventaireExpectedToBeUpdated
    }
  }
}
`);

export const AUTOCOMPLETE_OBSERVATEURS_QUERY = graphql(`
  query ListObservateursAutocomplete($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    observateurs(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      data {
        id
        libelle
      }
    }
  }
`);
