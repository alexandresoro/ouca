import { graphql } from "../../../gql";

export const ESPECE_QUERY = graphql(`
  query GetEspece($id: Int!) {
    espece(id: $id) {
      id
      code
      nomFrancais
      nomLatin
      classe {
        id
      }
    }
  }
`);

export const ALL_CLASSES_QUERY = graphql(`
  query GetAllClassesForEspece($searchParams: SearchParams, $orderBy: ClassesOrderBy, $sortOrder: SortOrder) {
    classes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        libelle
      }
    }
  }
`);

export const PAGINATED_ESPECES_QUERY = graphql(`
  query ListEspeces($searchParams: SearchParams, $orderBy: EspecesOrderBy, $sortOrder: SortOrder) {
    especes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        classe {
          id
          libelle
        }
        code
        editable
        nomFrancais
        nomLatin
        nbDonnees
      }
    }
  }
`);

export const UPSERT_ESPECE = graphql(`
  mutation UpsertEspece($id: Int, $data: InputEspece!) {
    upsertEspece(id: $id, data: $data) {
      id
      code
      nomFrancais
      nomLatin
      classe {
        id
      }
    }
  }
`);

export const DELETE_ESPECE = graphql(`
  mutation DeleteEspece($id: Int!) {
    deleteEspece(id: $id)
  }
`);
