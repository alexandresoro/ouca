import { getObserversResponse } from "@ou-ca/common/api/observer";
import { type Observer } from "@ou-ca/common/entities/observer";
import { useEffect, useState, type FunctionComponent } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import Autocomplete from "../../common/styled/select/Autocomplete";
import AutocompleteMultiple from "../../common/styled/select/AutocompleteMultiple";
import { type InventoryFormState } from "./InventoryFormState";

type InventoryFormObserverProps = Pick<UseFormReturn<InventoryFormState>, "control"> & {
  defaultObserver?: Observer;
  autofocusOnObserver?: boolean;
  areAssociesDisplayed?: boolean;
};

const renderObserver = (observer: Observer | null): string => {
  return observer?.libelle ?? "";
};

const InventoryFormObserver: FunctionComponent<InventoryFormObserverProps> = ({
  control,
  defaultObserver,
  autofocusOnObserver,
  areAssociesDisplayed,
}) => {
  const { t } = useTranslation();

  const [observateurInput, setObservateurInput] = useState("");
  const [selectedObserver, setSelectedObserver] = useState<Observer | null>(null);
  useEffect(() => {
    setSelectedObserver(defaultObserver ?? null);
  }, [defaultObserver]);

  const [associatesInput, setAssociatesInput] = useState("");
  const [selectedAssociates, setSelectedAssociates] = useState<Observer[]>([]);

  const {
    field: { ref: refObserver, value: observerId, onChange: onChangeObserverForm },
  } = useController({
    name: "observerId",
    control,
  });

  const {
    field: { ref: refAssociates, value: associateIds, onChange: onChangeAssociatesForm },
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
      VALUE: {JSON.stringify(observerId)}
      <br />
      INPUT: {JSON.stringify(observateurInput)}
      <br />
      OBS: {JSON.stringify(selectedObserver)}
      <br />
      <Autocomplete
        ref={refObserver}
        inputProps={{
          autoFocus: autofocusOnObserver,
        }}
        data={dataObservers?.data}
        name="observer"
        label={t("observer")}
        onInputChange={setObservateurInput}
        onChange={setSelectedObserver}
        value={selectedObserver}
        renderValue={renderObserver}
        labelTextClassName="first-letter:capitalize"
      />
      VALUES: {JSON.stringify(associateIds)}
      <br />
      INPUT: {JSON.stringify(associatesInput)}
      <br />
      ASS: {JSON.stringify(selectedAssociates)}
      <br />
      {areAssociesDisplayed && (
        <AutocompleteMultiple
          ref={refAssociates}
          data={dataAssociateObservers?.data ?? []}
          name="associateObservers"
          label={t("associateObservers")}
          onInputChange={setAssociatesInput}
          onChange={setSelectedAssociates}
          values={selectedAssociates}
          renderValue={({ libelle }) => libelle}
          labelTextClassName="first-letter:capitalize"
        />
      )}
    </>
  );
};

export default InventoryFormObserver;
