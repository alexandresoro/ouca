import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { getAgesResponse } from "@ou-ca/common/api/age";
import useApiQuery from "@services/api/useApiQuery";
import { useAtom } from "jotai";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterAgesAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterAges: FunctionComponent = () => {
  const { t } = useTranslation();

  const [ageInput, setAgeInput] = useState("");
  const [selectedAges, setSelectedAges] = useAtom(searchEntriesFilterAgesAtom);
  const { data: dataAges } = useApiQuery("/ages", {
    queryParams: {
      q: ageInput,
      pageSize: 5,
    },
    schema: getAgesResponse,
  });

  return (
    <AutocompleteMultiple
      label={t("ages")}
      labelClassName="px-0 py-2"
      labelTextClassName="uppercase text-base font-semibold"
      data={dataAges?.data ?? []}
      onInputChange={setAgeInput}
      onChange={setSelectedAges}
      values={selectedAges}
      renderValue={({ libelle }) => libelle}
    />
  );
};

export default SearchFilterAges;
