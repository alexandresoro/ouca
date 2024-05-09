import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Label,
} from "@headlessui/react";
import { ExpandVertical } from "@styled-icons/boxicons-regular";
import { type ComponentPropsWithRef, type FocusEventHandler, type ForwardedRef, type Key, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { ConditionalKeys } from "type-fest";
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
  ref: ForwardedRef<HTMLElement>,
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
    <Field className={`form-control py-2 ${autocompleteClassName ?? ""}`}>
      <div className="flex items-center justify-between">
        <div className={`label py-1 ${labelClassName ?? ""}`}>
          <Label className={`label-text ${labelTextClassName ?? ""}`}>
            {label}
            {required && <RequiredField />}
          </Label>
        </div>
        {values.length > 0 && <div className="badge badge-accent badge-outline">{values.length}</div>}
      </div>
      <Combobox
        as="div"
        className="flex flex-col"
        ref={ref}
        name={name}
        value={values}
        onChange={onChange}
        onBlur={onBlur}
        // Ugly workaround weird types in combobox w/ TS 5.0
        by={key as keyof unknown}
        multiple
        disabled={inputProps?.disabled}
      >
        {({ value }) => (
          <>
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
            <div className="w-full relative">
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ExpandVertical className="h-5 opacity-70" aria-hidden="true" />
              </ComboboxButton>
              <ComboboxInput
                autoComplete="off"
                {...inputProps}
                className={`flex-grow w-full input input-bordered ${
                  hasError ? "input-error" : "input-primary"
                } text-base-content pr-10`}
                onChange={handleInputChange}
                onBlur={handleOnBlur}
              />
            </div>
            <ComboboxOptions
              className="z-10 w-[var(--input-width)] [--anchor-max-height:304px] flex flex-col flex-nowrap p-2 dark:shadow shadow-primary bg-gray-100 dark:bg-base-300 ring-2 ring-primary rounded-lg"
              anchor={{
                to: "bottom",
                padding: 16,
                gap: 8,
              }}
            >
              {searchResults.length > 0 &&
                searchResults.map((option) => (
                  <ComboboxOption
                    className="cursor-default font-semibold select-none"
                    key={option[key] as Key}
                    value={option}
                  >
                    {({ focus, disabled }) => (
                      <div className={`flex px-3 py-2 rounded-lg disabled ${focus && !disabled ? "bg-neutral" : ""}`}>
                        <span className={`text-sm ${focus ? "text-neutral-content" : "text-base-content"}`}>
                          {renderValue(option)}
                        </span>
                      </div>
                    )}
                  </ComboboxOption>
                ))}
              {!searchResults.length && (
                <span className="px-3 py-2 pointer-events-none font-semibold text-base-content text-sm">
                  {t("components.autocomplete.noResults")}
                </span>
              )}
            </ComboboxOptions>
          </>
        )}
      </Combobox>
    </Field>
  );
};

export default forwardRef(AutocompleteMultiple);
