import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react";
import { Combobox } from "@headlessui/react";
import { ExpandVertical } from "@styled-icons/boxicons-regular";
import { forwardRef, type ComponentPropsWithRef, type FocusEventHandler, type ForwardedRef, type Key } from "react";
import { useTranslation } from "react-i18next";
import { type ConditionalKeys } from "type-fest";
import Chip from "../Chip";
import RequiredField from "../RequiredField";

type AutocompleteMultipleProps<T extends object> = {
  name?: string;
  label: string;
  hasError?: boolean;
  values: T[];
  required?: boolean;
  onChange?: (value: T[]) => void;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  onInputChange?: (value: string) => void;
  renderValue: (value: T) => string;
  autocompleteClassName?: string;
  labelClassName?: string;
  labelTextClassName?: string;
  inputProps?: Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue">;
} & (
  | {
      data: (T & { id: Key })[];
      by?: ConditionalKeys<T, Key> & string;
    }
  | {
      data: T[];
      by: ConditionalKeys<T, Key> & string;
    }
);

const AutocompleteMultiple = <T extends object>(
  props: AutocompleteMultipleProps<T>,
  ref: ForwardedRef<HTMLElement>
) => {
  const {
    data,
    name,
    values,
    required,
    onChange,
    onBlur,
    onInputChange,
    by,
    renderValue,
    hasError,
    label,
    autocompleteClassName,
    labelClassName,
    labelTextClassName,
    inputProps,
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
  const key = by ?? ("id" as keyof T);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(event.target.value);
  };

  // Trigger the input change on blur to match the behavior that clears the input
  // The library clears the input somehow whenever the input is getting blurred
  // However, we need to propagate the info to the caller, otherwise
  // the input will appear as "" whereas the real value in the caller might be different
  // Keep in mind that an option selected via mouse click WILL trigger a blur of the input
  const handleOnBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    onInputChange?.(event.target.value);
  };

  const handleDeselectionFromList = (valueToDeselect: T) => {
    onChange?.(values.filter((value) => value[key] !== valueToDeselect[key]));
  };

  // Filter results that are already selected so that they don't appear twice
  const searchResults = data.filter((result) => {
    return !values.map((value) => value[key]).includes(result[key]);
  });

  return (
    <Combobox
      as="div"
      ref={ref}
      name={name}
      value={values}
      onChange={onChange}
      onBlur={onBlur}
      // Ugly workaround weird types in combobox w/ TS 5.0
      by={key as keyof unknown}
      className={`form-control py-2 ${autocompleteClassName ?? ""}`}
      multiple
      disabled={inputProps?.disabled}
    >
      {({ value }) => (
        <>
          <div className="flex items-center justify-between">
            <div className={`label py-1 ${labelClassName ?? ""}`}>
              <Combobox.Label className={`label-text ${labelTextClassName ?? ""}`}>
                {label}
                {required && <RequiredField />}
              </Combobox.Label>
            </div>
            {value.length > 0 && <div className="badge badge-accent badge-outline">{value.length}</div>}
          </div>
          {value.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 mb-1.5">
              {value.map((selectedValue) => (
                <Chip
                  key={selectedValue[key] as Key}
                  content={renderValue(selectedValue)}
                  onDelete={() => handleDeselectionFromList(selectedValue)}
                />
              ))}
            </div>
          )}
          <div
            className={`w-full inline-flex items-center input input-bordered focus-within:outline focus-within:outline-2 
            ${hasError ? "focus-within:outline-error" : "focus-within:outline-primary"} focus-within:outline-offset-2 ${
              hasError ? "input-error" : inputProps?.disabled ? "" : "input-primary"
            } gap-3 px-2`}
            ref={refs.setReference}
          >
            <Combobox.Input
              autoComplete="off"
              {...inputProps}
              className="flex-grow outline-none bg-transparent text-base-content placeholder-shown:text-ellipsis"
              onChange={handleInputChange}
              onBlur={handleOnBlur}
            />
            <Combobox.Button className="flex items-center">
              <ExpandVertical className="h-5 opacity-70" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Combobox.Options
            className="menu menu-compact z-20 flex-nowrap text-base-content dark:shadow shadow-primary bg-gray-100 dark:bg-base-300 ring-2 ring-primary rounded-lg overflow-y-auto"
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
            ref={refs.setFloating}
          >
            {searchResults.length > 0 &&
              searchResults.map((option) => (
                <Combobox.Option className="font-semibold" key={option[key] as Key} value={option}>
                  {({ active, disabled }) => (
                    <div className={`flex justify-between disabled ${active && !disabled ? "active" : ""}`}>
                      {renderValue(option)}
                    </div>
                  )}
                </Combobox.Option>
              ))}
            {!searchResults.length && (
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

export default forwardRef(AutocompleteMultiple);
