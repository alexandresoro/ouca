import { type ComponentPropsWithoutRef, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type TypePaginationProps = ComponentPropsWithoutRef<"div"> & {
  page: number;
  elementsPerPage: number;
  count: number | undefined;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
};

const TablePagination: FunctionComponent<TypePaginationProps> = ({
  page,
  elementsPerPage,
  count,
  onPageChange,
  className,
  ...rest
}) => {
  const { t } = useTranslation();

  const enablePreviousPage = count && page > 1;
  const enableNextPage = count && page < Math.ceil(count / elementsPerPage);

  return (
    <div {...rest} className={`flex justify-center items-center gap-3 ${className ?? ""}`}>
      <button
        type="button"
        className={`btn btn-sm btn-ghost btn-circle ${enablePreviousPage ? "" : "btn-disabled bg-opacity-0"}`}
        onClick={(e) => onPageChange?.(e, page - 1)}
      >
        «
      </button>
      <span className={`text-sm uppercase font-semibold ${count != null ? "" : "invisible"}`}>
        {t("pagination.currentPageDescription", {
          currentPage: page,
          totalPages: count != null ? Math.ceil(count / elementsPerPage) : 0,
        })}
      </span>
      <button
        type="button"
        className={`btn btn-sm btn-ghost btn-circle ${enableNextPage ? "" : "btn-disabled bg-opacity-0"}`}
        onClick={(e) => onPageChange?.(e, page + 1)}
      >
        »
      </button>
    </div>
  );
};

export default TablePagination;
