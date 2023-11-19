import TextInput from "@components/base/TextInput";
import { isValid } from "date-fns";
import { useAtom } from "jotai";
import { type ChangeEventHandler, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterFromDateAtom, searchEntriesFilterToDateAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterDateRange: FunctionComponent = () => {
  const { t } = useTranslation();

  const [fromDate, setFromDate] = useAtom(searchEntriesFilterFromDateAtom);
  const [toDate, setToDate] = useAtom(searchEntriesFilterToDateAtom);

  const onChangeFromDate: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setFromDate(isValid(new Date(value)) ? value : null);
  };

  const onChangeToDate: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setToDate(isValid(new Date(value)) ? value : null);
  };

  return (
    <>
      <div className={"label px-0 pb-0"}>
        <div className={"label-text uppercase text-base font-semibold"}>{t("searchFilter.dateRange")}</div>
      </div>
      <div className="flex gap-2">
        <TextInput
          label={t("searchFilter.startDate")}
          textInputClassName="flex-grow pt-0"
          type="date"
          value={fromDate ?? ""}
          onChange={onChangeFromDate}
          max={toDate ?? undefined}
        />
        <TextInput
          label={t("searchFilter.endDate")}
          textInputClassName="flex-grow pt-0"
          type="date"
          value={toDate ?? ""}
          onChange={onChangeToDate}
          min={fromDate ?? undefined}
        />
      </div>
    </>
  );
};

export default SearchFilterDateRange;
