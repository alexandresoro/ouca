import { getEntryLastResponse } from "@ou-ca/common/api/entry";
import { ChevronsRight } from "@styled-icons/boxicons-regular";
import { useEffect, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useApiQuery from "../../../hooks/api/useApiQuery";
import StyledPanelHeader from "../../layout/StyledPanelHeader";
import NewEntryFormContainer from "../new-entry-form-container/NewEntryFormContainer";
import NewEntryPageStepper from "./NewEntryPageStepper";
import { getNewEntryStepFromHash, type NewEntryStep } from "./new-entry-hash-step-mapper";

const NewEntryPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { hash } = useLocation();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState<NewEntryStep | undefined>();
  useEffect(() => {
    setCurrentStep(getNewEntryStepFromHash(hash));
  }, [hash]);

  const { data } = useApiQuery({ path: "/entries/last", schema: getEntryLastResponse });

  const hasLastDonnee = data?.id != null;

  const existingInventoryId = searchParams.get("inventoryId") ?? undefined;

  const navigateToLastDonnee = () => {
    if (data?.id != null) {
      navigate(`/entry/${data.id}`, { replace: true });
    }
  };

  const handleSelectedPreviousStep = (selectedStep: NewEntryStep) => {
    window.location.hash = `#${selectedStep.id}`;
  };

  return (
    <>
      <StyledPanelHeader className="flex justify-between">
        <div className="indicator pr-2">
          <span className="indicator-item badge badge-xs badge-primary" />
          <h1 className="flex items-center gap-3 text-2xl font-normal">{t("createPage.newEntryTitle")}</h1>
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
      {currentStep != null && (
        <>
          <NewEntryPageStepper currentStep={currentStep} onSelectedStep={handleSelectedPreviousStep} />
          <NewEntryFormContainer currentStep={currentStep} existingInventoryId={existingInventoryId} />
        </>
      )}
    </>
  );
};

export default NewEntryPage;
