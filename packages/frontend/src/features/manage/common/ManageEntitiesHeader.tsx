import { type ComponentPropsWithoutRef, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type ManageEntitiesHeaderProps = ComponentPropsWithoutRef<"input"> & {
  count?: number | undefined;
};

const ManageEntitiesHeader: FunctionComponent<ManageEntitiesHeaderProps> = ({ count, ...inputProps }) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <div className="form-control mb-8">
        <label className="label">
          <span className="label-text text-primary">{t("filter.label")}</span>
        </label>
        <input
          className="input input-bordered input-primary w-[40ch]"
          placeholder={t("filter.placeholder")}
          {...inputProps}
        />
      </div>
      {count != null && (
        <span className="text-sm font-semibold uppercase text-base-content">{t("filter.resultsCount", { count })}</span>
      )}
    </div>
  );
};

export default ManageEntitiesHeader;
