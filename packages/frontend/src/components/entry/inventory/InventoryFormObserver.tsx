import { useState, type FunctionComponent, type Ref } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import FormAutocomplete from "../../common/form/FormAutocomplete";
import { AUTOCOMPLETE_OBSERVATEURS_QUERY } from "./InventoryFormQueries";
import { type UpsertInventoryInput } from "./inventory-form-types";

type InventoryFormObserverProps = Pick<UseFormReturn<UpsertInventoryInput>, "control"> & {
  areAssociesDisplayed?: boolean;
  observerInputRef?: Ref<HTMLInputElement>;
};

const InventoryFormObserver: FunctionComponent<InventoryFormObserverProps> = ({
  control,
  observerInputRef,
  areAssociesDisplayed,
}) => {
  const { t } = useTranslation();

  const [observateurInput, setObservateurInput] = useState("");
  const [associatesInput, setAssociatesInput] = useState("");

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

  return (
    <>
      <FormAutocomplete
        inputRef={observerInputRef}
        data={dataObservers?.observateurs?.data ?? []}
        name="observer"
        label={t("observer")}
        control={control}
        rules={{
          required: true,
        }}
        onInputChange={setObservateurInput}
        renderValue={({ libelle }) => libelle}
        labelTextClassName="first-letter:capitalize"
      />
      {areAssociesDisplayed && (
        <FormAutocomplete
          multiple
          data={dataAssociateObservers?.observateurs?.data ?? []}
          name="associateObservers"
          label={t("associateObservers")}
          control={control}
          onInputChange={setAssociatesInput}
          renderValue={({ libelle }) => libelle}
          labelTextClassName="first-letter:capitalize"
        />
      )}
    </>
  );
};

export default InventoryFormObserver;
