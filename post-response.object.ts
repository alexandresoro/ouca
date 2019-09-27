export enum PostResponseStatus {
  SUCCESS,
  ERROR
}

export interface PostResponse {
  status: PostResponseStatus;
  message: string;
  insertId: number;
}
