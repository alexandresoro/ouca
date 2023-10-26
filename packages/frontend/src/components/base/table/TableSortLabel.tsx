import { UpArrowAlt } from "@styled-icons/boxicons-regular";
import { type FunctionComponent, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

type TableSortLabelProps = PropsWithChildren<{
  active: boolean;
  direction: "asc" | "desc";
  onClick?: () => void;
}>;

const TableSortLabel: FunctionComponent<TableSortLabelProps> = ({ active, direction, onClick, children }) => {
  const { t } = useTranslation();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        onClick?.();
        return;
      default:
        return;
    }
  };

  return (
    <span
      tabIndex={0}
      role="button"
      className={`inline-flex items-center gap-0.5 ${
        active
          ? "text-black/80 dark:text-white"
          : "hover:text-black/60 dark:hover:text-white/70 [&_svg]:hover:opacity-50"
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {children}
      {active && (
        <span className="sr-only">{direction === "desc" ? t("aria-descendingSort") : t("aria-ascendingSort")}</span>
      )}
      <UpArrowAlt
        className={`h-5 transition-transform ${active ? "opacity-100" : "opacity-0"} ${
          direction === "desc" ? "rotate-180 -translate-y-px" : "rotate-0"
        }`}
      />
    </span>
  );
};

export default TableSortLabel;
