import { graphql } from "../../../gql";

export const PAGINATED_LIEUX_DITS_QUERY = graphql(`
  query ListLieuxDits($searchParams: SearchParams, $orderBy: LieuxDitsOrderBy, $sortOrder: SortOrder) {
    lieuxDits(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        commune {
          id
          departement {
            id
            code
          }
          code
          nom
        }
        nom
        altitude
        longitude
        latitude
        editable
        nbDonnees
      }
    }
  }
`);
