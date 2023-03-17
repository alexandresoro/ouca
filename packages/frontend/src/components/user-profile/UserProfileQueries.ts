import { graphql } from "../../gql";

export const EDIT_USER = graphql(`
  mutation EditUser($userEditId: ID!, $editUserData: EditUserData!) {
    userEdit(id: $userEditId, editUserData: $editUserData) {
      id
      firstName
      lastName
      username
      role
    }
  }
`);
