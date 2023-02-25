import { Cancel, Save } from "@mui/icons-material";
import { Button, Card, CardActions, CardContent, CardHeader, TextField } from "@mui/material";
import { useEffect, type FunctionComponent } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { graphql } from "../../../gql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import { type EntityWithLibelleInputs } from "../common/entity-types";
import ManageTopBar from "../common/ManageTopBar";

const OBSERVATEUR_QUERY = graphql(`
  query GetObservateurIdInfo($id: Int!) {
    observateur(id: $id) {
      id
      libelle
    }
  }
`);

const OBSERVATEUR_UPSERT = graphql(`
  mutation ObservateurUpsert($id: Int, $data: InputObservateur!) {
    upsertObservateur(id: $id, data: $data) {
      id
      libelle
    }
  }
`);

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
    handleSubmit,
  } = useForm<ObservateurUpsertInputs>();

  // Retrieve the existing observer info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: OBSERVATEUR_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(observateurId!),
    },
    pause: !observateurId,
  });

  const [_, upsertObservateur] = useMutation(OBSERVATEUR_UPSERT);

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
        message: t("retrieveGenericError"),
      });
    }
  }, [error, setSnackbarContent, t]);

  const title = isEditionMode ? t("observerEditionTitle") : t("observerCreationTitle");

  const onSubmit: SubmitHandler<ObservateurUpsertInputs> = (data) => {
    const { id, ...restData } = data;
    upsertObservateur({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertObservateur) {
          setSnackbarContent({
            type: "success",
            message: t("retrieveGenericSaveSuccess"),
          });
          navigate("..");
        }
        if (error) {
          if (getOucaError(error) === "OUCA0004") {
            setSnackbarContent({
              type: "error",
              message: t("observerAlreadyExistingError"),
            });
          } else {
            setSnackbarContent({
              type: "error",
              message: t("retrieveGenericSaveError"),
            });
          }
        }
      })
      .catch(() => {
        setSnackbarContent({
          type: "error",
          message: t("retrieveGenericSaveError"),
        });
      });
  };

  return (
    <>
      <ManageTopBar title={t("observers")} showButtons={false} />
      <ContentContainerLayout>
        <Card>
          <CardHeader component="h2" title={title}></CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <Controller
                name="libelle"
                control={control}
                defaultValue=""
                rules={{
                  required: t("requiredFieldError"),
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
              <Button disabled={fetching} variant="contained" startIcon={<Save />} type="submit">
                {t("save")}
              </Button>
            </CardActions>
          </form>
        </Card>
      </ContentContainerLayout>
    </>
  );
};

export default ObservateurEdit;
