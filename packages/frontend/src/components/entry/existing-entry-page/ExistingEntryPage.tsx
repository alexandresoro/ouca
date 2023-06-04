import { getEntryNavigationResponse, getEntryResponse } from "@ou-ca/common/api/entry";
import { ChevronLeft, ChevronRight, Plus } from "@styled-icons/boxicons-regular";
import { useEffect, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import useApiQuery from "../../../hooks/api/useApiQuery";
import StyledPanelHeader from "../../layout/StyledPanelHeader";
import EntryForm from "../entry-form/EntryForm";

const ExistingEntryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data, error, isFetching, refetch } = useApiQuery(
    {
      path: `/entries/${id!}`,
      schema: getEntryResponse,
    },
    {
      enabled: false,
    }
  );

  const {
    data: navigation,
    isFetching: isNavigationFetching,
    refetch: refetchNavigation,
  } = useApiQuery(
    {
      path: `/entries/${id!}/navigation`,
      schema: getEntryNavigationResponse,
    },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (id) {
      void refetch();
      void refetchNavigation();
    }
  }, [refetch, refetchNavigation, id]);

  if (isFetching && !data) {
    return (
      <div className="flex justify-center items-center h-56">
        <progress className="progress progress-primary w-56" />
      </div>
    );
  }

  if (error) {
    if (error.status === 404) {
      return <>{t("displayData.dataNotFound")}</>;
    } else {
      return <>{t("displayData.genericError")}</>;
    }
  }

  const hasPrevious = !isNavigationFetching && navigation?.previousEntryId != null;
  const hasNext = !isNavigationFetching && navigation?.nextEntryId != null;

  return (
    <>
      <StyledPanelHeader className="flex justify-between">
        <h1 className="text-2xl font-normal">{t("displayData.headerTitle")}</h1>
        <div className="flex items-center gap-4">
          <span className="badge badge-md badge-accent">
            {t("displayData.dataId")} {data?.id}
          </span>
          <div className="flex gap-2">
            <div className="tooltip tooltip-bottom" data-tip={hasPrevious ? t("displayData.previousData") : undefined}>
              <Link
                className={`btn btn-sm btn-square ${hasPrevious ? "btn-accent" : "btn-disabled"}`}
                to={`../${navigation?.previousEntryId as string}`}
                tabIndex={hasPrevious ? 0 : -1}
                relative="path"
                replace
              >
                <ChevronLeft className="h-6" />
              </Link>
            </div>
            <div className="tooltip tooltip-bottom" data-tip={hasNext ? t("displayData.nextData") : undefined}>
              <Link
                className={`btn btn-sm btn-square ${hasNext ? "btn-accent" : "btn-disabled"}`}
                to={`../${navigation?.nextEntryId as string}`}
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
      {data?.id != null && <EntryForm existingEntryId={data.id} existingInventoryId={data.inventoryId} />}
    </>
  );
};

export default ExistingEntryPage;
