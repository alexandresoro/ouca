import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const ImportEntriesPanel: FunctionComponent = () => {
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
            {/* INVENTORY */}
            <tr>
              <th>A *</th>
              <td>{t("importInstructions.entries.observer.name")}</td>
              <td>{t("importInstructions.entries.observer.description")}</td>
            </tr>
            <tr>
              <th>B</th>
              <td>{t("importInstructions.entries.associates.name")}</td>
              <td>{t("importInstructions.entries.associates.description")}</td>
            </tr>
            <tr>
              <th>C *</th>
              <td>{t("importInstructions.entries.date.name")}</td>
              <td>{t("importInstructions.entries.date.description")}</td>
            </tr>
            <tr>
              <th>D</th>
              <td>{t("importInstructions.entries.time.name")}</td>
              <td>{t("importInstructions.entries.time.description")}</td>
            </tr>
            <tr>
              <th>E</th>
              <td>{t("importInstructions.entries.duration.name")}</td>
              <td>{t("importInstructions.entries.duration.description")}</td>
            </tr>
            <tr>
              <th>F *</th>
              <td>{t("importInstructions.entries.department.name")}</td>
              <td>{t("importInstructions.entries.department.description")}</td>
            </tr>
            <tr>
              <th>G *</th>
              <td>{t("importInstructions.entries.town.name")}</td>
              <td>{t("importInstructions.entries.town.description")}</td>
            </tr>
            <tr>
              <th>H *</th>
              <td>{t("importInstructions.entries.locality.name")}</td>
              <td>{t("importInstructions.entries.locality.description")}</td>
            </tr>
            <tr>
              <th>I *</th>
              <td>{t("importInstructions.entries.latitude.name")}</td>
              <td>{t("importInstructions.entries.latitude.description")}</td>
            </tr>
            <tr>
              <th>J *</th>
              <td>{t("importInstructions.entries.longitude.name")}</td>
              <td>{t("importInstructions.entries.longitude.description")}</td>
            </tr>
            <tr>
              <th>K *</th>
              <td>{t("importInstructions.entries.altitude.name")}</td>
              <td>{t("importInstructions.entries.altitude.description")}</td>
            </tr>
            <tr>
              <th>L</th>
              <td>{t("importInstructions.entries.temperature.name")}</td>
              <td>{t("importInstructions.entries.temperature.description")}</td>
            </tr>
            <tr>
              <th>M</th>
              <td>{t("importInstructions.entries.weather.name")}</td>
              <td>{t("importInstructions.entries.weather.description")}</td>
            </tr>
            {/* ENTRY */}
            <tr>
              <th>N</th>
              <td>{t("importInstructions.entries.species.name")}</td>
              <td>{t("importInstructions.entries.species.description")}</td>
            </tr>
            <tr>
              <th>O</th>
              <td>{t("importInstructions.entries.count.name")}</td>
              <td>{t("importInstructions.entries.count.description")}</td>
            </tr>
            <tr>
              <th>P *</th>
              <td>{t("importInstructions.entries.countEstimate.name")}</td>
              <td>{t("importInstructions.entries.countEstimate.description")}</td>
            </tr>
            <tr>
              <th>Q *</th>
              <td>{t("importInstructions.entries.sex.name")}</td>
              <td>{t("importInstructions.entries.sex.description")}</td>
            </tr>
            <tr>
              <th>R *</th>
              <td>{t("importInstructions.entries.age.name")}</td>
              <td>{t("importInstructions.entries.age.description")}</td>
            </tr>
            <tr>
              <th>S</th>
              <td>{t("importInstructions.entries.distanceEstimate.name")}</td>
              <td>{t("importInstructions.entries.distanceEstimate.description")}</td>
            </tr>
            <tr>
              <th>T</th>
              <td>{t("importInstructions.entries.distance.name")}</td>
              <td>{t("importInstructions.entries.distance.description")}</td>
            </tr>
            {["U", "V", "W", "X", "Y", "Z"].map((column, index) => {
              return (
                <tr>
                  <th>{column}</th>
                  <td>
                    {t("importInstructions.entries.behavior.name")} {index + 1}
                  </td>
                  <td>{t("importInstructions.entries.behavior.description")}</td>
                </tr>
              );
            })}
            {["AA", "AB", "AC", "AD"].map((column, index) => {
              return (
                <tr>
                  <th>{column}</th>
                  <td>
                    {t("importInstructions.entries.environment.name")} {index + 1}
                  </td>
                  <td>{t("importInstructions.entries.environment.description")}</td>
                </tr>
              );
            })}
            <tr>
              <th>AE</th>
              <td>{t("importInstructions.entries.comments.name")}</td>
              <td>{t("importInstructions.entries.comments.description")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ImportEntriesPanel;
