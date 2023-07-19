import { getEntryResponse } from "@ou-ca/common/api/entry";
import { useEffect, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
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

  useEffect(() => {
    if (id) {
      void refetch();
    }
  }, [refetch, id]);

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

  return (
    <>
      <StyledPanelHeader className="flex justify-between">
        <h1 className="text-2xl font-normal">{t("displayData.headerTitle")}</h1>
        <div className="flex items-center gap-4">
          <span className="badge badge-md badge-accent">
            {t("displayData.dataId")} {data?.id}
          </span>
        </div>
      </StyledPanelHeader>
      {data?.id != null && <EntryForm existingEntryId={data.id} existingInventoryId={data.inventoryId} />}
    </>
  );
};

export default ExistingEntryPage;
