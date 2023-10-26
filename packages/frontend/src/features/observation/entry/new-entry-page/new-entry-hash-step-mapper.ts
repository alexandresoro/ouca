export type NewEntryStep = {
  id: string;
  index: number;
};

export const INVENTORY_STEP = Object.freeze({
  id: "inventory",
  index: 1,
}) satisfies NewEntryStep;

export const ENTRY_STEP = Object.freeze({
  id: "entry",
  index: 2,
}) satisfies NewEntryStep;

export const STEPS = [INVENTORY_STEP, ENTRY_STEP] as const;

export const getNewEntryStepFromHash = (hash: string): NewEntryStep => {
  const stepFromHash = STEPS.find((step) => {
    return `#${step.id}` === hash;
  });

  return stepFromHash ?? INVENTORY_STEP;
};
