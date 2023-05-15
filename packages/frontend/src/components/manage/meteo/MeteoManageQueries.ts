import { graphql } from "../../../gql";

export const PAGINATED_METEOS_QUERY = graphql(`
  query ListMeteos($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    meteos(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
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
