import { Export, Plus } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StyledPanelHeader from "../../layout/StyledPanelHeader";

type ManageTopBarProps = {
  showButtons?: boolean;
  title: string;
  onClickExport?: () => void;
};

const ManageTopBar: FunctionComponent<ManageTopBarProps> = (props) => {
  const { title, onClickExport, showButtons } = props;

  const { t } = useTranslation();

  return (
    <>
      <StyledPanelHeader className="place-content-between">
        <h1 className="text-2xl font-normal">{title}</h1>
        {showButtons && (
          <div className="flex items-center gap-6">
            <Link className="btn btn-secondary shadow" to="create">
              <Plus className="h-5 mr-1" />
              {t("createAction")}
            </Link>
            <button type="button" className="btn btn-secondary shadow" onClick={onClickExport}>
              <Export className="h-5 mr-2" />
              {t("exportAction")}
            </button>
          </div>
        )}
      </StyledPanelHeader>
    </>
  );
};

ManageTopBar.defaultProps = {
  showButtons: true,
};

export default ManageTopBar;
