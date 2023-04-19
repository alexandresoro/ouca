import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react";
import { Combobox } from "@headlessui/react";
import { Check, ExpandVertical } from "@styled-icons/boxicons-regular";
import { forwardRef, type ForwardedRef, type Key, type Ref } from "react";
import { useTranslation } from "react-i18next";
import { type ConditionalKeys } from "type-fest";

type AutocompleteProps<T> = {
  name?: string;
  label: string;
  value: T | null;
  onChange?: (value: T | null) => void;
  onInputChange?: (value: string) => void;
  renderValue: (value: T) => string;
  autocompleteClassName?: string;
  labelClassName?: string;
  labelTextClassName?: string;
  decorationKey?: ConditionalKeys<T, Key> & string;
  inputRef?: Ref<HTMLInputElement>;
} & (
  | {
      data: (T & { id: Key })[] | null | undefined;
      by?: ConditionalKeys<T, Key> & string;
    }
  | {
      data: T[] | null | undefined;
      by: ConditionalKeys<T, Key> & string;
    }
);

const Autocomplete = <T,>(props: AutocompleteProps<T>, ref: ForwardedRef<HTMLElement>) => {
  const {
    data,
    name,
    value,
    onChange,
    onInputChange,
    by,
    decorationKey,
    renderValue,
    label,
    autocompleteClassName,
    labelClassName,
    labelTextClassName,
    inputRef,
  } = props;

  const { t } = useTranslation();

  const { x, y, strategy, refs } = useFloating<HTMLInputElement>({
    placement: "bottom-start",
    middleware: [
      offset(8),
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
  const key = by ?? ("id" as ConditionalKeys<T, Key> & string);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(event.target.value);
  };

  const getDisplayValue = (value: T | null): string => {
    return value ? renderValue(value) : "";
  };

  const getDisplayValueAsOption = (value: T): string => {
    return `${decorationKey ? `${value[decorationKey] as Key} - ` : ""}${renderValue(value)}`;
  };

  return (
    <Combobox
      as="div"
      ref={ref}
      name={name}
      value={value}
      onChange={onChange}
      by={key}
      className={`form-control py-2 ${autocompleteClassName ?? ""}`}
      nullable
    >
      {({ value }) => (
        <>
          <div className={`label ${labelClassName ?? ""}`}>
            <Combobox.Label className={`label-text ${labelTextClassName ?? ""}`}>{label}</Combobox.Label>
          </div>
          <div className={`w-full relative ${decorationKey ? "input-group" : ""}`} ref={refs.setReference}>
            {decorationKey && (
              <span className="w-20 border border-primary border-r-0 border-opacity-70">
                {value?.[decorationKey] as Key}
              </span>
            )}
            <Combobox.Button className="absolute z-[1] inset-y-0 right-0 flex items-center pr-2">
              <ExpandVertical className="h-5 opacity-70" aria-hidden="true" />
            </Combobox.Button>
            <Combobox.Input
              ref={inputRef}
              className="flex-grow w-full input input-bordered input-primary text-base-content pr-10"
              displayValue={getDisplayValue}
              onChange={handleInputChange}
              onBlur={handleInputChange}
            ></Combobox.Input>
          </div>
          <Combobox.Options
            className="menu menu-compact z-20 flex-nowrap text-base-content dark:shadow shadow-primary-focus bg-gray-100 dark:bg-base-300 ring-2 ring-primary-focus rounded-lg overflow-y-auto"
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
            ref={refs.setFloating}
          >
            {data?.length ? (
              data?.map((option) => {
                return (
                  <Combobox.Option className="font-semibold" key={option[key] as Key} value={option}>
                    {({ active, selected, disabled }) => (
                      <div className={`flex justify-between disabled ${active && !disabled ? "active" : ""}`}>
                        <span>{getDisplayValueAsOption(option)}</span>
                        {selected && <Check className={`h-5 ${active ? "text-primary-content" : "text-primary"}`} />}
                      </div>
                    )}
                  </Combobox.Option>
                );
              })
            ) : (
              <li className="pointer-events-none font-semibold text-base-content">
                <span className="">{t("components.autocomplete.noResults")}</span>
              </li>
            )}
          </Combobox.Options>
        </>
      )}
    </Combobox>
  );
};

export default forwardRef(Autocomplete);
