import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react";
import { Listbox } from "@headlessui/react";
import { Check } from "@styled-icons/boxicons-regular";
import { type FocusEventHandler, type ForwardedRef, type Key, forwardRef } from "react";
import type { ConditionalKeys } from "type-fest";
import RequiredField from "../RequiredField";

type SelectProps<T, K extends ConditionalKeys<T, Key>> = {
  data: T[] | null | undefined;
  name?: string;
  label: string;
  hasError?: boolean;
  value: T | null;
  required?: boolean;
  onChange?: (value: T) => void;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  renderValue: (value: T) => string;
  selectClassName?: string;
} & (T extends { id: Key }
  ? {
      by?: K;
    }
  : { by: K });

const Select = <T,>(props: SelectProps<T, ConditionalKeys<T, Key>>, ref: ForwardedRef<HTMLElement>) => {
  const { data, name, value, required, onChange, onBlur, by, renderValue, hasError, label, selectClassName } = props;

  const { x, y, strategy, refs } = useFloating<HTMLButtonElement>({
    placement: "bottom-start",
    middleware: [
      offset(({ rects }) => {
        const shiftToCenter = data && data?.length > 4 ? 3 : 2; // Center if few elements, otherwise shift in order to give room to flip if needed
        return -rects.reference.height / shiftToCenter - rects.floating.height / shiftToCenter;
      }),
      shift(),
      flip({ padding: 8 }),
      size({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(availableHeight, 36 * 8)}px`,
            width: `${rects.reference.width}px`,
          });
        },
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // TODO: try to improve type inference
  const key = by ?? ("id" as ConditionalKeys<T, Key>);

  const getDisplayedSelectedValue = (value: T | null): string => {
    return value ? renderValue(value) : "";
  };

  return (
    <Listbox
      as="div"
      ref={ref}
      name={name}
      value={value}
      onChange={onChange}
      className={`form-control py-2 ${selectClassName ?? ""}`}
    >
      <div className="label">
        <Listbox.Label className="label-text">
          {label}
          {required && <RequiredField />}
        </Listbox.Label>
      </div>
      <Listbox.Button
        className={`w-full select select-bordered ${
          hasError ? "select-error" : "select-primary"
        } items-center text-base-content`}
        ref={refs.setReference}
        onBlur={onBlur}
      >
        {({ value }: { value: T | null }) => <>{getDisplayedSelectedValue(value)}</>}
      </Listbox.Button>
      <Listbox.Options
        className={`menu menu-compact z-20 flex-nowrap text-base-content dark:shadow shadow-primary bg-gray-100 dark:bg-base-300 ${
          data?.length ? "ring-2" : ""
        } ring-primary rounded-lg overflow-y-auto`}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
        }}
        ref={refs.setFloating}
      >
        {data?.map((option) => {
          return (
            <Listbox.Option className="font-semibold" key={option[key] as Key} value={option}>
              {({ active, selected, disabled }) => (
                <div className={`flex justify-between disabled ${active && !disabled ? "active" : ""}`}>
                  <span>{renderValue(option)}</span>
                  {selected && <Check className={`h-5 ${active ? "text-primary-content" : "text-primary"}`} />}
                </div>
              )}
            </Listbox.Option>
          );
        })}
      </Listbox.Options>
    </Listbox>
  );
};

export default forwardRef(Select);
