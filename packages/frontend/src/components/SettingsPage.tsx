import { Card, CircularProgress, Container, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { COORDINATES_SYSTEMS_CONFIG } from "@ou-ca/common/coordinates-system/coordinates-system-list.object";
import { useCallback, useContext, useEffect, type FunctionComponent } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "urql";
import { UserContext } from "../contexts/UserContext";
import { graphql } from "../gql";
import { type CoordinatesSystemType } from "../gql/graphql";
import useSnackbar from "../hooks/useSnackbar";
import ReactHookFormSelect from "./form/ReactHookFormSelect";
import ReactHookFormSwitch from "./form/ReactHookFormSwitch";
import StyledPanelHeader from "./utils/StyledPanelHeader";

const SETTINGS_QUERY = graphql(`
  query GetUserSettings {
    settings {
      id
      areAssociesDisplayed
      isDistanceDisplayed
      isMeteoDisplayed
      isRegroupementDisplayed
      defaultDepartementId
      defaultObservateurId
      coordinatesSystem
      defaultEstimationNombreId
      defaultSexeId
      defaultAgeId
      defaultNombre
    }
    ages {
      data {
        id
        libelle
      }
    }
    departements {
      data {
        id
        code
      }
    }
    estimationsNombre {
      data {
        id
        libelle
      }
    }
    observateurs {
      data {
        id
        libelle
      }
    }
    sexes {
      data {
        id
        libelle
      }
    }
  }
`);

const USER_SETTINGS_MUTATION = graphql(`
  mutation UpdateUserSettings($appConfiguration: InputSettings!) {
    updateSettings(appConfiguration: $appConfiguration) {
      id
      areAssociesDisplayed
      isMeteoDisplayed
      isDistanceDisplayed
      isRegroupementDisplayed
      defaultAgeId
      defaultSexeId
      defaultNombre
      defaultEstimationNombreId
      coordinatesSystem
      defaultObservateurId
      defaultDepartementId
    }
  }
`);

type SettingsInputs = {
  defaultObservateur: number;
  defaultDepartement: number;
  defaultEstimationNombre: number;
  defaultNombre: number | string;
  defaultSexe: number;
  defaultAge: number;
  areAssociesDisplayed: boolean;
  isMeteoDisplayed: boolean;
  isDistanceDisplayed: boolean;
  isRegroupementDisplayed: boolean;
  coordinatesSystem: CoordinatesSystemType;
};

const COORDINATES_SYSTEMS = Object.values(COORDINATES_SYSTEMS_CONFIG);

const SettingsPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { userInfo } = useContext(UserContext);

  const { setSnackbarContent } = useSnackbar();

  // TODO check fetch policies
  const [{ fetching, error, data }, refetchSettings] = useQuery({ query: SETTINGS_QUERY });

  const [_, sendUserSettingsUpdate] = useMutation(USER_SETTINGS_MUTATION);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<SettingsInputs>();

  // Reset the form with the user preferences, when they are retrieved
  useEffect(() => {
    if (data?.settings) {
      reset({
        defaultObservateur: data.settings.defaultObservateurId ?? undefined,
        defaultDepartement: data.settings.defaultDepartementId ?? undefined,
        defaultEstimationNombre: data.settings.defaultEstimationNombreId ?? undefined,
        defaultNombre: data.settings.defaultNombre ?? "",
        defaultSexe: data.settings.defaultSexeId ?? undefined,
        defaultAge: data.settings.defaultAgeId ?? undefined,
        areAssociesDisplayed: !!data.settings.areAssociesDisplayed,
        isMeteoDisplayed: !!data.settings.isMeteoDisplayed,
        isDistanceDisplayed: !!data.settings.isDistanceDisplayed,
        isRegroupementDisplayed: !!data.settings.isRegroupementDisplayed,
        coordinatesSystem: data?.settings?.coordinatesSystem,
      });
    }
  }, [data, reset]);

  const displaySuccessNotification = useCallback(() => {
    setSnackbarContent({
      type: "success",
      message: t("saveSettingsSuccess"),
    });
  }, [t, setSnackbarContent]);

  const displayErrorNotification = useCallback(() => {
    setSnackbarContent({
      type: "error",
      message: t("saveSettingsError"),
    });
  }, [t, setSnackbarContent]);

  // Handle updated settings
  const sendUpdatedSettings = useCallback(
    async (values: SettingsInputs) => {
      if (!data?.settings) {
        return;
      }
      const { defaultNombre, ...otherValues } = values;

      // TODO add userId at some point
      console.log(userInfo);

      await sendUserSettingsUpdate({
        appConfiguration: {
          id: data.settings.id,
          defaultNombre: typeof defaultNombre === "string" ? parseInt(defaultNombre) : defaultNombre,
          ...otherValues,
        },
      }).then(({ error }) => {
        if (!error) {
          displaySuccessNotification();
        } else {
          displayErrorNotification();
          refetchSettings();
        }
      });
    },
    [sendUserSettingsUpdate, data, displaySuccessNotification, displayErrorNotification, userInfo, refetchSettings]
  );

  // Watch inputs for changes, and submit the form if any
  useEffect(() => {
    const subscription = watch(() => {
      if (!fetching) {
        void handleSubmit(sendUpdatedSettings)();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, handleSubmit, sendUpdatedSettings, fetching]);

  // Display a generic error message when something wrong happened while retrieving the settings
  useEffect(() => {
    if (error) {
      setSnackbarContent({
        type: "error",
        message: t("retrieveSettingsError"),
      });
    }
  }, [t, setSnackbarContent, error]);

  return (
    <>
      <StyledPanelHeader>
        <Typography variant="h5" component="h1">
          {t("settings")}
        </Typography>
      </StyledPanelHeader>
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5,
        }}
      >
        {fetching && (
          <div className="flex justify-center items-center">
            <CircularProgress size={100} />
          </div>
        )}
        {!(fetching || error) && (
          <Card
            sx={{
              padding: 3,
            }}
          >
            <form>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="center"
                alignItems="center"
                spacing={{
                  xs: 0,
                  sm: 5,
                  md: 8,
                }}
              >
                <Stack
                  sx={{
                    flex: "auto",
                    width: {
                      xs: "100%",
                    },
                  }}
                >
                  <ReactHookFormSelect
                    name="defaultObservateur"
                    label={t("defaultObserver")}
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                    }}
                    formControlProps={{
                      margin: "normal",
                      fullWidth: true,
                    }}
                  >
                    {data?.observateurs?.data?.map((observateur) => (
                      <MenuItem key={observateur.id} value={observateur.id}>
                        {observateur.libelle}
                      </MenuItem>
                    ))}
                  </ReactHookFormSelect>

                  <ReactHookFormSelect
                    name="defaultDepartement"
                    label={t("defaultDepartment")}
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                    }}
                    formControlProps={{
                      margin: "normal",
                      fullWidth: true,
                    }}
                  >
                    {data?.departements?.data?.map((departement) => (
                      <MenuItem key={departement.id} value={departement.id}>
                        {departement.code}
                      </MenuItem>
                    ))}
                  </ReactHookFormSelect>

                  <ReactHookFormSelect
                    name="defaultEstimationNombre"
                    label={t("defaultNumberPrecision")}
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                    }}
                    formControlProps={{
                      margin: "normal",
                      fullWidth: true,
                    }}
                  >
                    {data?.estimationsNombre?.data?.map((estimationNombre) => (
                      <MenuItem key={estimationNombre.id} value={estimationNombre.id}>
                        {estimationNombre.libelle}
                      </MenuItem>
                    ))}
                  </ReactHookFormSelect>

                  <Controller
                    name="defaultNombre"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                      min: 1,
                      max: 65535,
                      validate: (v) => !isNaN(v as unknown as number),
                    }}
                    render={({ field }) => (
                      <TextField
                        label={t("defaultNumber")}
                        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                        variant="standard"
                        fullWidth
                        required
                        error={!!errors?.defaultNombre}
                        margin="normal"
                        {...field}
                      />
                    )}
                  />

                  <ReactHookFormSelect
                    name="defaultSexe"
                    label={t("defaultSex")}
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                    }}
                    formControlProps={{
                      margin: "normal",
                      fullWidth: true,
                    }}
                  >
                    {data?.sexes?.data?.map((sexe) => (
                      <MenuItem key={sexe.id} value={sexe.id}>
                        {sexe.libelle}
                      </MenuItem>
                    ))}
                  </ReactHookFormSelect>

                  <ReactHookFormSelect
                    name="defaultAge"
                    label={t("defaultAge")}
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                    }}
                    formControlProps={{
                      margin: "normal",
                      fullWidth: true,
                    }}
                  >
                    {data?.ages?.data?.map((age) => (
                      <MenuItem key={age.id} value={age.id}>
                        {age.libelle}
                      </MenuItem>
                    ))}
                  </ReactHookFormSelect>
                </Stack>

                <Stack
                  sx={{
                    flex: "auto",
                    width: {
                      xs: "100%",
                    },
                  }}
                >
                  <ReactHookFormSwitch
                    name="areAssociesDisplayed"
                    control={control}
                    defaultValue=""
                    label={t("displayAssociateObservers")}
                  />

                  <ReactHookFormSwitch
                    name="isMeteoDisplayed"
                    control={control}
                    defaultValue=""
                    label={t("displayWeather")}
                  />

                  <ReactHookFormSwitch
                    name="isDistanceDisplayed"
                    control={control}
                    defaultValue=""
                    label={t("displayDistance")}
                  />

                  <ReactHookFormSwitch
                    name="isRegroupementDisplayed"
                    control={control}
                    defaultValue=""
                    label={t("displayRegroupmentNumber")}
                  />

                  <ReactHookFormSelect
                    name="coordinatesSystem"
                    label={t("coordinatesSystem")}
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                    }}
                    formControlProps={{
                      margin: "normal",
                      fullWidth: true,
                    }}
                  >
                    {COORDINATES_SYSTEMS.map((coordinateSystem) => (
                      <MenuItem key={coordinateSystem.code} value={coordinateSystem.code}>
                        {coordinateSystem.name}
                      </MenuItem>
                    ))}
                  </ReactHookFormSelect>
                </Stack>
              </Stack>
            </form>
          </Card>
        )}
      </Container>
    </>
  );
};

export default SettingsPage;
