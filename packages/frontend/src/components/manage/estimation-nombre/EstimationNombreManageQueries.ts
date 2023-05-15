import { graphql } from "../../../gql";

export const PAGINATED_ESTIMATIONS_NOMBRE_QUERY = graphql(`
  query ListEstimationsNombre($searchParams: SearchParams, $orderBy: EstimationNombreOrderBy, $sortOrder: SortOrder) {
    estimationsNombre(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        libelle
        editable
        nbDonnees
        nonCompte
      }
    }
  }
`);
