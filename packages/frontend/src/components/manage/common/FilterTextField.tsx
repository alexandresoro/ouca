import { type ComponentPropsWithoutRef, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const FilterTextField: FunctionComponent<ComponentPropsWithoutRef<"input">> = (props) => {
  const { t } = useTranslation();

  return (
    <div className="form-control mb-8">
      <label className="label">
        <span className="label-text text-primary">{t("filter.label")}</span>
      </label>
      <input className="input input-bordered input-primary w-[40ch]" placeholder={t("filter.placeholder")} {...props} />
    </div>
  );
};

export default FilterTextField;
