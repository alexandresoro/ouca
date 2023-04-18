import { type FunctionComponent } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../common/styled/TextInput";
import { type UpsertInventoryInput } from "./inventory-form-types";

type InventoryFormDateProps = Pick<UseFormReturn<UpsertInventoryInput>, "register">;

const InventoryFormDate: FunctionComponent<InventoryFormDateProps> = ({ register }) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <TextInput
        {...register("date", {
          required: true,
          min: "1990-01-01",
          max: "9999-12-31",
        })}
        textInputClassName="flex-grow py-1"
        label={t("inventoryForm.date")}
        type="date"
        required
      />
      <TextInput
        {...register("time", {
          validate: {
            time: (v) => !v || /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/.test(v),
          },
        })}
        textInputClassName="py-1"
        label={t("inventoryForm.time")}
        type="time"
      />
      <TextInput
        {...register("duration", {
          pattern: /^[0-9]{1,2}:[0-5][0-9]/,
        })}
        textInputClassName="w-24 py-1"
        label={t("inventoryForm.duration")}
        type="text"
      />
    </div>
  );
};

export default InventoryFormDate;
