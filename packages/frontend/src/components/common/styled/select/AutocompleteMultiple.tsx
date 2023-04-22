import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react";
import { Combobox } from "@headlessui/react";
import { Check, ExpandVertical } from "@styled-icons/boxicons-regular";
import { forwardRef, type ComponentPropsWithRef, type ForwardedRef, type Key } from "react";
import { useTranslation } from "react-i18next";
import { type ConditionalKeys } from "type-fest";

type AutocompleteMultipleProps<T extends object> = {
  name?: string;
  label: string;
  values: T[];
  onChange?: (value: T[]) => void;
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

const AutocompleteMultiple = <T extends object,>(
  props: AutocompleteMultipleProps<T>,
  ref: ForwardedRef<HTMLElement>
) => {
  const {
    data,
    name,
    values,
    onChange,
    onInputChange,
    by,
    renderValue,
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

  const handleOnBlur = () => {
    // Trigger the input change on blur to match the behavior that clears the input
    onInputChange?.("");
  };

  const getDisplayedOption = (option: T) => {
    return (
      <Combobox.Option className="font-semibold" key={option[key] as Key} value={option}>
        {({ active, selected, disabled }) => (
          <div className={`flex justify-between disabled ${active && !disabled ? "active" : ""}`}>
            <span>{renderValue(option)}</span>
            {selected && <Check className={`h-5 ${active ? "text-primary-content" : "text-primary"}`} />}
          </div>
        )}
      </Combobox.Option>
    );
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
      onBlur={handleOnBlur}
      // Ugly workaround weird types in combobox w/ TS 5.0
      by={key as keyof unknown}
      className={`form-control py-2 ${autocompleteClassName ?? ""}`}
      multiple
    >
      {({ value }) => (
        <>
          <div className={`label py-1 ${labelClassName ?? ""}`}>
            <Combobox.Label className={`label-text ${labelTextClassName ?? ""}`}>{label}</Combobox.Label>
          </div>
          <div
            className="w-full inline-flex items-center input input-bordered focus-within:outline focus-within:outline-2 focus-within:outline-primary focus-within:outline-offset-2 input-primary gap-3 px-2"
            ref={refs.setReference}
          >
            <Combobox.Input
              {...inputProps}
              className="flex-grow outline-none bg-transparent text-base-content placeholder-shown:text-ellipsis"
              onChange={handleInputChange}
              placeholder={values.map(renderValue).join(", ") ?? ""}
            ></Combobox.Input>
            {value.length > 0 && <div className="badge badge-accent">{value.length}</div>}
            <Combobox.Button className="flex items-center">
              <ExpandVertical className="h-5 opacity-70" aria-hidden="true" />
            </Combobox.Button>
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
            {value.length > 0 && (
              <>
                <li className="menu-title">
                  <span>{t("components.autocomplete.selectedEntries")}</span>
                </li>
                {value.map(getDisplayedOption)}
              </>
            )}
            {value.length > 0 && (searchResults.length > 0 || !data.length) && (
              <li className="menu-title">
                <span>{t("components.autocomplete.resultsTitle")}</span>
              </li>
            )}
            {searchResults.length > 0 && searchResults.map(getDisplayedOption)}
            {!data.length && (
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
