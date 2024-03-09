import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { getObserversResponse } from "@ou-ca/common/api/observer";
import useApiQuery from "@services/api/useApiQuery";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterObserversAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterObservers: FunctionComponent = () => {
  const { t } = useTranslation();

  const [observerInput, setObserverInput] = useState("");
  const [selectedObservers, setSelectedObservers] = useAtom(searchEntriesFilterObserversAtom);
  const { data: dataObservers } = useApiQuery("/observers", {
    queryParams: {
      q: observerInput,
      pageSize: 5,
    },
    schema: getObserversResponse,
  });

  return (
    <AutocompleteMultiple
      label={t("observers")}
      labelClassName="px-0 py-2"
      labelTextClassName="uppercase text-base font-semibold"
      data={dataObservers?.data ?? []}
      onInputChange={setObserverInput}
      onChange={setSelectedObservers}
      values={selectedObservers}
      renderValue={({ libelle }) => libelle}
    />
  );
};

export default SearchFilterObservers;
