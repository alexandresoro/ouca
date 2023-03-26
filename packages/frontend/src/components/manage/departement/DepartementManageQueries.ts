import { graphql } from "../../../gql";

export const PAGINATED_DEPARTEMENTS_QUERY = graphql(`
  query ListDepartements($searchParams: SearchParams, $orderBy: DepartementsOrderBy, $sortOrder: SortOrder) {
    departements(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
        editable
        nbCommunes
        nbLieuxDits
        nbDonnees
      }
    }
  }
`);

export const DELETE_DEPARTEMENT = graphql(`
  mutation DeleteDepartement($id: Int!) {
    deleteDepartement(id: $id)
  }
`);

export const EXPORT_DEPARTEMENTS_QUERY = graphql(`
  query ExportDepartements {
    exportDepartements
  }
`);
