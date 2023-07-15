import { getInventoryResponse, type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { lazy, useEffect, useState, type FunctionComponent } from "react";
import {
  inventoryAltitudeAtom,
  inventoryLatitudeAtom,
  inventoryLocalityAtom,
  inventoryLongitudeAtom,
  inventorySetAtom,
  storedCustomizedCoordinatesAtom,
} from "../../../../atoms/inventoryFormAtoms";
import useApiQuery from "../../../../hooks/api/useApiQuery";
import InventoryForm from "../../inventory/InventoryForm";

const EntryMap = lazy(() => import("../../entry-map/EntryMap"));

type InventoryStepContainerProps = {
  existingInventoryId?: string;
  onSubmitInventoryForm?: (inventoryFormData: UpsertInventoryInput, inventoryId: string | undefined) => void;
};

const InventoryStepContainer: FunctionComponent<InventoryStepContainerProps> = ({
  existingInventoryId,
  onSubmitInventoryForm,
}) => {
  const setInventory = useSetAtom(inventorySetAtom);

  const inventoryLocality = useAtomValue(inventoryLocalityAtom);
  const inventoryLatitude = useAtomValue(inventoryLatitudeAtom);
  const inventoryLongitude = useAtomValue(inventoryLongitudeAtom);
  const inventoryAltitude = useAtomValue(inventoryAltitudeAtom);
  const storedCustomizedCoordinates = useAtomValue(storedCustomizedCoordinatesAtom);

  const {
    data: existingInventory,
    isFetching,
    refetch,
  } = useApiQuery(
    {
      path: `/inventories/${existingInventoryId!}`,
      schema: getInventoryResponse,
    },
    {
      enabled: false,
    }
  );
  useEffect(() => {
    if (existingInventoryId) {
      void refetch();
    }
  }, [existingInventoryId, refetch]);

  const [isInventoryReady, setIsInventoryReady] = useState(false);

  useEffect(() => {
    setIsInventoryReady(false);
    void setInventory(existingInventoryId != null ? existingInventory ?? RESET : RESET).then(() => {
      setIsInventoryReady(true);
    });
  }, [existingInventory, existingInventoryId, setInventory]);

  const newInventoryKey = `new-${existingInventoryId ?? ""}`;

  return (
    <div className="container mx-auto flex gap-10">
      <div className="basis-1/3 mt-4">
        Coords - LAT {inventoryLatitude} - LONG {inventoryLongitude} - ALT {inventoryAltitude}
        <br />
        Stored custom coords - LAT {storedCustomizedCoordinates?.lat} - LONG {storedCustomizedCoordinates?.lng} - ALT{" "}
        {storedCustomizedCoordinates?.altitude}
        <br />
        LOCALITY {JSON.stringify(inventoryLocality)}
        {isInventoryReady && (
          <>
            {existingInventoryId != null && existingInventory != null && !isFetching && (
              <InventoryForm
                key={newInventoryKey}
                isNewInventory={true}
                existingInventory={existingInventory}
                onSubmitForm={onSubmitInventoryForm}
              />
            )}
            {existingInventoryId === undefined && (
              <InventoryForm key={newInventoryKey} isNewInventory={true} onSubmitForm={onSubmitInventoryForm} />
            )}
          </>
        )}
      </div>
      <div className="basis-2/3">
        <EntryMap />
      </div>
    </div>
  );
};

export default InventoryStepContainer;
