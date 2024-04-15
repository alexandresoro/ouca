import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const ImportLocalitiesPanel: FunctionComponent = () => {
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
              <td>{t("importInstructions.localities.department.name")}</td>
              <td>{t("importInstructions.localities.department.description")}</td>
            </tr>
            <tr>
              <th>B *</th>
              <td>{t("importInstructions.localities.town.name")}</td>
              <td>{t("importInstructions.localities.town.description")}</td>
            </tr>
            <tr>
              <th>C *</th>
              <td>{t("importInstructions.localities.name.name")}</td>
              <td>{t("importInstructions.localities.name.description")}</td>
            </tr>
            <tr>
              <th>D *</th>
              <td>{t("importInstructions.localities.latitude.name")}</td>
              <td>{t("importInstructions.localities.latitude.description")}</td>
            </tr>
            <tr>
              <th>E *</th>
              <td>{t("importInstructions.localities.longitude.name")}</td>
              <td>{t("importInstructions.localities.longitude.description")}</td>
            </tr>
            <tr>
              <th>F *</th>
              <td>{t("importInstructions.localities.altitude.name")}</td>
              <td>{t("importInstructions.localities.altitude.description")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ImportLocalitiesPanel;
