import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { useApiObserversQuery } from "@services/api/observer/api-observer-queries";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterObserversAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterObservers: FunctionComponent = () => {
  const { t } = useTranslation();

  const [observerInput, setObserverInput] = useState("");
  const [selectedObservers, setSelectedObservers] = useAtom(searchEntriesFilterObserversAtom);
  const { data: dataObservers } = useApiObserversQuery({
    q: observerInput,
    pageSize: 5,
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
