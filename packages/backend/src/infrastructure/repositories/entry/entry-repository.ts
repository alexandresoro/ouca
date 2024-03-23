import { kysely } from "@infrastructure/kysely/kysely.js";

export const buildEntryRepository = () => {
  const findLatestGrouping = async (): Promise<number | null> => {
    const result = await kysely
      .selectFrom("donnee")
      .select((eb) => eb.fn.max("regroupement").as("grouping"))
      .executeTakeFirstOrThrow();

    return result.grouping;
  };

  const updateAssociatedInventory = async (currentInventaireId: string, newInventaireId: string): Promise<void> => {
    await kysely
      .updateTable("donnee")
      .set({
        inventaireId: Number.parseInt(newInventaireId),
      })
      .where("inventaireId", "=", Number.parseInt(currentInventaireId))
      .execute();
  };

  return {
    findLatestGrouping,
    updateAssociatedInventory,
  };
};
