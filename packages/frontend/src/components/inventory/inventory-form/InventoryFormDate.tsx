import { getMinutesFromTime } from "@ou-ca/common/utils/time-format-convert";
import { InfoCircle } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { type UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../common/styled/TextInput";
import { type InventoryFormState } from "./InventoryFormState";

type InventoryFormDateProps = { register: UseFormRegister<InventoryFormState> };

const InventoryFormDate: FunctionComponent<InventoryFormDateProps> = ({ register }) => {
  const { t } = useTranslation();

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
      />
      <TextInput
        {...register("time", {
          setValueAs: (v: string) => (v?.length ? v : null),
        })}
        textInputClassName="py-1"
        label={t("inventoryForm.time")}
        type="time"
      />
      <TextInput
        {...register("duration", {
          setValueAs: (v: string | null) => (v?.length ? getMinutesFromTime(v) : null),
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
      />
    </div>
  );
};

export default InventoryFormDate;
