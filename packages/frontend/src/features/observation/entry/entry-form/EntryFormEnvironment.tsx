import { type Environment } from "@ou-ca/common/api/entities/environment";
import { getEnvironmentsResponse } from "@ou-ca/common/api/environment";
import { useEffect, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import Autocomplete from "../../../../components/base/autocomplete/Autocomplete";
import useApiQuery from "../../../../hooks/api/useApiQuery";

type EntryFormEnvironmentProps = {
  selectedEnvironment: Environment | null;
  onUpdateEnvironment: (updatedEnvironment: Environment | null) => void;
  index: number;
};

export const renderEnvironment = (environment: Environment | null): string => {
  return environment?.libelle ?? "";
};

const EntryFormEnvironment: FunctionComponent<EntryFormEnvironmentProps> = ({
  selectedEnvironment,
  onUpdateEnvironment,
  index,
}) => {
  const { t } = useTranslation();

  const [environmentInput, setEnvironmentInput] = useState("");

  useEffect(() => {
    // When the selected environment changes, update the input
    setEnvironmentInput(renderEnvironment(selectedEnvironment));
  }, [selectedEnvironment]);

  const { data: dataEnvironments } = useApiQuery(
    {
      path: "/environments",
      queryParams: {
        q: environmentInput,
        pageSize: 5,
      },
      schema: getEnvironmentsResponse,
    },
    {
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: "always",
    }
  );

  return (
    <Autocomplete
      data={dataEnvironments?.data}
      name={`name-${index}`}
      label={t("entryForm.environmentWithIndex", { index: index + 1 })}
      decorationKey="code"
      decorationKeyClassName="w-20"
      onInputChange={setEnvironmentInput}
      onChange={onUpdateEnvironment}
      value={selectedEnvironment}
      renderValue={renderEnvironment}
      labelTextClassName="first-letter:capitalize"
    />
  );
};

export default EntryFormEnvironment;
