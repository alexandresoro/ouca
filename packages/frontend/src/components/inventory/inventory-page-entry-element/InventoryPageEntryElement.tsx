import { type Entry } from "@ou-ca/common/entities/entry";
import { type FunctionComponent } from "react";

type InventoryPageEntryElementProps = {
  entry: Entry;
};

const InventoryPageEntryElement: FunctionComponent<InventoryPageEntryElementProps> = ({ entry }) => {
  return <div className="card border-2 border-primary p-6 bg-base-200 shadow-xl">{JSON.stringify(entry)}</div>;
};

export default InventoryPageEntryElement;
