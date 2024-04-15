import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const ImportAgesPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <>
      <h3 className="text-lg font-semibold">{t("importInstructions.shared.columnsList")}</h3>

      <div className="overflow-x-auto">
        <table className="table table-xs table-zebra">
          <thead>
            <tr>
              <th>{t("importInstructions.column.index")}</th>
              <th>{t("importInstructions.column.name")}</th>
              <th>{t("importInstructions.column.description")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>A *</th>
              <td>{t("importInstructions.ages.label.name")}</td>
              <td>{t("importInstructions.ages.label.description")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ImportAgesPanel;
