import { type Weather } from "@ou-ca/common/entities/weather";
import { useEffect, useState, type FunctionComponent } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import TextInput from "../../common/styled/TextInput";
import AutocompleteMultiple from "../../common/styled/select/AutocompleteMultiple";
import { AUTOCOMPLETE_WEATHERS_QUERY } from "./InventoryFormQueries";
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

  const [{ data: dataWeathers }] = useQuery({
    query: AUTOCOMPLETE_WEATHERS_QUERY,
    variables: {
      searchParams: {
        q: weathersInput,
        pageSize: 5,
      },
    },
  });

  const dataWeathersReshaped = dataWeathers?.meteos?.data
    ? dataWeathers.meteos.data.map((weather) => {
        return {
          id: `${weather.id}`,
          libelle: weather.libelle,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
        } satisfies Weather;
      })
    : [];

  return (
    <div className="flex gap-2">
      <TextInput
        {...register("temperature", {
          setValueAs: (v: string) => (v?.length ? parseInt(v) : null),
        })}
        textInputClassName="w-24 py-1"
        label={t("inventoryForm.temperature")}
        type="number"
      />
      <AutocompleteMultiple
        ref={refWeathers}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data={dataWeathersReshaped}
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
