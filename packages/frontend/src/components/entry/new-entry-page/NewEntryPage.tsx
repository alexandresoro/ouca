import { getInventoriesResponse } from "@ou-ca/common/api/inventory";
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

  const { data: lastInventoryData } = useApiQuery({
    path: "/inventories",
    queryParams: {
      orderBy: "creationDate",
      sortOrder: "desc",
      pageNumber: 1,
      pageSize: 1,
    },
    schema: getInventoriesResponse,
  });

  const hasLastInventory = lastInventoryData?.data?.length != null && lastInventoryData.data.length > 0;

  const existingInventoryId = searchParams.get("inventoryId") ?? undefined;

  const navigateToLastInventory = () => {
    if (lastInventoryData?.data?.[0] != null) {
      navigate(`/inventory/${lastInventoryData.data[0].id}`);
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
        <div
          className="tooltip tooltip-bottom"
          data-tip={hasLastInventory ? t("createPage.goToLastInventoryDescription") : ""}
        >
          <button
            type="button"
            className={`btn btn-sm ${hasLastInventory ? "btn-accent" : "btn-disabled"}`}
            tabIndex={hasLastInventory ? 0 : -1}
            onClick={navigateToLastInventory}
          >
            <ChevronsRight className="h-6" />
            {t("createPage.goToLastInventory")}
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
