import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { getClassesResponse } from "@ou-ca/common/api/species-class";
import useApiQuery from "@services/api/useApiQuery";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterClassesAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterClasses: FunctionComponent = () => {
  const { t } = useTranslation();

  const [classInput, setClassInput] = useState("");
  const [selectedClasses, setSelectedClasses] = useAtom(searchEntriesFilterClassesAtom);
  const { data: dataClasses } = useApiQuery("/classes", {
    queryParams: {
      q: classInput,
      pageSize: 5,
    },
    schema: getClassesResponse,
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
