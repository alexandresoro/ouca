import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { getSexesResponse } from "@ou-ca/common/api/sex";
import { useApiQuery } from "@services/api/useApiQuery";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterSexesAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterSexes: FunctionComponent = () => {
  const { t } = useTranslation();

  const [sexInput, setSexInput] = useState("");
  const [selectedSexes, setSelectedSexes] = useAtom(searchEntriesFilterSexesAtom);
  const { data: dataSexes } = useApiQuery("/sexes", {
    queryParams: {
      q: sexInput,
      pageSize: 5,
    },
    schema: getSexesResponse,
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
