import { type ObserverSimple } from "@ou-ca/common/api/entities/observer";
import { getObserversResponse } from "@ou-ca/common/api/observer";
import { useEffect, useState, type FunctionComponent } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Autocomplete from "../../../../components/base/autocomplete/Autocomplete";
import AutocompleteMultiple from "../../../../components/base/autocomplete/AutocompleteMultiple";
import useApiQuery from "../../../../hooks/api/useApiQuery";
import { type InventoryFormState } from "./InventoryFormState";

type InventoryFormObserverProps = Pick<UseFormReturn<InventoryFormState>, "control"> & {
  defaultObserver?: ObserverSimple;
  defaultAssociates?: ObserverSimple[];
  autofocusOnObserver?: boolean;
  areAssociesDisplayed?: boolean;
};

const renderObserver = (observer: ObserverSimple | null): string => {
  return observer?.libelle ?? "";
};

const InventoryFormObserver: FunctionComponent<InventoryFormObserverProps> = ({
  control,
  defaultObserver,
  defaultAssociates,
  autofocusOnObserver,
  areAssociesDisplayed,
}) => {
  const { t } = useTranslation();

  const [observateurInput, setObservateurInput] = useState("");
  const [selectedObserver, setSelectedObserver] = useState<ObserverSimple | null>(null);
  useEffect(() => {
    setSelectedObserver(defaultObserver ?? null);
  }, [defaultObserver]);

  const [associatesInput, setAssociatesInput] = useState("");
  const [selectedAssociates, setSelectedAssociates] = useState<ObserverSimple[]>(defaultAssociates ?? []);

  const {
    field: { ref: refObserver, onChange: onChangeObserverForm, onBlur: onBlurObserver },
    fieldState: { error: errorObserverId },
  } = useController({
    name: "observerId",
    control,
  });

  const {
    field: { ref: refAssociates, onChange: onChangeAssociatesForm, onBlur: onBlurAssociates },
    fieldState: { error: errorAssociateIds },
  } = useController({
    name: "associateIds",
    control,
  });

  useEffect(() => {
    // When the selected observer changes, update both the input and the form value
    setObservateurInput(renderObserver(selectedObserver));
    onChangeObserverForm(selectedObserver?.id ?? null);
  }, [selectedObserver, onChangeObserverForm]);

  useEffect(() => {
    onChangeAssociatesForm(selectedAssociates?.map((associate) => associate.id) ?? []);
  }, [selectedAssociates, onChangeAssociatesForm]);

  const { data: dataObservers } = useApiQuery(
    {
      path: "/observers",
      queryParams: {
        q: observateurInput,
        pageSize: 5,
      },
      schema: getObserversResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const { data: dataAssociateObservers } = useApiQuery(
    {
      path: "/observers",
      queryParams: {
        q: associatesInput,
        pageSize: 5,
      },
      schema: getObserversResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
      enabled: areAssociesDisplayed,
    }
  );

  return (
    <>
      <Autocomplete
        ref={refObserver}
        inputProps={{
          autoFocus: autofocusOnObserver,
        }}
        data={dataObservers?.data}
        name="observer"
        required
        label={t("observer")}
        onInputChange={setObservateurInput}
        onChange={setSelectedObserver}
        onBlur={onBlurObserver}
        value={selectedObserver}
        renderValue={renderObserver}
        labelTextClassName="first-letter:capitalize"
        hasError={!!errorObserverId}
      />
      {areAssociesDisplayed && (
        <AutocompleteMultiple
          ref={refAssociates}
          data={dataAssociateObservers?.data ?? []}
          name="associateObservers"
          label={t("associateObservers_other")}
          onInputChange={setAssociatesInput}
          onChange={setSelectedAssociates}
          onBlur={onBlurAssociates}
          values={selectedAssociates}
          renderValue={({ libelle }) => libelle}
          labelTextClassName="first-letter:capitalize"
          hasError={!!errorAssociateIds}
        />
      )}
    </>
  );
};

export default InventoryFormObserver;
