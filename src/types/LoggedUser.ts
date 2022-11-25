import { type DatabaseRole } from "@prisma/client";

export type LoggedUser = {
  id: string;
  role: DatabaseRole;
};
