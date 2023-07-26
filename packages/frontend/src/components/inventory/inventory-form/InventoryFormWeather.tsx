import { getWeathersResponse } from "@ou-ca/common/api/weather";
import { type Weather } from "@ou-ca/common/entities/weather";
import { useEffect, useState, type FunctionComponent } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import TextInput from "../../common/styled/TextInput";
import AutocompleteMultiple from "../../common/styled/select/AutocompleteMultiple";
import { type InventoryFormState } from "./InventoryFormState";

type InventoryFormWeatherProps = Pick<UseFormReturn<InventoryFormState>, "control" | "register">;

const InventoryFormWeather: FunctionComponent<InventoryFormWeatherProps> = ({ control, register }) => {
  const { t } = useTranslation();

  const [weathersInput, setWeathersInput] = useState("");
  const [selectedWeathers, setSelectedWeathers] = useState<Weather[]>([]);

  const {
    field: { ref: refWeathers, onChange: onChangeWeathersForm },
  } = useController({
    name: "weatherIds",
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
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  return (
    <div className="flex gap-2">
      <TextInput
        {...register("temperature", {
          setValueAs: (v: string) => (v?.length ? parseInt(v) : typeof v === "number" ? v : null),
        })}
        textInputClassName="w-24 py-1"
        label={t("inventoryForm.temperature")}
        type="number"
      />
      <AutocompleteMultiple
        ref={refWeathers}
        data={dataWeathers?.data ?? []}
        name="weathers"
        label={t("inventoryForm.weathers")}
        onInputChange={setWeathersInput}
        onChange={setSelectedWeathers}
        values={selectedWeathers}
        renderValue={({ libelle }) => libelle}
        autocompleteClassName="flex-grow"
        labelTextClassName="first-letter:capitalize"
      />
    </div>
  );
};

export default InventoryFormWeather;
