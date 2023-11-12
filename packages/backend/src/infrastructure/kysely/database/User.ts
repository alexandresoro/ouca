import { type Generated } from "kysely";

export type User = {
  id: Generated<string>;
  extProviderName: string | null;
  extProviderId: string | null;
};
