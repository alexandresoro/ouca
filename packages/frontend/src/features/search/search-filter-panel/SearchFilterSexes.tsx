import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { useApiSexesQuery } from "@services/api/sex/api-sex-queries";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterSexesAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterSexes: FunctionComponent = () => {
  const { t } = useTranslation();

  const [sexInput, setSexInput] = useState("");
  const [selectedSexes, setSelectedSexes] = useAtom(searchEntriesFilterSexesAtom);
  const { data: dataSexes } = useApiSexesQuery({
    q: sexInput,
    pageSize: 5,
  });

  return (
    <AutocompleteMultiple
      label={t("sexes")}
      labelClassName="px-0 py-2"
      labelTextClassName="uppercase text-base font-semibold"
      data={dataSexes?.data ?? []}
      onInputChange={setSexInput}
      onChange={setSelectedSexes}
      values={selectedSexes}
      renderValue={({ libelle }) => libelle}
    />
  );
};

export default SearchFilterSexes;
