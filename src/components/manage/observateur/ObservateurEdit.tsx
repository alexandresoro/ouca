import { gql, useMutation, useQuery } from "@apollo/client";
import { Cancel, Save } from "@mui/icons-material";
import { Button, Card, CardActions, CardContent, CardHeader, Container, TextField } from "@mui/material";
import { FunctionComponent, useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import { MutationUpsertObservateurArgs, Observateur, QueryObservateurArgs } from "../../../model/graphql";
import { EntityWithLibelleInputs } from "../common/entity-types";
import ManageTopBar from "../common/ManageTopBar";

type ObservateurQueryResult = {
  observateur: Pick<Observateur, "id" | "libelle">;
};

type ObservateurMutationResult = {
  upsertObservateur: Pick<Observateur, "id" | "libelle">;
};

const OBSERVATEUR_QUERY = gql`
  query GetObservateurIdInfo($id: Int!) {
    observateur(id: $id) {
      id
      libelle
    }
  }
`;

const OBSERVATEUR_UPSERT = gql`
  mutation ObservateurUpsert($id: Int, $data: InputObservateur!) {
    upsertObservateur(id: $id, data: $data) {
      id
      libelle
    }
  }
`;

type ObservateurEditProps = {
  isEditionMode: boolean;
};

type ObservateurUpsertInputs = EntityWithLibelleInputs & { id?: number };

const ObservateurEdit: FunctionComponent<ObservateurEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: observateurId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    control,
    formState: { errors },
    setValue,
    handleSubmit
  } = useForm<ObservateurUpsertInputs>();

  // Retrieve the existing observer info in edit mode
  const { data, error, loading } = useQuery<ObservateurQueryResult, QueryObservateurArgs>(OBSERVATEUR_QUERY, {
    fetchPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(observateurId!)
    },
    skip: !observateurId
  });

  const [upsertObservateur] = useMutation<ObservateurMutationResult, MutationUpsertObservateurArgs>(OBSERVATEUR_UPSERT);

  const { setSnackbarContent } = useSnackbar();

  useEffect(() => {
    if (data?.observateur) {
      setValue("id", data?.observateur?.id);
      setValue("libelle", data?.observateur?.libelle);
    }
  }, [data?.observateur, setValue]);

  useEffect(() => {
    if (error) {
      setSnackbarContent({
        type: "error",
        message: t("retrieveGenericError")
      });
    }
  }, [error, setSnackbarContent, t]);

  const title = isEditionMode ? t("observerEditionTitle") : t("observerCreationTitle");

  const onSubmit: SubmitHandler<ObservateurUpsertInputs> = async (data) => {
    const { id, ...restData } = data;
    await upsertObservateur({
      variables: {
        id: id ?? undefined,
        data: restData
      }
    })
      .then(({ errors }) => {
        if (errors) {
          setSnackbarContent({
            type: "error",
            message: t("retrieveGenericSaveError")
          });
        } else {
          setSnackbarContent({
            type: "success",
            message: t("retrieveGenericSaveSuccess")
          });
          navigate("..");
        }
      })
      .catch(() => {
        setSnackbarContent({
          type: "error",
          message: t("retrieveGenericSaveError")
        });
      });
  };

  return (
    <>
      <ManageTopBar title={t("observers")} showButtons={false} />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5
        }}
      >
        <Card>
          <CardHeader component="h2" title={title}></CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <Controller
                name="libelle"
                control={control}
                defaultValue=""
                rules={{
                  required: t("requiredFieldError") as unknown as string
                }}
                render={({ field }) => (
                  <TextField
                    label={t("label")}
                    variant="standard"
                    fullWidth
                    required
                    error={!!errors?.libelle}
                    helperText={errors?.libelle?.message ?? " "}
                    margin="normal"
                    {...field}
                  />
                )}
              />
            </CardContent>

            <CardActions>
              <Button color="secondary" variant="contained" startIcon={<Cancel />} onClick={() => navigate("..")}>
                {t("cancel")}
              </Button>
              <Button disabled={loading} variant="contained" startIcon={<Save />} type="submit">
                {t("save")}
              </Button>
            </CardActions>
          </form>
        </Card>
      </Container>
    </>
  );
};

export default ObservateurEdit;
