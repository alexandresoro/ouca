import { getEnvironmentsResponse } from "@ou-ca/common/api/environment";
import { type Environment } from "@ou-ca/common/entities/environment";
import { useEffect, useRef, useState, type FunctionComponent } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import { findFirstFocusableElement } from "../../../utils/find-first-focusable-element";
import Autocomplete from "../../common/styled/select/Autocomplete";
import EntryFormEnvironment, { renderEnvironment } from "./EntryFormEnvironment";
import { type EntryFormState } from "./EntryFormState";

type EntryFormEnvironmentsProps = Pick<UseFormReturn<EntryFormState>, "control"> & {
  initialEnvironments?: Environment[];
};

const EntryFormEnvironments: FunctionComponent<EntryFormEnvironmentsProps> = ({ control, initialEnvironments }) => {
  const { t } = useTranslation();

  const [selectedEnvironments, setSelectedEnvironments] = useState<Environment[]>(initialEnvironments ?? []);

  const [newEnvironmentInput, setNewEnvironmentInput] = useState("");
  const newEnvironmentRef = useRef<HTMLElement>(null);

  const {
    field: { ref: refEnvironment, onChange: onUpdateEnvironmentsForm },
  } = useController({
    name: "environmentIds",
    control,
  });

  useEffect(() => {
    // When the selected environments change, update the form value
    onUpdateEnvironmentsForm(selectedEnvironments.map(({ id }) => id));
  }, [selectedEnvironments, onUpdateEnvironmentsForm]);

  const { data: dataEnvironments } = useApiQuery(
    {
      path: "/environments",
      queryParams: {
        q: newEnvironmentInput,
        pageSize: 5,
      },
      schema: getEnvironmentsResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const handleUpdatedEnvironment = (newEnvironment: Environment | null, index: number) => {
    if (newEnvironment) {
      setSelectedEnvironments((currentSelectedEnvironments) =>
        currentSelectedEnvironments.map((selectedEnvironment, i) => {
          return index === i ? newEnvironment : selectedEnvironment;
        })
      );
    } else {
      // Remove environment from the list
      setSelectedEnvironments((currentSelectedEnvironments) =>
        currentSelectedEnvironments.filter((_, i) => {
          return index !== i;
        })
      );
    }
  };

  const handleNewAddedEnvironment = (newEnvironment: Environment | null) => {
    if (newEnvironment) {
      setSelectedEnvironments((currentSelectedEnvironments) => [...currentSelectedEnvironments, newEnvironment]);
    }
  };

  const handleFocusToNewEnvironment = () => {
    findFirstFocusableElement(newEnvironmentRef.current, "input")?.focus();
  };

  return (
    <>
      <div ref={refEnvironment} className="flex flex-wrap gap-x-4 gap-y-2 justify-start">
        {selectedEnvironments.map((selectedEnvironment, index) => {
          return (
            <div key={`${selectedEnvironment.id}-${index}`} className="basis-96">
              <EntryFormEnvironment
                selectedEnvironment={selectedEnvironments[index]}
                onUpdateEnvironment={(newEnvironment) => {
                  handleUpdatedEnvironment(newEnvironment, index);
                }}
                index={index}
              />
            </div>
          );
        })}
        <Autocomplete
          ref={newEnvironmentRef}
          autocompleteClassName="basis-96"
          data={dataEnvironments?.data}
          name="environment-new"
          label={t("entryForm.environmentWithIndex", { index: selectedEnvironments.length + 1 })}
          decorationKey="code"
          decorationKeyClassName="w-20"
          onInputChange={setNewEnvironmentInput}
          onChange={handleNewAddedEnvironment}
          value={null}
          renderValue={renderEnvironment}
          labelTextClassName="first-letter:capitalize"
        />
      </div>
      <div tabIndex={newEnvironmentInput.length ? 0 : -1} onFocus={handleFocusToNewEnvironment} />
    </>
  );
};

export default EntryFormEnvironments;
