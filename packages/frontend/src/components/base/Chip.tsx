import { X } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";

type ChipProps = {
  content: string;
  onDelete?: () => void;
};

const Chip: FunctionComponent<ChipProps> = ({ content, onDelete }) => {
  return (
    <div className="inline-flex min-w-0 items-center gap-1.5 px-2 py-1 rounded-full bg-secondary bg-opacity-30 border border-secondary border-opacity-30">
      <div className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">{content}</div>
      <button
        type="button"
        className="btn btn-xs btn-circle btn-ghost border border-gray-600 border-opacity-25 min-h-[1.25rem] h-5 w-5"
        onClick={onDelete}
      >
        <X className="h-4" />
      </button>
    </div>
  );
};

export default Chip;
