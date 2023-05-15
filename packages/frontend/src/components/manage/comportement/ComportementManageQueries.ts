import { graphql } from "../../../gql";

export const PAGINATED_COMPORTEMENTS_QUERY = graphql(`
  query ListComportements($searchParams: SearchParams, $orderBy: ComportementsOrderBy, $sortOrder: SortOrder) {
    comportements(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
        libelle
        nicheur
        editable
        nbDonnees
      }
    }
  }
`);
