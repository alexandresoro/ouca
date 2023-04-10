import { ChevronLeft, ChevronRight, Plus } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "urql";
import StyledPanelHeader from "../../layout/StyledPanelHeader";
import DataForm from "../DataForm";
import { DONNEE_QUERY } from "./DisplayDataPageQueries";

const DisplayDataPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const [{ data, error, fetching }] = useQuery({
    query: DONNEE_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(id!),
    },
    pause: id == null,
  });

  if (fetching && !data) {
    return (
      <div className="flex justify-center items-center h-56">
        <progress className="progress progress-primary w-56"></progress>
      </div>
    );
  }

  if (error) {
    return <>{t("displayData.genericError")}</>;
  }

  if (data && !data.donnee?.donnee) {
    return <>{t("displayData.dataNotFound")}</>;
  }

  const hasPrevious = data?.donnee?.navigation?.previousDonneeId;
  const hasNext = data?.donnee?.navigation?.nextDonneeId;

  return (
    <>
      <StyledPanelHeader className="flex justify-between">
        <h1 className="text-2xl font-normal">{t("displayData.headerTitle")}</h1>
        <div className="flex items-center gap-4">
          <span className="badge badge-md">
            {t("displayData.dataId")} {data?.donnee?.id}
          </span>
          <div className="flex gap-2">
            <div className="tooltip tooltip-bottom" data-tip={hasPrevious ? t("displayData.previousData") : ""}>
              <Link
                className={`btn btn-sm btn-outline btn-square ${hasPrevious ? "btn-secondary" : "btn-disabled"}`}
                to={`../${data?.donnee?.navigation?.previousDonneeId as number}`}
                tabIndex={hasPrevious ? 0 : -1}
                relative="path"
                replace
              >
                <ChevronLeft className="h-6" />
              </Link>
            </div>
            <div className="tooltip tooltip-bottom" data-tip={hasNext ? t("displayData.nextData") : ""}>
              <Link
                className={`btn btn-sm btn-outline btn-square ${hasNext ? "btn-secondary" : "btn-disabled"}`}
                to={`../${data?.donnee?.navigation?.nextDonneeId as number}`}
                tabIndex={hasNext ? 0 : -1}
                relative="path"
                replace
              >
                <ChevronRight className="h-6" />
              </Link>
            </div>
          </div>
          <div className="tooltip tooltip-bottom" data-tip={t("displayData.newData")}>
            <Link className="btn btn-circle btn-secondary" to="/create/new" replace>
              <Plus className="h-6" />
            </Link>
          </div>
        </div>
      </StyledPanelHeader>
      {JSON.stringify(data)}
      {data?.donnee?.donnee && <DataForm />}
    </>
  );
};

export default DisplayDataPage;
