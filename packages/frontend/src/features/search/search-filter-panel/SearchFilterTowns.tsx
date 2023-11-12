import AutocompleteMultipleWithSelection from "@components/base/autocomplete/AutocompleteMultipleWithSelection";
import { getTownsResponse } from "@ou-ca/common/api/town";
import useApiQuery from "@services/api/useApiQuery";
import { useAtom } from "jotai";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterTownsAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterTowns: FunctionComponent = () => {
  const { t } = useTranslation();

  const [townInput, setTownInput] = useState("");
  const [selectedTowns, setSelectedTowns] = useAtom(searchEntriesFilterTownsAtom);
  const { data: dataTowns } = useApiQuery("/towns", {
    queryParams: {
      q: townInput,
      pageSize: 5,
    },
    schema: getTownsResponse,
  });

  return (
    <AutocompleteMultipleWithSelection
      label={t("towns")}
      data={dataTowns?.data ?? []}
      onInputChange={setTownInput}
      onChange={setSelectedTowns}
      values={selectedTowns}
      renderValue={({ nom }) => `${nom}`}
    />
  );
};

export default SearchFilterTowns;
