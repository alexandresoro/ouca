import AutocompleteMultipleWithSelection from "@components/base/autocomplete/AutocompleteMultipleWithSelection";
import useSWRApiQuery from "@hooks/api/useSWRApiQuery";
import { getBehaviorsResponse } from "@ou-ca/common/api/behavior";
import { useAtom } from "jotai";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterBehaviorsAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterBehaviors: FunctionComponent = () => {
  const { t } = useTranslation();

  const [behaviorInput, setBehaviorInput] = useState("");
  const [selectedBehaviors, setSelectedBehaviors] = useAtom(searchEntriesFilterBehaviorsAtom);
  const { data: dataBehaviors } = useSWRApiQuery("/behaviors", {
    queryParams: {
      q: behaviorInput,
      pageSize: 5,
    },
    schema: getBehaviorsResponse,
  });

  return (
    <AutocompleteMultipleWithSelection
      label={t("behaviors")}
      data={dataBehaviors?.data ?? []}
      onInputChange={setBehaviorInput}
      onChange={setSelectedBehaviors}
      values={selectedBehaviors}
      renderValue={({ code, libelle }) => `${code} - ${libelle}`}
    />
  );
};

export default SearchFilterBehaviors;
