import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { useApiSpeciesQueryAll } from "@services/api/species/api-species-queries";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterSpeciesAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterSpecies: FunctionComponent = () => {
  const { t } = useTranslation();

  const [speciesInput, setSpeciesInput] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useAtom(searchEntriesFilterSpeciesAtom);
  const { data: dataSpecies } = useApiSpeciesQueryAll({
    q: speciesInput,
    pageSize: 5,
  });

  return (
    <AutocompleteMultiple
      label={t("species")}
      labelClassName="px-0 py-2"
      labelTextClassName="uppercase text-base font-semibold"
      data={dataSpecies?.data ?? []}
      onInputChange={setSpeciesInput}
      onChange={setSelectedSpecies}
      values={selectedSpecies}
      renderValue={({ nomFrancais }) => nomFrancais}
    />
  );
};

export default SearchFilterSpecies;
