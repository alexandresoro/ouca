import { Autocomplete, Chip, TextField } from "@mui/material";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import Switch from "../common/styled/Switch";

const DonneeFilter: FunctionComponent = () => {
  const { t } = useTranslation();

  // TODO put real values
  const options = ["Option 1", "Option 2"];

  return (
    <>
      <div className="card border-2 border-primary bg-base-100 shadow-xl">
        <div className="card-body">
          <Autocomplete
            multiple
            id="tags-standard"
            options={options}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField {...params} variant="standard" placeholder={t("observationFilter.searchCriteria")} />
            )}
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => (
                // eslint-disable-next-line react/jsx-key
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
          />
          <Switch label={t("observationFilter.displayOnlyMyObservations")} />
          <button className="btn btn-outline btn-primary mt-2">{t("observationFilter.exportToExcel")}</button>
        </div>
      </div>
    </>
  );
};

export default DonneeFilter;
