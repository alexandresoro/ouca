import { type Age } from "@ou-ca/common/entities/age";
import { type Department } from "@ou-ca/common/entities/department";
import { type NumberEstimate } from "@ou-ca/common/entities/number-estimate";
import { type Observer } from "@ou-ca/common/entities/observer";
import { type Sex } from "@ou-ca/common/entities/sex";
import { z } from "zod";

export const settingsSchema = z.object({
  id: z.string(),
  defaultObservateurId: z.string().nullable(),
  defaultDepartementId: z.string().nullable(),
  defaultAgeId: z.string().nullable(),
  defaultSexeId: z.string().nullable(),
  defaultEstimationNombreId: z.string().nullable(),
  defaultNombre: z.number().nullable(),
  areAssociesDisplayed: z.boolean(),
  isMeteoDisplayed: z.boolean(),
  isDistanceDisplayed: z.boolean(),
  isRegroupementDisplayed: z.boolean(),
  userId: z.string().uuid(),
});

export type Settings = z.infer<typeof settingsSchema>;

export type SettingsEnriched = Omit<
  Settings,
  "defaultDepartementId" | "defaultObservateurId" | "defaultSexeId" | "defaultAgeId" | "defaultEstimationNombreId"
> & {
  defaultDepartment: Department | null;
  defaultObserver: Observer | null;
  defaultSex: Sex | null;
  defaultAge: Age | null;
  defaultNumberEstimate: NumberEstimate | null;
};

export type UpdateSettingsInput = Partial<{
  defaultObservateurId: number | null;
  defaultDepartementId: number | null;
  defaultAgeId: number | null;
  defaultSexeId: number | null;
  defaultEstimationNombreId: number | null;
  defaultNombre: number | null;
  areAssociesDisplayed: boolean;
  isMeteoDisplayed: boolean;
  isDistanceDisplayed: boolean;
  isRegroupementDisplayed: boolean;
}>;