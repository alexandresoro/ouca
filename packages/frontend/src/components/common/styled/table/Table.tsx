import { type FunctionComponent, type ReactElement } from "react";
import TablePagination from "./TablePagination";

type TableProps = {
  tableHead: ReactElement | undefined;
  tableRows: ReactElement[] | undefined;
  page: number;
  elementsPerPage: number;
  count: number | undefined;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
};

const Table: FunctionComponent<TableProps> = ({ tableHead, tableRows, page, elementsPerPage, count, onPageChange }) => {
  return (
    <div className="text-base-content my-4 border border-neutral rounded-lg border-opacity-10 shadow-md overflow-x-auto">
      <table className="table table-sm table-zebra w-full">
        <thead className="[&_td]:overflow-ellipsis">
          <tr>{tableHead}</tr>
        </thead>
        <tbody className="[&_td]:overflow-ellipsis">{tableRows}</tbody>
      </table>
      <TablePagination
        className="mt-3 mb-2"
        page={page}
        elementsPerPage={elementsPerPage}
        count={count}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default Table;
