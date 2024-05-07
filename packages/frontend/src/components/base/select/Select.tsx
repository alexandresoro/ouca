import { Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
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
  disabled?: boolean;
} & (T extends { id: Key } | string
  ? {
      by?: K;
    }
  : { by: K });

const Select = <T,>(props: SelectProps<T, ConditionalKeys<T, Key>>, ref: ForwardedRef<HTMLButtonElement>) => {
  const { data, name, value, required, onChange, onBlur, by, renderValue, hasError, label, selectClassName, disabled } =
    props;

  // TODO: try to improve type inference
  const key = by ?? ("id" as ConditionalKeys<T, Key>);

  const getDisplayedSelectedValue = (value: T | null): string => {
    return value ? renderValue(value) : "";
  };

  return (
    <Field className={`form-control py-2 ${selectClassName ?? ""}`}>
      <div className="label">
        <Label className="label-text">
          {label}
          {required && <RequiredField />}
        </Label>
      </div>
      <Listbox name={name} value={value} onChange={onChange} disabled={disabled}>
        <ListboxButton
          ref={ref}
          className={`w-full select select-bordered ${
            hasError ? "select-error" : "select-primary"
          } items-center text-base-content`}
          onBlur={onBlur}
        >
          {({ value }: { value: T | null }) => <>{getDisplayedSelectedValue(value)}</>}
        </ListboxButton>
        <ListboxOptions
          className={`w-[var(--button-width)] [--anchor-max-height:304px] flex flex-col flex-nowrap p-2 dark:shadow shadow-primary bg-gray-100 dark:bg-base-300 ${
            data?.length ? "ring-2" : ""
          } ring-primary rounded-lg`}
          anchor={{
            to: value ? "selection" : "bottom",
            padding: 16,
            gap: value ? 0 : 8,
          }}
        >
          {data?.map((option) => {
            return (
              <ListboxOption
                className="cursor-default font-semibold select-none"
                key={typeof option === "string" ? option : (option[key] as Key)}
                value={option}
              >
                {({ focus, selected, disabled }) => (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg disabled ${
                      focus && !disabled ? "bg-neutral" : ""
                    }`}
                  >
                    <Check className={`size-5 fill-primary ${selected ? "" : "invisible"}`} />
                    <span className={`text-sm ${focus ? "text-neutral-content" : "text-base-content"}`}>
                      {renderValue(option)}
                    </span>
                  </div>
                )}
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </Listbox>
    </Field>
  );
};

export default forwardRef(Select);
