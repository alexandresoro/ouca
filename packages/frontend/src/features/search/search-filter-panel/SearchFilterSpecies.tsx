import AutocompleteMultipleWithSelection from "@components/base/autocomplete/AutocompleteMultipleWithSelection";
import { getSpeciesPaginatedResponse } from "@ou-ca/common/api/species";
import useApiQuery from "@services/api/useApiQuery";
import { useAtom } from "jotai";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterSpeciesAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterSpecies: FunctionComponent = () => {
  const { t } = useTranslation();

  const [speciesInput, setSpeciesInput] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useAtom(searchEntriesFilterSpeciesAtom);
  const { data: dataSpecies } = useApiQuery("/species", {
    queryParams: {
      q: speciesInput,
      pageSize: 5,
    },
    schema: getSpeciesPaginatedResponse,
  });

  return (
    <AutocompleteMultipleWithSelection
      label={t("species")}
      data={dataSpecies?.data ?? []}
      onInputChange={setSpeciesInput}
      onChange={setSelectedSpecies}
      values={selectedSpecies}
      renderValue={({ nomFrancais }) => nomFrancais}
    />
  );
};

export default SearchFilterSpecies;
