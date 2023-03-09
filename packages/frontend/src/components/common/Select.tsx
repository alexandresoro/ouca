import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react";
import { Listbox } from "@headlessui/react";
import { Check } from "@styled-icons/boxicons-regular";
import { type Key, type PropsWithChildren } from "react";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";

type SelectProps<TFieldValues extends FieldValues, T> = UseControllerProps<TFieldValues> & {
  renderValue: (value: T) => string;
  label: string;
} & (T extends { id: string | number }
    ? {
        data: T[] | null | undefined;
        by?: keyof T;
      }
    : { data: T[] | null | undefined; by: keyof T });

const Select = <TFieldValues extends FieldValues, T>(props: PropsWithChildren<SelectProps<TFieldValues, T>>) => {
  const { data, by, renderValue, name, label, defaultValue, control, rules } = props;

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

  const { field } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  // TODO: try to improve type inference
  const key = by ?? "id";

  const getDisplayedSelectedValue = (value: unknown): string => {
    const selectedOption = data?.find((entry) => entry[key] === value);
    return selectedOption ? renderValue(selectedOption) : "";
  };

  return (
    <>
      <Listbox as="div" {...field} className="form-control w-full">
        <div className="label">
          <Listbox.Label className="label-text">{label}</Listbox.Label>
        </div>
        <Listbox.Button
          className="w-full select select-bordered select-primary items-center text-base-content"
          ref={refs.setReference}
        >
          {({ value }) => <>{getDisplayedSelectedValue(value)}</>}
        </Listbox.Button>
        <Listbox.Options
          className="menu menu-compact flex-nowrap text-base-content dark:shadow shadow-primary-focus bg-gray-100 dark:bg-base-300 ring-2 ring-primary-focus rounded-box overflow-y-auto"
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          ref={refs.setFloating}
        >
          {data?.map((option) => {
            return (
              <Listbox.Option
                className="font-semibold cursor-pointer"
                key={option[key] as Key}
                value={option[key] as Key}
              >
                {({ active, selected }) => (
                  <div className={`flex justify-between ${active ? "active" : ""}`}>
                    <span>{renderValue(option)}</span>
                    {selected && <Check className={`h-5 ${active ? "text-primary-content" : "text-primary"}`} />}
                  </div>
                )}
              </Listbox.Option>
            );
          })}
        </Listbox.Options>
      </Listbox>
    </>
  );
};

export default Select;
