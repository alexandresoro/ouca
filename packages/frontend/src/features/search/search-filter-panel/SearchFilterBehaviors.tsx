import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { useApiBehaviorsQuery } from "@services/api/behavior/api-behavior-queries";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterBehaviorsAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterBehaviors: FunctionComponent = () => {
  const { t } = useTranslation();

  const [behaviorInput, setBehaviorInput] = useState("");
  const [selectedBehaviors, setSelectedBehaviors] = useAtom(searchEntriesFilterBehaviorsAtom);
  const { data: dataBehaviors } = useApiBehaviorsQuery({
    q: behaviorInput,
    pageSize: 5,
  });

  return (
    <AutocompleteMultiple
      label={t("behaviors")}
      labelClassName="px-0 py-2"
      labelTextClassName="uppercase text-base font-semibold"
      data={dataBehaviors?.data ?? []}
      onInputChange={setBehaviorInput}
      onChange={setSelectedBehaviors}
      values={selectedBehaviors}
      renderValue={({ code, libelle }) => `${code} - ${libelle}`}
    />
  );
};

export default SearchFilterBehaviors;
