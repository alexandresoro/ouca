import { EntityDb } from "./entity-db.model"

type DonneeDb = EntityDb & {
  inventaire_id: number,
  espece_id: number,
  sexe_id: number,
  age_id: number,
  estimation_nombre_id: number,
  nombre: number,
  estimation_distance_id: number,
  distance: number,
  commentaire: string,
  regroupement: number,
  date_creation: string
}

export type DonneeDbWithJoins = DonneeDb & {
  comportements_ids?: string,  // The list of comportements comma-separated
  milieux_ids?: string // The list of milieux comma-separated
}

export type DonneeCompleteWithIds = DonneeDb & {
  comportements_ids: Set<number>,
  milieux_ids: Set<number>
}