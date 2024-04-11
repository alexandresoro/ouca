import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { getEnvironmentsResponse } from "@ou-ca/common/api/environment";
import { useApiQuery } from "@services/api/useApiQuery";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterEnvironmentsAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterEnvironments: FunctionComponent = () => {
  const { t } = useTranslation();

  const [environmentInput, setEnvironmentInput] = useState("");
  const [selectedEnvironments, setSelectedEnvironments] = useAtom(searchEntriesFilterEnvironmentsAtom);
  const { data: dataEnvironments } = useApiQuery("/environments", {
    queryParams: {
      q: environmentInput,
      pageSize: 5,
    },
    schema: getEnvironmentsResponse,
  });

  return (
    <AutocompleteMultiple
      label={t("environments")}
      labelClassName="px-0 py-2"
      labelTextClassName="uppercase text-base font-semibold"
      data={dataEnvironments?.data ?? []}
      onInputChange={setEnvironmentInput}
      onChange={setSelectedEnvironments}
      values={selectedEnvironments}
      renderValue={({ code, libelle }) => `${code} - ${libelle}`}
    />
  );
};

export default SearchFilterEnvironments;
