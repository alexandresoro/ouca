import { getInventoriesResponse } from "@ou-ca/common/api/inventory";
import { useEffect, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import useApiFetch from "../../../hooks/api/useApiFetch";

const LastInventory: FunctionComponent = () => {
  const { t } = useTranslation();

  const fetchLastInventory = useApiFetch({
    schema: getInventoriesResponse,
  });

  const [inventoryId, setInventoryId] = useState<string | null | undefined>();

  useEffect(() => {
    void fetchLastInventory({
      path: "/inventories",
      queryParams: {
        orderBy: "creationDate",
        sortOrder: "desc",
        pageNumber: 1,
        pageSize: 1,
      },
    }).then((data) => {
      if (data?.data.length === 0) {
        setInventoryId(null);
      } else {
        setInventoryId(data?.data?.[0].id);
      }
    });
  }, [fetchLastInventory]);

  if (inventoryId === null) {
    return <>{t("noInventoryExists")}</>;
  }

  return <>{inventoryId && <Navigate to={`/inventory/${inventoryId}`} replace={true} />}</>;
};

export default LastInventory;
