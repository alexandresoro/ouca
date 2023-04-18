import { useState, type FunctionComponent } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import FormAutocomplete from "../../common/form/FormAutocomplete";
import TextInput from "../../common/styled/TextInput";
import { AUTOCOMPLETE_WEATHERS_QUERY } from "./InventoryFormQueries";
import { type UpsertInventoryInput } from "./inventory-form-types";

type InventoryFormLocationProps = Pick<UseFormReturn<UpsertInventoryInput>, "control" | "register">;

const InventoryFormWeather: FunctionComponent<InventoryFormLocationProps> = ({ control, register }) => {
  const { t } = useTranslation();

  const [weathersInput, setWeathersInput] = useState("");

  const [{ data: dataWeathers }] = useQuery({
    query: AUTOCOMPLETE_WEATHERS_QUERY,
    variables: {
      searchParams: {
        q: weathersInput,
        pageSize: 5,
      },
    },
  });

  return (
    <div className="flex gap-2">
      <TextInput
        {...register("temperature", {
          min: -50,
          max: 100,
        })}
        textInputClassName="w-24 py-1"
        label={t("inventoryForm.temperature")}
        type="number"
      />
      <FormAutocomplete
        multiple
        data={dataWeathers?.meteos?.data ?? []}
        name="weathers"
        label={t("inventoryForm.weathers")}
        control={control}
        onInputChange={setWeathersInput}
        renderValue={({ libelle }) => libelle}
        autocompleteClassName="flex-grow"
        labelClassName="py-1"
        labelTextClassName="first-letter:capitalize"
      />
    </div>
  );
};

export default InventoryFormWeather;
