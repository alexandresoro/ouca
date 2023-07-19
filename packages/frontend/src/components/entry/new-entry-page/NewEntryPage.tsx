import { useEffect, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";
import StyledPanelHeader from "../../layout/StyledPanelHeader";
import NewEntryFormContainer from "../new-entry-form-container/NewEntryFormContainer";
import NewEntryPageStepper from "./NewEntryPageStepper";
import { getNewEntryStepFromHash, type NewEntryStep } from "./new-entry-hash-step-mapper";

const NewEntryPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { hash } = useLocation();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState<NewEntryStep | undefined>();
  useEffect(() => {
    setCurrentStep(getNewEntryStepFromHash(hash));
  }, [hash]);

  const existingInventoryId = searchParams.get("inventoryId") ?? undefined;

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
