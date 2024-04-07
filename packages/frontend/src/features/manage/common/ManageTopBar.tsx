import StyledPanelHeader from "@layouts/StyledPanelHeader";
import { Export, Plus } from "@styled-icons/boxicons-regular";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type ManageTopBarProps = {
  title: string;
  enableCreate?: boolean;
  onClickCreate: () => void;
  onClickExport?: () => void;
};

const ManageTopBar: FunctionComponent<ManageTopBarProps> = (props) => {
  const { title, onClickCreate, onClickExport, enableCreate } = props;

  const { t } = useTranslation();

  return (
    <>
      <StyledPanelHeader className="place-content-between">
        <h1 className="text-2xl font-normal">{title}</h1>
        <div className="flex items-center gap-6">
          {enableCreate && (
            <button type="button" className="btn btn-secondary btn-sm uppercase shadow" onClick={onClickCreate}>
              <Plus className="h-5 mr-1" />
              {t("createAction")}
            </button>
          )}
          <button type="button" className="btn btn-secondary btn-sm uppercase shadow" onClick={onClickExport}>
            <Export className="h-5 mr-2" />
            {t("exportAction")}
          </button>
        </div>
      </StyledPanelHeader>
    </>
  );
};

ManageTopBar.defaultProps = {
  enableCreate: true, // TODO: Clean this up once all components are updated
};

export default ManageTopBar;
