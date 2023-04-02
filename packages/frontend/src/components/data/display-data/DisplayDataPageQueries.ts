import { graphql } from "../../../gql";

export const DONNEE_QUERY = graphql(`
  query GetDonnee($id: Int!) {
    donnee(id: $id) {
      id
      donnee {
        id
        inventaire {
          id
          observateur {
            id
            libelle
          }
          associes {
            id
            libelle
          }
          date
          heure
          duree
          lieuDit {
            id
            nom
            latitude
            longitude
            altitude
            coordinatesSystem
            commune {
              id
              code
              nom
              departement {
                id
                code
              }
            }
          }
          customizedCoordinates {
            latitude
            longitude
            altitude
            system
          }
          temperature
          meteos {
            id
            libelle
          }
        }
        espece {
          id
          code
          nomFrancais
          nomLatin
          classe {
            id
            libelle
          }
        }
        estimationNombre {
          id
          libelle
        }
        nombre
        estimationDistance {
          id
          libelle
        }
        distance
        regroupement
        sexe {
          id
          libelle
        }
        age {
          id
          libelle
        }
        comportements {
          id
          code
          libelle
        }
        milieux {
          id
          code
          libelle
        }
        commentaire
      }
      navigation {
        index
        previousDonneeId
        nextDonneeId
      }
    }
  }
`);
