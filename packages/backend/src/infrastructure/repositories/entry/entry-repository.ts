import { kysely } from "@infrastructure/kysely/kysely.js";

export const buildEntryRepository = () => {
  const findLatestGrouping = async (): Promise<number | null> => {
    const result = await kysely
      .selectFrom("donnee")
      .select((eb) => eb.fn.max("regroupement").as("grouping"))
      .executeTakeFirstOrThrow();

    return result.grouping;
  };

  return {
    findLatestGrouping,
  };
};
