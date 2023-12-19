import { InfoCircle } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useFormState, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../../../components/base/TextInput";
import { type InventoryFormState } from "./InventoryFormState";

type InventoryFormDateProps = Pick<UseFormReturn<InventoryFormState>, "control" | "register">;

const InventoryFormDate: FunctionComponent<InventoryFormDateProps> = ({ register, control }) => {
  const { t } = useTranslation();

  const { errors } = useFormState({
    control,
  });

  return (
    <div className="flex gap-2">
      <TextInput
        {...register("date", {
          setValueAs: (v: string) => (v?.length ? v : null),
        })}
        textInputClassName="flex-grow py-1"
        label={t("inventoryForm.date")}
        type="date"
        required
        hasError={!!errors.date}
      />
      <TextInput
        {...register("time", {
          setValueAs: (v: string) => (v?.length ? v : null),
        })}
        textInputClassName="py-1"
        label={t("inventoryForm.time")}
        type="time"
        hasError={!!errors.time}
      />
      <TextInput
        {...register("duration", {
          setValueAs: (v: string | number | null) => (typeof v !== "string" || v.length ? v : null),
        })}
        textInputClassName="w-24 py-1"
        label={
          <span className="inline-flex items-center gap-1">
            {t("inventoryForm.duration")}{" "}
            <div className="tooltip tooltip-info" data-tip={t("inventoryForm.durationFormatDescription")}>
              <InfoCircle className="h-4" />
            </div>
          </span>
        }
        type="text"
        hasError={!!errors.duration}
      />
    </div>
  );
};

export default InventoryFormDate;
