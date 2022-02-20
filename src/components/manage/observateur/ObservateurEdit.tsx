import { gql, useQuery } from "@apollo/client";
import { Cancel, Save } from "@mui/icons-material";
import { Button, Card, CardActions, CardContent, CardHeader, Container, TextField } from "@mui/material";
import { FunctionComponent } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Observateur } from "../../../model/graphql";
import { EntityWithLibelleInputs } from "../common/entity-types";
import ManageTopBar from "../common/ManageTopBar";

type ObservateursQueryResult = {
  observateurs: Observateur[];
};

const OBSERVATEURS_QUERY = gql`
  query {
    observateurs {
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

type ObservateurEditInputs = EntityWithLibelleInputs;

const ObservateurEdit: FunctionComponent<ObservateurEditProps> = (props) => {
  const { isEditionMode } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<ObservateurEditInputs>();

  const { data, error, loading } = useQuery<ObservateursQueryResult>(OBSERVATEURS_QUERY, {
    fetchPolicy: "network-only"
  });

  const title = isEditionMode ? t("observerEditionTitle") : t("observerCreationTitle");

  const validateLibelle = async (libelle: string): Promise<string | undefined> => {
    if (error || loading) {
      return t("validationFailureError");
    }

    const matchingEntity = data?.observateurs?.find((observateur) => observateur?.libelle === libelle);

    return matchingEntity ? t("observerAlreadyExistingError") : undefined;
  };

  const onSubmit: SubmitHandler<ObservateurEditInputs> = async (data) => {
    // TODO
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
              <Button variant="contained" startIcon={<Save />} type="submit">
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
