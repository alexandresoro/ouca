import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import AutocompleteMultiple from "../common/styled/select/AutocompleteMultiple";
import Switch from "../common/styled/Switch";

const DonneeFilter: FunctionComponent = () => {
  const { t } = useTranslation();

  const [values, setValues] = useState<{ id: string }[]>([]);

  // TODO put real values
  const options = ["Option 1", "Option 2"];

  return (
    <>
      <div className="card border-2 border-primary bg-base-100 shadow-xl">
        <div className="card-body">
          <AutocompleteMultiple
            label={t("observationFilter.searchCriteria")}
            data={options.map((option) => {
              return { id: option };
            })}
            values={values}
            renderValue={({ id }) => id}
            onChange={setValues}
          />
          <Switch label={t("observationFilter.displayOnlyMyObservations")} />
          <button className="btn btn-outline btn-primary mt-2">{t("observationFilter.exportToExcel")}</button>
        </div>
      </div>
    </>
  );
};

export default DonneeFilter;
