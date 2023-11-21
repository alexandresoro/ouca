import { type FunctionComponent, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";

type InfiniteTableProps = {
  tableHead: ReactElement | undefined;
  tableRows: ReactElement[] | undefined;
  enableScroll?: boolean;
  onMoreRequested?: () => void;
};

const InfiniteTable: FunctionComponent<InfiniteTableProps> = ({
  tableHead,
  tableRows,
  enableScroll,
  onMoreRequested,
}) => {
  const { t } = useTranslation();

  const { ref } = useInView({
    root: document.getElementById("scrollRoot"),
    rootMargin: "0px 0px 250px 0px",
    onChange: (inView) => {
      if (inView) {
        onMoreRequested?.();
      }
    },
  });

  return (
    <div className="text-base-content my-4 border border-neutral rounded-lg border-opacity-10 shadow-md">
      <table className="table table-sm table-zebra w-full overflow-x-auto">
        <thead className="[&_td]:overflow-ellipsis">
          <tr>{tableHead}</tr>
        </thead>
        <tbody className="[&_td]:overflow-ellipsis">{tableRows}</tbody>
      </table>
      {enableScroll && (
        <div className="flex justify-center">
          <button
            ref={ref}
            type="button"
            className="btn btn-xs btn-link no-underline"
            onClick={() => onMoreRequested?.()}
          >
            {t("infiniteScroll.more")}
          </button>
        </div>
      )}
    </div>
  );
};

export default InfiniteTable;
