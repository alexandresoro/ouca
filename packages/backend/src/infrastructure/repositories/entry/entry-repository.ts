import { kysely } from "@infrastructure/kysely/kysely.js";

export const buildEntryRepository = () => {
  const findLatestGrouping = async (): Promise<number | null> => {
    const result = await kysely
      .selectFrom("donnee")
      .select((eb) => eb.fn.max("regroupement").as("grouping"))
      .executeTakeFirstOrThrow();

    return result.grouping;
  };

  const updateAssociatedInventory = async (currentInventoryId: string, newInventoryId: string): Promise<void> => {
    await kysely
      .updateTable("donnee")
      .set({
        inventaireId: Number.parseInt(newInventoryId),
      })
      .where("inventaireId", "=", Number.parseInt(currentInventoryId))
      .execute();
  };

  return {
    findLatestGrouping,
    updateAssociatedInventory,
  };
};
