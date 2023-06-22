import { type Observer } from "@ou-ca/common/entities/observer";
import { useEffect, useState, type FunctionComponent } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import Autocomplete from "../../common/styled/select/Autocomplete";
import AutocompleteMultiple from "../../common/styled/select/AutocompleteMultiple";
import { AUTOCOMPLETE_OBSERVATEURS_QUERY } from "./InventoryFormQueries";
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

  const [{ data: dataObservers }] = useQuery({
    query: AUTOCOMPLETE_OBSERVATEURS_QUERY,
    variables: {
      searchParams: {
        q: observateurInput,
        pageSize: 5,
      },
    },
  });

  const [{ data: dataAssociateObservers }] = useQuery({
    query: AUTOCOMPLETE_OBSERVATEURS_QUERY,
    variables: {
      searchParams: {
        q: associatesInput,
        pageSize: 5,
      },
    },
    pause: !areAssociesDisplayed,
  });

  const dataObserversReshaped = dataObservers?.observateurs?.data
    ? dataObservers.observateurs.data.map((observer) => {
        return {
          id: `${observer.id}`,
          libelle: observer.libelle,
        } satisfies Observer;
      })
    : [];

  const dataAssociatesReshaped = dataAssociateObservers?.observateurs?.data
    ? dataAssociateObservers.observateurs.data.map((associate) => {
        return {
          id: `${associate.id}`,
          libelle: associate.libelle,
        } satisfies Observer;
      })
    : [];

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
        data={dataObserversReshaped}
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
          data={dataAssociatesReshaped}
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
