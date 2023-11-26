import { type Observer } from "@ou-ca/common/api/entities/observer";
import { useApiObserverQuery } from "@services/api/observer/api-observer-queries";
import { type FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type ObserverTableRowProps = {
  id: string;
  onEditClicked?: (observer: Observer) => void;
  onDeleteClicked?: (observer: Observer) => void;
};

const ObserverTableRow: FunctionComponent<ObserverTableRowProps> = ({ id, onEditClicked, onDeleteClicked }) => {
  const { data: observer } = useApiObserverQuery(id);

  return (
    <tr className="hover:bg-base-200">
      <td>{observer?.libelle}</td>
      <td>{observer?.entriesCount}</td>
      <td align="right" className="pr-6">
        {observer != null && (
          <TableCellActionButtons
            disabledEdit={!observer.editable}
            disabledDelete={!observer.editable || observer.inventoriesCount > 0}
            onEditClicked={() => onEditClicked?.(observer)}
            onDeleteClicked={() => onDeleteClicked?.(observer)}
          />
        )}
      </td>
    </tr>
  );
};

export default ObserverTableRow;
