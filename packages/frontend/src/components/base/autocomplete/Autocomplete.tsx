import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Label,
} from "@headlessui/react";
import { Check, ExpandVertical } from "@styled-icons/boxicons-regular";
import { type ComponentPropsWithoutRef, type FocusEventHandler, type ForwardedRef, type Key, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { ConditionalKeys } from "type-fest";
import RequiredField from "../RequiredField";

type AutocompleteProps<T> = {
  name?: string;
  label: string;
  hasError?: boolean;
  value: T | null;
  required?: boolean;
  onChange?: (value: T | null) => void;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  onInputChange?: (value: string) => void;
  renderValue: (value: T) => string;
  renderValueAsOption?: (value: T) => string;
  autocompleteClassName?: string;
  labelClassName?: string;
  labelTextClassName?: string;
  decorationKey?: ConditionalKeys<T, string | number>;
  decorationKeyClassName?: string;
  inputProps?: Omit<ComponentPropsWithoutRef<"input">, "value" | "defaultValue">;
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
    required,
    onChange,
    onBlur,
    onInputChange,
    by,
    decorationKey,
    decorationKeyClassName,
    renderValue,
    renderValueAsOption,
    hasError,
    label,
    autocompleteClassName,
    labelClassName,
    labelTextClassName,
    inputProps,
  } = props;

  const { t } = useTranslation();

  // TODO: try to improve type inference
  const key = by ?? ("id" as ConditionalKeys<T, Key> & string);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(event.target.value);
  };

  const getDisplayValue = (value: T | null): string => {
    return value ? renderValue(value) : "";
  };

  const getDisplayValueAsOption = (value: T): string => {
    return typeof renderValueAsOption === "function"
      ? renderValueAsOption(value)
      : `${decorationKey ? `${value[decorationKey] as Key} - ` : ""}${renderValue(value)}`;
  };

  return (
    <Field className={`form-control py-2 ${autocompleteClassName ?? ""}`}>
      <div className={`label py-1 ${labelClassName ?? ""}`}>
        <Label className={`label-text ${labelTextClassName ?? ""}`}>
          {label}
          {required && <RequiredField />}
        </Label>
      </div>
      <Combobox
        as="div"
        className="flex"
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        by={key}
      >
        {({ value }) => (
          <>
            <div className={`w-full relative ${decorationKey ? "join" : ""}`}>
              {decorationKey && (
                <span
                  className={`join-item w-20 bg-base-300/40 flex items-center px-4 border ${
                    hasError ? "border-error" : "border-primary"
                  } border-r-0 border-opacity-70 ${decorationKeyClassName ?? ""}`}
                >
                  {value?.[decorationKey] as string | number}
                </span>
              )}
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ExpandVertical className="h-5 opacity-70" aria-hidden="true" />
              </ComboboxButton>
              <ComboboxInput
                autoComplete="off"
                {...inputProps}
                className={`joint-item flex-grow w-full input input-bordered ${
                  hasError ? "input-error" : "input-primary"
                } text-base-content pr-10 ${decorationKey ? "rounded-l-none" : ""}`}
                displayValue={getDisplayValue}
                onChange={handleInputChange}
                onBlur={handleInputChange}
              />
            </div>
            <ComboboxOptions
              className="z-10 w-[var(--input-width)] [--anchor-max-height:304px] flex flex-col flex-nowrap p-2 shadow-xl bg-gray-100 dark:bg-base-300 ring-2 ring-primary rounded-lg"
              anchor={{
                to: "bottom",
                padding: 16,
                gap: 8,
              }}
            >
              {data?.length ? (
                data?.map((option) => {
                  return (
                    <ComboboxOption
                      className="cursor-default font-semibold select-none"
                      key={option[key] as Key}
                      value={option}
                    >
                      {({ focus, selected, disabled }) => (
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg disabled ${
                            focus && !disabled ? "bg-neutral" : ""
                          }`}
                        >
                          <Check
                            className={`size-5 ${focus ? "fill-neutral-content" : "fill-primary"} dark:fill-primary ${
                              selected ? "" : "invisible"
                            }`}
                          />
                          <span className={`text-sm ${focus ? "text-neutral-content" : "text-base-content"}`}>
                            {getDisplayValueAsOption(option)}
                          </span>
                        </div>
                      )}
                    </ComboboxOption>
                  );
                })
              ) : (
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

export default forwardRef(Autocomplete);
