import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { STEPS, type NewEntryStep } from "./new-entry-hash-step-mapper";

type NewEntryPageStepperProps = {
  currentStep: NewEntryStep;
};

const NewEntryPageStepper: FunctionComponent<NewEntryPageStepperProps> = ({ currentStep }) => {
  const { t } = useTranslation();

  return (
    <ul className="steps">
      {STEPS.map((step) => {
        const isCurrentStepComplete = currentStep != null && currentStep?.index > step.index;
        const isStepCurrent = currentStep?.index === step.index;
        return (
          <li
            key={step.id}
            className={`step ${isCurrentStepComplete || isStepCurrent ? "step-primary" : ""}`}
            data-content={isCurrentStepComplete ? "✓" : `${step.index}`}
          >
            <span className="w-40">{t(`newEntry.steps.${step.id}`)}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default NewEntryPageStepper;
