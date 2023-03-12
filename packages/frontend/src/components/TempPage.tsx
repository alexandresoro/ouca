import { useContext, useState, type FunctionComponent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery } from "urql";
import { UserContext } from "../contexts/UserContext";
import { graphql } from "../gql";
import { type Comportement, type Observateur } from "../gql/graphql";
import FormAutocomplete from "./common/form/FormAutocomplete";

const OBS_QUERY = graphql(`
  query TempObs($searchParams: SearchParams) {
    observateurs(searchParams: $searchParams) {
      data {
        id
        libelle
      }
    }
  }
`);

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
  observateur: Observateur | null;
  comportement1: Comportement | null;
};

const TempPage: FunctionComponent = () => {
  const { userInfo } = useContext(UserContext);

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

  const [{ data: dataObs }] = useQuery({
    query: OBS_QUERY,
    variables: {
      searchParams: {
        q: obsFilter,
        pageSize: 5,
      },
    },
  });

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
      {userInfo && (
        <code className="text-sm">
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
        </code>
      )}
      {observateur?.id} - {obsFilter}
      <FormAutocomplete
        data={dataObs?.observateurs?.data}
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
      <button className="btn btn-primary m-4" onClick={handleSubmit(onSubmit)}>
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
