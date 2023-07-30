import { getBehaviorsResponse } from "@ou-ca/common/api/behavior";
import { type Behavior } from "@ou-ca/common/entities/behavior";
import { useEffect, useRef, useState, type FunctionComponent } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import { findFirstFocusableElement } from "../../../utils/find-first-focusable-element";
import Autocomplete from "../../common/styled/select/Autocomplete";
import EntryFormBehavior, { renderBehavior } from "./EntryFormBehavior";
import { type EntryFormState } from "./EntryFormState";

type EntryFormBehaviorsProps = Pick<UseFormReturn<EntryFormState>, "control"> & {
  initialBehaviors?: Behavior[];
};

const EntryFormBehaviors: FunctionComponent<EntryFormBehaviorsProps> = ({ control, initialBehaviors }) => {
  const { t } = useTranslation();

  const [selectedBehaviors, setSelectedBehaviors] = useState<Behavior[]>(initialBehaviors ?? []);

  const [newBehaviorInput, setNewBehaviorInput] = useState("");
  const newBehaviorRef = useRef<HTMLElement>(null);

  const {
    field: { ref: refBehavior, onChange: onUpdateBehaviorsForm },
  } = useController({
    name: "behaviorIds",
    control,
  });

  useEffect(() => {
    // When the selected behaviors change, update the form value
    onUpdateBehaviorsForm(selectedBehaviors.map(({ id }) => id));
  }, [selectedBehaviors, onUpdateBehaviorsForm]);

  const { data: dataBehaviors } = useApiQuery(
    {
      path: "/behaviors",
      queryParams: {
        q: newBehaviorInput,
        pageSize: 5,
      },
      schema: getBehaviorsResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const handleUpdatedBehavior = (newBehavior: Behavior | null, index: number) => {
    if (newBehavior) {
      setSelectedBehaviors((currentSelectedBehaviors) =>
        currentSelectedBehaviors.map((selectedBehavior, i) => {
          return index === i ? newBehavior : selectedBehavior;
        })
      );
    } else {
      // Remove behavior from the list
      setSelectedBehaviors((currentSelectedBehaviors) =>
        currentSelectedBehaviors.filter((_, i) => {
          return index !== i;
        })
      );
    }
  };

  const handleNewAddedBehavior = (newBehavior: Behavior | null) => {
    if (newBehavior) {
      setSelectedBehaviors((currentSelectedBehaviors) => [...currentSelectedBehaviors, newBehavior]);
    }
  };

  const handleFocusToNewBehavior = () => {
    console.log(findFirstFocusableElement(newBehaviorRef.current, "input"));
    findFirstFocusableElement(newBehaviorRef.current, "input")?.focus();
  };

  return (
    <>
      <div ref={refBehavior} className="flex flex-wrap gap-x-4 gap-y-2 justify-start">
        {selectedBehaviors.map((selectedBehavior, index) => {
          return (
            <div className="basis-96">
              <EntryFormBehavior
                key={`${selectedBehavior.id}-${index}`}
                selectedBehavior={selectedBehaviors[index]}
                onUpdateBehavior={(newBehavior) => {
                  handleUpdatedBehavior(newBehavior, index);
                }}
                index={index}
              />
            </div>
          );
        })}
        <Autocomplete
          ref={newBehaviorRef}
          autocompleteClassName="basis-96"
          data={dataBehaviors?.data}
          name="behavior-new"
          label={t("entryForm.behaviorWithIndex", { index: selectedBehaviors.length + 1 })}
          decorationKey="code"
          decorationKeyClassName="w-20"
          onInputChange={setNewBehaviorInput}
          onChange={handleNewAddedBehavior}
          value={null}
          renderValue={renderBehavior}
          labelTextClassName="first-letter:capitalize"
        />
      </div>
      <div tabIndex={newBehaviorInput.length ? 0 : -1} onFocus={handleFocusToNewBehavior} />
    </>
  );
};

export default EntryFormBehaviors;
