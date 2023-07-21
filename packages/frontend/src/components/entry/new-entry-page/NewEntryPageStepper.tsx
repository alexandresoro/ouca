import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { STEPS, type NewEntryStep } from "./new-entry-hash-step-mapper";

type NewEntryPageStepperProps = {
  currentStep: NewEntryStep;
  onSelectedStep?: (selectedStep: NewEntryStep) => void;
};

const NewEntryPageStepper: FunctionComponent<NewEntryPageStepperProps> = ({ currentStep, onSelectedStep }) => {
  const { t } = useTranslation();

  const handleSelectedStep = (selectedStep: NewEntryStep) => {
    if (selectedStep.index < currentStep.index) {
      onSelectedStep?.(selectedStep);
    }
  };

  return (
    <ul className="steps">
      {STEPS.map((step) => {
        const isCurrentStepComplete = currentStep != null && currentStep?.index > step.index;
        const isStepCurrent = currentStep?.index === step.index;
        return (
          <li
            key={step.id}
            className={`step ${isCurrentStepComplete || isStepCurrent ? "step-primary" : ""} ${
              isCurrentStepComplete ? "cursor-pointer" : ""
            }`}
            data-content={isCurrentStepComplete ? "✓" : `${step.index}`}
            onClick={() => handleSelectedStep(step)}
            onKeyUp={() => handleSelectedStep(step)}
          >
            <span className="w-40">{t(`newEntry.steps.${step.id}`)}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default NewEntryPageStepper;
