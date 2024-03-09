import type { Weather } from "@ou-ca/common/api/entities/weather";
import { getWeathersResponse } from "@ou-ca/common/api/weather";
import { type FunctionComponent, useEffect, useState } from "react";
import { type UseFormReturn, useController, useFormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../../../components/base/TextInput";
import AutocompleteMultiple from "../../../../components/base/autocomplete/AutocompleteMultiple";
import useApiQuery from "../../../../hooks/api/useApiQuery";
import type { InventoryFormState } from "./InventoryFormState";

type InventoryFormWeatherProps = Pick<UseFormReturn<InventoryFormState>, "control" | "register"> & {
  defaultWeathers?: Weather[];
};

const InventoryFormWeather: FunctionComponent<InventoryFormWeatherProps> = ({ control, register, defaultWeathers }) => {
  const { t } = useTranslation();

  const [weathersInput, setWeathersInput] = useState("");
  const [selectedWeathers, setSelectedWeathers] = useState<Weather[]>(defaultWeathers ?? []);

  const {
    field: { ref: refWeathers, onChange: onChangeWeathersForm, onBlur: onBlurWeathersForm },
    fieldState: { error: errorWeatherId },
  } = useController({
    name: "weatherIds",
    control,
  });

  const { errors } = useFormState({
    control,
  });

  useEffect(() => {
    onChangeWeathersForm(selectedWeathers?.map((weather) => weather.id) ?? []);
  }, [selectedWeathers, onChangeWeathersForm]);

  const { data: dataWeathers } = useApiQuery(
    {
      path: "/weathers",
      queryParams: {
        q: weathersInput,
        pageSize: 5,
      },
      schema: getWeathersResponse,
    },
    {
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: "always",
    },
  );

  return (
    <div className="flex gap-2">
      <TextInput
        {...register("temperature", {
          setValueAs: (v: string) => (v?.length ? Number.parseInt(v) : typeof v === "number" ? v : null),
        })}
        textInputClassName="w-24 py-1"
        label={t("inventoryForm.temperature")}
        type="number"
        hasError={!!errors.temperature}
      />
      <AutocompleteMultiple
        ref={refWeathers}
        data={dataWeathers?.data ?? []}
        name="weathers"
        label={t("inventoryForm.weathers")}
        onInputChange={setWeathersInput}
        onChange={setSelectedWeathers}
        onBlur={onBlurWeathersForm}
        values={selectedWeathers}
        hasError={!!errorWeatherId}
        renderValue={({ libelle }) => libelle}
        autocompleteClassName="flex-grow"
        labelTextClassName="first-letter:capitalize"
      />
    </div>
  );
};

export default InventoryFormWeather;
