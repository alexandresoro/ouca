import { graphql } from "../../../gql";

export const ESTIMATION_DISTANCE_QUERY = graphql(`
  query GetEstimationDistance($id: Int!) {
    estimationDistance(id: $id) {
      id
      libelle
    }
  }
`);

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

export const UPSERT_ESTIMATION_DISTANCE = graphql(`
  mutation UpsertEstimationDistance($id: Int, $data: InputEstimationDistance!) {
    upsertEstimationDistance(id: $id, data: $data) {
      id
      libelle
    }
  }
`);
