import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { useApiAgesQuery } from "@services/api/age/api-age-queries";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterAgesAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterAges: FunctionComponent = () => {
  const { t } = useTranslation();

  const [ageInput, setAgeInput] = useState("");
  const [selectedAges, setSelectedAges] = useAtom(searchEntriesFilterAgesAtom);
  const { data: dataAges } = useApiAgesQuery({
    q: ageInput,
    pageSize: 5,
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
