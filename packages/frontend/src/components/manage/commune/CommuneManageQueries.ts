import { graphql } from "../../../gql";

export const COMMUNE_QUERY = graphql(`
  query GetCommune($id: Int!) {
    commune(id: $id) {
      id
      code
      nom
      departement {
        id
      }
    }
  }
`);

export const ALL_DEPARTMENTS_QUERY = graphql(`
  query GetAllDepartmentsForCommune($searchParams: SearchParams, $orderBy: DepartementsOrderBy, $sortOrder: SortOrder) {
    departements(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
      }
    }
  }
`);

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

export const UPSERT_COMMUNE = graphql(`
  mutation UpsertCommune($id: Int, $data: InputCommune!) {
    upsertCommune(id: $id, data: $data) {
      id
      code
      nom
      departement {
        id
      }
    }
  }
`);

export const DELETE_COMMUNE = graphql(`
  mutation DeleteCommune($id: Int!) {
    deleteCommune(id: $id)
  }
`);

export const EXPORT_COMMUNES_QUERY = graphql(`
  query ExportCommunes {
    exportCommunes
  }
`);
