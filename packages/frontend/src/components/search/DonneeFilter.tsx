import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import Switch from "../common/styled/Switch";
import AutocompleteMultiple from "../common/styled/select/AutocompleteMultiple";

const DonneeFilter: FunctionComponent = () => {
  const { t } = useTranslation();

  const [displayOnlyOwnObservations, setDisplayOnlyOwnObservations] = useState(true);
  const [values, setValues] = useState<{ id: string }[]>([]);

  // TODO put real values
  const options = ["Option 1", "Option 2"];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t("observationFilter.search")}</h2>
      <Switch
        label={t("observationFilter.displayOnlyMyObservations")}
        checked={displayOnlyOwnObservations}
        onChange={setDisplayOnlyOwnObservations}
      />
      <AutocompleteMultiple
        label={t("observationFilter.search")}
        data={options.map((option) => {
          return { id: option };
        })}
        values={values}
        renderValue={({ id }) => id}
        onChange={setValues}
      />
    </div>
  );
};

export default DonneeFilter;
