import { getBehaviorsResponse } from "@ou-ca/common/api/behavior";
import { type Behavior } from "@ou-ca/common/api/entities/behavior";
import { type FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Autocomplete from "../../../../components/base/autocomplete/Autocomplete";
import useApiQuery from "../../../../hooks/api/useApiQuery";

type EntryFormBehaviorProps = {
  selectedBehavior: Behavior | null;
  onUpdateBehavior: (updatedBehavior: Behavior | null) => void;
  index: number;
};

export const renderBehavior = (behavior: Behavior | null): string => {
  return behavior?.libelle ?? "";
};

const EntryFormBehavior: FunctionComponent<EntryFormBehaviorProps> = ({
  selectedBehavior,
  onUpdateBehavior,
  index,
}) => {
  const { t } = useTranslation();

  const [behaviorInput, setBehaviorInput] = useState("");

  useEffect(() => {
    // When the selected behavior changes, update the input
    setBehaviorInput(renderBehavior(selectedBehavior));
  }, [selectedBehavior]);

  const { data: dataBehaviors } = useApiQuery(
    {
      path: "/behaviors",
      queryParams: {
        q: behaviorInput,
        pageSize: 5,
      },
      schema: getBehaviorsResponse,
    },
    {
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: "always",
    },
  );

  return (
    <Autocomplete
      data={dataBehaviors?.data}
      name={`name-${index}`}
      label={t("entryForm.behaviorWithIndex", { index: index + 1 })}
      decorationKey="code"
      decorationKeyClassName="w-20"
      onInputChange={setBehaviorInput}
      onChange={onUpdateBehavior}
      value={selectedBehavior}
      renderValue={renderBehavior}
      labelTextClassName="first-letter:capitalize"
    />
  );
};

export default EntryFormBehavior;
