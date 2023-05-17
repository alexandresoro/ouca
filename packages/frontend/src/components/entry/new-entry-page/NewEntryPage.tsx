import { getEntryLastResponse } from "@ou-ca/common/api/entry";
import { ChevronsRight } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import useApiQuery from "../../../hooks/api/useApiQuery";
import StyledPanelHeader from "../../layout/StyledPanelHeader";
import EntryForm from "../entry-form/EntryForm";

const NewEntryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data } = useApiQuery({ path: "/entries/last", schema: getEntryLastResponse });

  const hasLastDonnee = data?.id != null;

  const existingInventoryId = searchParams.has("inventoryId")
    ? Number.parseInt(searchParams.get("inventoryId")!)
    : undefined;

  const navigateToLastDonnee = () => {
    if (data?.id != null) {
      navigate(`/entry/${data.id}`, { replace: true });
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
            type="button"
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
