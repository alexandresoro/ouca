import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const ImportSpeciesEstimatesPanel: FunctionComponent = () => {
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
              <td>{t("importInstructions.species.class.name")}</td>
              <td>{t("importInstructions.species.class.description")}</td>
            </tr>
            <tr>
              <th>B *</th>
              <td>{t("importInstructions.species.code.name")}</td>
              <td>{t("importInstructions.species.code.description")}</td>
            </tr>
            <tr>
              <th>C *</th>
              <td>{t("importInstructions.species.name.name")}</td>
              <td>{t("importInstructions.species.name.description")}</td>
            </tr>
            <tr>
              <th>D *</th>
              <td>{t("importInstructions.species.scientificName.name")}</td>
              <td>{t("importInstructions.species.scientificName.description")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ImportSpeciesEstimatesPanel;
