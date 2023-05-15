import { graphql } from "../../../gql";

export const PAGINATED_ESTIMATIONS_DISTANCE_QUERY = graphql(`
  query ListEstimationsDistance(
    $searchParams: SearchParams
    $orderBy: EntitesAvecLibelleOrderBy
    $sortOrder: SortOrder
  ) {
    estimationsDistance(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
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
