import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { useApiLocalitiesQuery } from "@services/api/locality/api-locality-queries";
import { useAtom, useAtomValue } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterLocalitiesAtom, searchEntriesFilterTownsAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterLocalities: FunctionComponent = () => {
  const { t } = useTranslation();

  const selectedTowns = useAtomValue(searchEntriesFilterTownsAtom);

  const [localityInput, setLocalityInput] = useState("");
  const [selectedLocalities, setSelectedLocalities] = useAtom(searchEntriesFilterLocalitiesAtom);
  const { data: dataLocalities } = useApiLocalitiesQuery(
    {
      q: localityInput,
      pageSize: 5,
      townId: selectedTowns[0]?.id,
    },
    {},
    {
      paused: selectedTowns.length !== 1,
    },
  );

  return (
    <AutocompleteMultiple
      label={t("localities")}
      labelClassName="px-0 py-2"
      labelTextClassName="uppercase text-base font-semibold"
      data={dataLocalities?.data ?? []}
      onInputChange={setLocalityInput}
      onChange={setSelectedLocalities}
      values={selectedLocalities}
      renderValue={({ nom }) => nom}
      inputProps={{
        disabled: selectedTowns.length !== 1,
      }}
    />
  );
};

export default SearchFilterLocalities;
