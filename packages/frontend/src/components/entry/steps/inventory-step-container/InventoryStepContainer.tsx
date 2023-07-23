import { getInventoryResponse, type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { useEffect, type FunctionComponent } from "react";
import { useSearchParams } from "react-router-dom";
import useApiQuery from "../../../../hooks/api/useApiQuery";
import InventoryFormWithMap from "../../../inventory/inventory-form-with-map/InventoryFormWithMap";

type InventoryEditContainerProps = {
  onSubmitInventoryForm?: (inventoryFormData: UpsertInventoryInput) => void;
};

const InventoryEditContainer: FunctionComponent<InventoryEditContainerProps> = ({ onSubmitInventoryForm }) => {
  const [searchParams] = useSearchParams();
  const createFromInventoryId = searchParams.get("createFromInventory") ?? undefined;

  const {
    data: initialDataInventory,
    isFetching,
    refetch,
  } = useApiQuery(
    {
      path: `/inventories/${createFromInventoryId!}`,
      schema: getInventoryResponse,
    },
    {
      enabled: false,
    }
  );
  useEffect(() => {
    if (createFromInventoryId) {
      void refetch();
    }
  }, [createFromInventoryId, refetch]);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center">
        <progress className="progress progress-primary w-56" />
      </div>
    );
  }

  return (
    <>
      {(!createFromInventoryId || initialDataInventory) && (
        <InventoryFormWithMap
          mode="create"
          initialData={initialDataInventory}
          onSubmitInventoryForm={onSubmitInventoryForm}
        />
      )}
    </>
  );
};

export default InventoryEditContainer;
