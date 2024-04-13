import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { useApiDepartmentsQuery } from "@services/api/department/api-department-queries";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterDepartmentsAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterDepartments: FunctionComponent = () => {
  const { t } = useTranslation();

  const [departmentInput, setDepartmentInput] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useAtom(searchEntriesFilterDepartmentsAtom);
  const { data: dataDepartments } = useApiDepartmentsQuery({
    q: departmentInput,
    pageSize: 5,
  });

  return (
    <AutocompleteMultiple
      label={t("departments")}
      labelClassName="px-0 py-2"
      labelTextClassName="uppercase text-base font-semibold"
      data={dataDepartments?.data ?? []}
      onInputChange={setDepartmentInput}
      onChange={setSelectedDepartments}
      values={selectedDepartments}
      renderValue={({ code }) => code}
    />
  );
};

export default SearchFilterDepartments;
