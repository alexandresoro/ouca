import { Autocomplete, Button, Card, Chip, FormControlLabel, FormGroup, Switch, TextField } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const DonneeFilter: FunctionComponent = () => {
  const { t } = useTranslation();

  // TODO put real values
  const options = ["Option 1", "Option 2"];

  return (
    <>
      <Card
        sx={{
          padding: 3
        }}
      >
        <FormGroup>
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
          <FormControlLabel control={<Switch />} label={t("observationFilter.displayOnlyMyObservations")} />
          <Button variant="outlined">{t("observationFilter.exportToExcel")}</Button>
        </FormGroup>
      </Card>
    </>
  );
};

export default DonneeFilter;
