import { graphql } from "../../../gql";

export const CLASSE_QUERY = graphql(`
  query GetClasse($id: Int!) {
    classe(id: $id) {
      id
      libelle
    }
  }
`);

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

export const UPSERT_CLASSE = graphql(`
  mutation UpsertClasse($id: Int, $data: InputClasse!) {
    upsertClasse(id: $id, data: $data) {
      id
      libelle
    }
  }
`);
