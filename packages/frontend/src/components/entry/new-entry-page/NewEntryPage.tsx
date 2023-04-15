import { ChevronsRight } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useClient, useQuery } from "urql";
import StyledPanelHeader from "../../layout/StyledPanelHeader";
import EntryForm from "../entry-form/EntryForm";
import { GET_LAST_DONNEE_ID } from "./NewEntryPageQueries";

const NewEntryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [{ data }] = useQuery({
    query: GET_LAST_DONNEE_ID,
  });
  const client = useClient();

  const hasLastDonnee = data?.lastDonneeId != null;

  const existingInventoryId = searchParams.has("inventoryId")
    ? Number.parseInt(searchParams.get("inventoryId")!)
    : undefined;

  const navigateToLastDonnee = async (): Promise<void> => {
    const { data } = await client.query(GET_LAST_DONNEE_ID, {}, { requestPolicy: "network-only" }).toPromise();
    if (data?.lastDonneeId != null) {
      navigate(`/entry/${data.lastDonneeId}`, { replace: true });
    }
  };

  return (
    <>
      <StyledPanelHeader className="flex justify-between">
        <div className="indicator pr-5">
          <span className="indicator-item badge badge-xs badge-secondary">{t("createPage.newBadge")}</span>
          <h1 className="flex items-center gap-3 text-2xl font-normal">{t("createPage.headerTitle")}</h1>
        </div>
        <div className="tooltip tooltip-bottom" data-tip={hasLastDonnee ? t("createPage.goToLastDataDescription") : ""}>
          <button
            className={`btn btn-sm ${hasLastDonnee ? "btn-accent" : "btn-disabled"}`}
            tabIndex={hasLastDonnee ? 0 : -1}
            onClick={navigateToLastDonnee}
          >
            <ChevronsRight className="h-6" />
            {t("createPage.goToLastData")}
          </button>
        </div>
      </StyledPanelHeader>
      <EntryForm isNewEntry existingInventoryId={existingInventoryId} />
    </>
  );
};

export default NewEntryPage;
