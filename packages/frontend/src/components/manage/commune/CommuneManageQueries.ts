import { graphql } from "../../../gql";

export const PAGINATED_COMMUNES_QUERY = graphql(`
  query ListCommunes($searchParams: SearchParams, $orderBy: CommunesOrderBy, $sortOrder: SortOrder) {
    communes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        departement {
          id
          code
        }
        id
        code
        nom
        editable
        nbLieuxDits
        nbDonnees
      }
    }
  }
`);
