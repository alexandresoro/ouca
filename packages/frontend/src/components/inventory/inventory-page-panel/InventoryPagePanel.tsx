import { type InventoryExtended } from "@ou-ca/common/entities/inventory";
import { type FunctionComponent } from "react";
import InventaireDetailsView from "../../view/InventaireDetailsView";
import InventoryMap from "../inventory-map/InventoryMap";

type InventoryPagePanelProps = {
  inventory: InventoryExtended;
};

const InventoryPagePanel: FunctionComponent<InventoryPagePanelProps> = ({ inventory }) => {
  return (
    <div className="flex flex-col gap-2">
      <InventaireDetailsView inventaire={inventory} />
      <InventoryMap inventory={inventory} />
    </div>
  );
};

export default InventoryPagePanel;
