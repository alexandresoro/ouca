import AutocompleteMultipleWithSelection from "@components/base/autocomplete/AutocompleteMultipleWithSelection";
import { getDepartmentsResponse } from "@ou-ca/common/api/department";
import useApiQuery from "@services/api/useApiQuery";
import { useAtom } from "jotai";
import { useState, type FunctionComponent } from "react";
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
    <AutocompleteMultipleWithSelection
      label={t("departments")}
      data={dataDepartments?.data ?? []}
      onInputChange={setDepartmentInput}
      onChange={setSelectedDepartments}
      values={selectedDepartments}
      renderValue={({ code }) => code}
    />
  );
};

export default SearchFilterDepartments;
