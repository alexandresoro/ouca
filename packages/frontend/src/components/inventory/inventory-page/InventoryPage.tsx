import { getInventoryResponse } from "@ou-ca/common/api/inventory";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import useApiQuery from "../../../hooks/api/useApiQuery";
import InventoryPageEntriesPanel from "../inventory-page-entries-panel/InventoryPageEntriesPanel";
import InventoryPagePanel from "../inventory-page-panel/InventoryPagePanel";

const InventoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const {
    data: inventory,
    error,
    isFetching,
  } = useApiQuery(
    {
      path: `/inventories/${id!}`,
      schema: getInventoryResponse,
    },
    {
      enabled: id != null,
    }
  );

  if (isFetching && !inventory) {
    return (
      <div className="flex justify-center items-center h-56">
        <progress className="progress progress-primary w-56" />
      </div>
    );
  }

  if (error) {
    if (error.status === 404) {
      return <>{t("inventoryPage.inventoryNotFound")}</>;
    } else {
      return <>{t("inventoryPage.genericError")}</>;
    }
  }

  return (
    <div className="container mx-auto flex gap-10 mt-6">
      <div className="basis-1/3">{inventory && <InventoryPagePanel inventory={inventory} />}</div>
      <div className="basis-2/3">{id && <InventoryPageEntriesPanel inventoryId={id} />}</div>
    </div>
  );
};

export default InventoryPage;
