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
    <div className="border-2 border-primary bg-base-100 text-base-content shadow-xl rounded-xl px-8 py-4 mb-2">
      <table className="table table-compact table-zebra w-full">
        <thead>
          <tr>{tableHead}</tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
      <TablePagination
        className="mt-3"
        page={page}
        elementsPerPage={elementsPerPage}
        count={count}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default Table;
