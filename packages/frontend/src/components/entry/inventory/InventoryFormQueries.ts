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
        libelle
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

export const AUTOCOMPLETE_DEPARTMENTS_QUERY = graphql(`
  query ListDepartmentsAutocomplete($searchParams: SearchParams, $orderBy: DepartementsOrderBy, $sortOrder: SortOrder) {
    departements(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      data {
        id
        code
      }
    }
  }
`);

export const AUTOCOMPLETE_TOWNS_QUERY = graphql(`
  query ListTownsAutocomplete($searchParams: SearchParams, $departmentId: Int, $orderBy: CommunesOrderBy, $sortOrder: SortOrder) {
    communes(searchParams: $searchParams, departmentId: $departmentId, orderBy: $orderBy, sortOrder: $sortOrder) {
      data {
        id
        code
        nom
      }
    }
  }
`);

export const AUTOCOMPLETE_WEATHERS_QUERY = graphql(`
  query ListWeathersAutocomplete($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    meteos(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      data {
        id
        libelle
      }
    }
  }
`);
