import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { useApiTownsQuery } from "@services/api/town/api-town-queries";
import { useAtom, useAtomValue } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterDepartmentsAtom, searchEntriesFilterTownsAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterTowns: FunctionComponent = () => {
  const { t } = useTranslation();

  const selectedDepartments = useAtomValue(searchEntriesFilterDepartmentsAtom);

  const [townInput, setTownInput] = useState("");
  const [selectedTowns, setSelectedTowns] = useAtom(searchEntriesFilterTownsAtom);
  const { data: dataTowns } = useApiTownsQuery({
    q: townInput,
    pageSize: 5,
    departmentId: selectedDepartments[0]?.id,
  });

  return (
    <AutocompleteMultiple
      label={t("towns")}
      labelClassName="px-0 py-2"
      labelTextClassName="uppercase text-base font-semibold"
      data={dataTowns?.data ?? []}
      onInputChange={setTownInput}
      onChange={setSelectedTowns}
      values={selectedTowns}
      renderValue={({ nom }) => `${nom}`}
      inputProps={{
        disabled: selectedDepartments.length > 1,
      }}
    />
  );
};

export default SearchFilterTowns;
