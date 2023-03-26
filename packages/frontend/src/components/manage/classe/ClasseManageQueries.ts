import { graphql } from "../../../gql";

export const PAGINATED_CLASSES_QUERY = graphql(`
  query ListClasses($searchParams: SearchParams, $orderBy: ClassesOrderBy, $sortOrder: SortOrder) {
    classes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        libelle
        editable
        nbEspeces
        nbDonnees
      }
    }
  }
`);

export const DELETE_CLASSE = graphql(`
  mutation DeleteClasse($id: Int!) {
    deleteClasse(id: $id)
  }
`);

export const EXPORT_CLASSES_QUERY = graphql(`
  query ExportClasses {
    exportClasses
  }
`);
