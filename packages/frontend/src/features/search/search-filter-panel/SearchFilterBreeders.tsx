import { CERTAIN, type NicheurCode, POSSIBLE, PROBABLE } from "@ou-ca/common/types/nicheur.model";
import { useAtom } from "jotai";
import { type ChangeEventHandler, type FunctionComponent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterBreedersAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterBreeders: FunctionComponent = () => {
  const { t } = useTranslation();

  const breedingStatuses = useMemo(
    () =>
      [
        {
          label: t("breedingStatus.possible"),
          value: POSSIBLE,
        },
        {
          label: t("breedingStatus.probable"),
          value: PROBABLE,
        },
        {
          label: t("breedingStatus.certain"),
          value: CERTAIN,
        },
      ] satisfies { label: string; value: NicheurCode }[],
    [t]
  );

  const [selectedBreeders, setSelectedBreeders] = useAtom(searchEntriesFilterBreedersAtom);

  const handleItemChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { checked, value } = event.target;
    const newSelectedBreeders = checked
      ? [...selectedBreeders, value as NicheurCode]
      : selectedBreeders.filter((v) => v !== value);
    setSelectedBreeders(newSelectedBreeders);
  };

  return (
    <>
      <div className={"label px-0"}>
        <div className={"label-text uppercase text-base font-semibold"}>{t("breeding")}</div>
      </div>
      <div className="flex flex-col gap-3 pb-4">
        {breedingStatuses.map(({ label, value }) => (
          <div key={value} className="flex gap-4">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={selectedBreeders.includes(value)}
              value={value}
              onChange={handleItemChange}
            />
            <span className="cursor-default">{label}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default SearchFilterBreeders;
