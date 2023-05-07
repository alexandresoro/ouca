import { graphql } from "../../../gql";

export const LIEU_DIT_QUERY = graphql(`
  query GetLieuDit($id: Int!) {
    lieuDit(id: $id) {
      id
      nom
      altitude
      latitude
      longitude
      commune {
        id
        departement {
          id
        }
      }
    }
  }
`);

export const ALL_COMMUNES_OF_DEPARTEMENT = graphql(`
  query GetAllCommunes($searchParams: SearchParams, $departmentId: Int $orderBy: CommunesOrderBy, $sortOrder: SortOrder) {
    communes(searchParams: $searchParams, departmentId: $departmentId, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
        nom
      }
    }
  }
`);

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

export const UPSERT_LIEU_DIT = graphql(`
  mutation UpsertLieuDit($id: Int, $data: InputLieuDit!) {
    upsertLieuDit(id: $id, data: $data) {
      id
      nom
      altitude
      latitude
      longitude
      commune {
        id
        departement {
          id
        }
      }
    }
  }
`);
