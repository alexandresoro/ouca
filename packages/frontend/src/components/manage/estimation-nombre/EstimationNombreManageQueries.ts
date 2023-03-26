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

export const DELETE_ESTIMATION_NOMBRE = graphql(`
  mutation DeleteEstimationNombre($id: Int!) {
    deleteEstimationNombre(id: $id)
  }
`);

export const EXPORT_ESTIMATIONS_NOMBRE_QUERY = graphql(`
  query ExportEstimationsNombre {
    exportEstimationsNombre
  }
`);
