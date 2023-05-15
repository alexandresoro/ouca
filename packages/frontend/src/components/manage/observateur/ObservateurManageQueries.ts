import { graphql } from "../../../gql";

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
