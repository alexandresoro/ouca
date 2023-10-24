import { getSpeciesPaginatedResponse } from "@ou-ca/common/api/species";
import { useAtom } from "jotai";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterSpeciesAtom } from "../../../atoms/searchEntriesCriteriaAtom";
import useSWRApiQuery from "../../../hooks/api/useSWRApiQuery";
import useAppContext from "../../../hooks/useAppContext";
import Switch from "../../common/styled/Switch";
import AutocompleteMultipleWithSelection from "../../common/styled/select/AutocompleteMultipleWithSelection";

const SearchFilterPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  const { features } = useAppContext();

  const [displayOnlyOwnObservations, setDisplayOnlyOwnObservations] = useState(
    features.tmp_only_own_observations_filter
  );

  const [speciesInput, setSpeciesInput] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useAtom(searchEntriesFilterSpeciesAtom);
  const { data: dataSpecies } = useSWRApiQuery("/species", {
    queryParams: {
      q: speciesInput,
      pageSize: 5,
    },
    schema: getSpeciesPaginatedResponse,
  });

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
      <AutocompleteMultipleWithSelection
        label={t("species")}
        data={dataSpecies?.data ?? []}
        onInputChange={setSpeciesInput}
        onChange={setSelectedSpecies}
        values={selectedSpecies}
        renderValue={({ nomFrancais }) => nomFrancais}
      />
    </div>
  );
};

export default SearchFilterPanel;
