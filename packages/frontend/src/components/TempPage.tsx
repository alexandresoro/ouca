import { getObserversResponse } from "@ou-ca/common/api/observer";
import { type Observer } from "@ou-ca/common/entities/observer";
import { useState, type FunctionComponent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery } from "urql";
import { graphql } from "../gql";
import { type Comportement } from "../gql/graphql";
import useApiQuery from "../hooks/api/useApiQuery";
import FormAutocomplete from "./common/form/FormAutocomplete";

const COMPS_QUERY = graphql(`
  query TempComps($searchParams: SearchParams) {
    comportements(searchParams: $searchParams) {
      data {
        id
        code
        libelle
      }
    }
  }
`);

type Temp = {
  observateur: Observer | null;
  comportement1: Comportement | null;
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

  const [{ data: dataComps }] = useQuery({
    query: COMPS_QUERY,
    variables: {
      searchParams: {
        q: compFilter,
        pageSize: 5,
      },
    },
  });

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
        data={dataComps?.comportements?.data}
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
