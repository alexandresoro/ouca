import { graphql } from "../../../gql";

export const PAGINATED_AGES_QUERY = graphql(`
  query ListAges($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    ages(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
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
