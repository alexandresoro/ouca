import { graphql } from "../../../gql";

export const ESTIMATION_NOMBRE_QUERY = graphql(`
  query GetEstimationNombre($id: Int!) {
    estimationNombre(id: $id) {
      id
      libelle
      nonCompte
    }
  }
`);

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

export const UPSERT_ESTIMATION_NOMBRE = graphql(`
  mutation UpsertEstimationNombre($id: Int, $data: InputEstimationNombre!) {
    upsertEstimationNombre(id: $id, data: $data) {
      id
      libelle
      nonCompte
    }
  }
`);

export const DELETE_ESTIMATION_NOMBRE = graphql(`
  mutation DeleteEstimationNombre($id: Int!) {
    deleteEstimationNombre(id: $id)
  }
`);
