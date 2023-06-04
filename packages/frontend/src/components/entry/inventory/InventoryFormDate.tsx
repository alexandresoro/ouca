import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type FunctionComponent } from "react";
import { type UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../common/styled/TextInput";

type InventoryFormDateProps = { register: UseFormRegister<UpsertInventoryInput> };

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
          setValueAs: (v: string) => (v?.length ? v : null),
        })}
        textInputClassName="w-24 py-1"
        label={t("inventoryForm.duration")}
        type="text"
      />
    </div>
  );
};

export default InventoryFormDate;
