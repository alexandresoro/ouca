import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Observer } from "@ou-ca/common/api/entities/observer";
import { useApiObserverInfoQuery, useApiObserverQuery } from "@services/api/observer/api-observer-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type ObserverTableRowProps = {
  id: string;
  onEditClicked?: (observer: Observer) => void;
  onDeleteClicked?: (observer: Observer) => void;
};

const ObserverTableRow: FunctionComponent<ObserverTableRowProps> = ({ id, onEditClicked, onDeleteClicked }) => {
  const { data: observer } = useApiObserverQuery(id);
  const { data: observerInfo } = useApiObserverInfoQuery(id);

  const user = useUser();

  const isOwner = user != null && observer?.ownerId === user.id;

  return (
    <tr className="hover:bg-base-200">
      <td>{observer?.libelle}</td>
      <td>{observerInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={observer?.ownerId ?? null} />
      </td>
      <td align="center" className="w-32">
        {observer != null && (
          <TableCellActionButtons
            canEdit={isOwner || user?.permissions.observer.canEdit}
            canDelete={observerInfo?.canBeDeleted && user?.permissions.observer.canDelete}
            onEditClicked={() => onEditClicked?.(observer)}
            onDeleteClicked={() => onDeleteClicked?.(observer)}
          />
        )}
      </td>
    </tr>
  );
};

export default ObserverTableRow;
