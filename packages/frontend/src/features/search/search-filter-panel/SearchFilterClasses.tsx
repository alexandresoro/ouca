import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { useApiSpeciesClassesQuery } from "@services/api/species-class/api-species-class-queries";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterClassesAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterClasses: FunctionComponent = () => {
  const { t } = useTranslation();

  const [classInput, setClassInput] = useState("");
  const [selectedClasses, setSelectedClasses] = useAtom(searchEntriesFilterClassesAtom);
  const { data: dataClasses } = useApiSpeciesClassesQuery({
    q: classInput,
    pageSize: 5,
  });

  return (
    <AutocompleteMultiple
      label={t("speciesClasses")}
      labelClassName="px-0 py-2"
      labelTextClassName="uppercase text-base font-semibold"
      data={dataClasses?.data ?? []}
      onInputChange={setClassInput}
      onChange={setSelectedClasses}
      values={selectedClasses}
      renderValue={({ libelle }) => libelle}
    />
  );
};

export default SearchFilterClasses;
