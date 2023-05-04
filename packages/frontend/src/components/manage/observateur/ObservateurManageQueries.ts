import { graphql } from "../../../gql";

export const OBSERVATEUR_QUERY = graphql(`
  query GetObservateur($id: Int!) {
    observateur(id: $id) {
      id
      libelle
    }
  }
`);

export const PAGINATED_OBSERVATEURS_QUERY = graphql(`
  query ListObservateurs($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    observateurs(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        libelle
        editable
        nbDonnees
      }
    }
  }
`);

export const UPSERT_OBSERVATEUR = graphql(`
  mutation UpsertObservateur($id: Int, $data: InputObservateur!) {
    upsertObservateur(id: $id, data: $data) {
      id
      libelle
    }
  }
`);
