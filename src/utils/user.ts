import { DatabaseRole } from "@prisma/client";

export type User = {
  id: string;
  role: DatabaseRole;
};
