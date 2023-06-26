import { getBehaviorsResponse } from "@ou-ca/common/api/behavior";
import { getObserversResponse } from "@ou-ca/common/api/observer";
import { type Behavior } from "@ou-ca/common/entities/behavior";
import { type Observer } from "@ou-ca/common/entities/observer";
import { useState, type FunctionComponent } from "react";
import { useForm, useWatch } from "react-hook-form";
import useApiQuery from "../hooks/api/useApiQuery";
import FormAutocomplete from "./common/form/FormAutocomplete";

type Temp = {
  observateur: Observer | null;
  comportement1: Behavior | null;
};

const TempPage: FunctionComponent = () => {
  const [obsFilter, setObsFilter] = useState("");
  const [compFilter, setCompFilter] = useState("");

  const [dataSubmitted, setDataSubmitted] = useState<Temp | undefined>();

  const { control, handleSubmit } = useForm<Temp>({
    defaultValues: {
      observateur: null,
      comportement1: null,
    },
  });

  const observateur = useWatch({
    control,
    name: "observateur",
  });

  const comportement = useWatch({
    control,
    name: "comportement1",
  });

  const { data: dataObs } = useApiQuery(
    {
      path: "/observers",
      queryParams: {
        q: obsFilter,
        pageSize: 5,
      },
      schema: getObserversResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const { data: dataComps } = useApiQuery(
    {
      path: "/behaviors",
      queryParams: {
        q: compFilter,
        pageSize: 5,
      },
      schema: getBehaviorsResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const onSubmit = (data: Temp) => {
    setDataSubmitted(data);
  };

  return (
    <>
      {observateur?.id} - {obsFilter}
      <FormAutocomplete
        data={dataObs?.data}
        name="observateur"
        label="Observateurs"
        control={control}
        onInputChange={setObsFilter}
        renderValue={({ libelle }) => libelle}
        autocompleteClassName="w-[40ch] ml-4"
      />
      {comportement?.id} - {compFilter}
      <FormAutocomplete
        data={dataComps?.data}
        name="comportement1"
        label="Comportement 1"
        control={control}
        decorationKey="code"
        onInputChange={setCompFilter}
        renderValue={({ libelle }) => libelle}
        autocompleteClassName="w-[40ch] ml-4"
      />
      <button type="button" className="btn btn-primary m-4" onClick={handleSubmit(onSubmit)}>
        Submit
      </button>
      {dataSubmitted && (
        <>
          <div>Data submitted:</div>
          <pre>{JSON.stringify(dataSubmitted, null, 2)}</pre>
        </>
      )}
    </>
  );
};

export default TempPage;
