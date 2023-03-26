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

export const DELETE_LIEU_DIT = graphql(`
  mutation DeleteLieuDit($id: Int!) {
    deleteLieuDit(id: $id)
  }
`);

export const EXPORT_LIEUX_DITS_QUERY = graphql(`
  query ExportLieuxDits {
    exportLieuxDits
  }
`);
