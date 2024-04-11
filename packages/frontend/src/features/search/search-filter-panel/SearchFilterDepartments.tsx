import AutocompleteMultiple from "@components/base/autocomplete/AutocompleteMultiple";
import { getDepartmentsResponse } from "@ou-ca/common/api/department";
import { useApiQuery } from "@services/api/useApiQuery";
import { useAtom } from "jotai";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterDepartmentsAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterDepartments: FunctionComponent = () => {
  const { t } = useTranslation();

  const [departmentInput, setDepartmentInput] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useAtom(searchEntriesFilterDepartmentsAtom);
  const { data: dataDepartments } = useApiQuery("/departments", {
    queryParams: {
      q: departmentInput,
      pageSize: 5,
    },
    schema: getDepartmentsResponse,
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
