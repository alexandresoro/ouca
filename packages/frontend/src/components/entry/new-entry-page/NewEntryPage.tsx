import { useEffect, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import StyledPanelHeader from "../../layout/StyledPanelHeader";
import NewEntryFormContainer from "../new-entry-form-container/NewEntryFormContainer";
import NewEntryPageStepper from "./NewEntryPageStepper";
import { getNewEntryStepFromHash, type NewEntryStep } from "./new-entry-hash-step-mapper";

const NewEntryPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { hash } = useLocation();

  const [currentStep, setCurrentStep] = useState<NewEntryStep | undefined>();
  useEffect(() => {
    setCurrentStep(getNewEntryStepFromHash(hash));
  }, [hash]);

  return (
    <>
      <StyledPanelHeader className="flex justify-between h-20 md:h-20">
        <div className="indicator pr-2">
          <span className="indicator-item badge badge-xs badge-primary" />
          <h1 className="flex items-center gap-3 text-2xl font-normal">{t("createPage.newEntryTitle")}</h1>
        </div>
        {currentStep != null && (
          <div className="flex justify-center">
            <NewEntryPageStepper currentStep={currentStep} />
          </div>
        )}
      </StyledPanelHeader>
      {currentStep != null && <NewEntryFormContainer currentStep={currentStep} />}
    </>
  );
};

export default NewEntryPage;
