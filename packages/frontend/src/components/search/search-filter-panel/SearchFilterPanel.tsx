import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useAppContext from "../../../hooks/useAppContext";
import Switch from "../../common/styled/Switch";
import AutocompleteMultiple from "../../common/styled/select/AutocompleteMultiple";

const SearchFilterPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  const { features } = useAppContext();

  const [displayOnlyOwnObservations, setDisplayOnlyOwnObservations] = useState(
    features.tmp_only_own_observations_filter
  );
  const [values, setValues] = useState<{ id: string }[]>([]);

  // TODO put real values
  const options = ["Option 1", "Option 2"];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t("observationFilter.search")}</h2>
      {features.tmp_only_own_observations_filter && (
        <Switch
          label={t("observationFilter.displayOnlyMyObservations")}
          checked={displayOnlyOwnObservations}
          onChange={setDisplayOnlyOwnObservations}
        />
      )}
      <AutocompleteMultiple
        label={t("species")}
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

export default SearchFilterPanel;
