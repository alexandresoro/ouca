import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, AlertColor, Card, Container, MenuItem, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { ReactElement, useCallback, useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { UserContext } from "../contexts/UserContext";
import { COORDINATES_SYSTEMS_CONFIG } from "../model/coordinates-system/coordinates-system-list.object";
import { Age, CoordinatesSystemType, Departement, EstimationNombre, MutationUpdateSettingsArgs, Observateur, Settings, Sexe } from "../model/graphql";
import ReactHookFormSelect from "./form/ReactHookFormSelect";
import ReactHookFormSwitch from "./form/ReactHookFormSwitch";
import StyledPanelHeader from "./utils/StyledPanelHeader";

type UserSettingsResult = {
  settings: Settings;
}

const USER_SETTINGS_QUERY = gql`
  query GetUserSettings {
    settings {
      id
      areAssociesDisplayed
      isDistanceDisplayed
      isMeteoDisplayed
      isRegroupementDisplayed
      defaultDepartement {
        id
        code
      }
      defaultObservateur {
        id
        libelle
      }
      coordinatesSystem
      defaultEstimationNombre {
        id
        libelle
        nonCompte
      }
      defaultSexe {
        id
        libelle
      }
      defaultAge {
        id
        libelle
      }
      defaultNombre
    }
  }
`;

const USER_SETTINGS_MUTATION = gql`
  mutation UpdateUserSettings($appConfiguration: InputSettings!) {
    updateSettings(appConfiguration: $appConfiguration) {
      id
      areAssociesDisplayed
      isMeteoDisplayed
      isDistanceDisplayed
      isRegroupementDisplayed
      defaultAge {
        id
        libelle
      }
      defaultSexe {
        id
        libelle
      }
      defaultNombre
      defaultEstimationNombre {
        id
        libelle
        nonCompte
      }
      coordinatesSystem
      defaultObservateur {
        id
        libelle
      }
      defaultDepartement {
        id
        code
      }
    }
  }
`;

type SettingsSelectValuesQueryResult = {
  ages: Age[]
  observateurs: Observateur[]
  departements: Departement[]
  estimationsNombre: EstimationNombre[]
  sexes: Sexe[]
}

const SETTINGS_SELECT_VALUES_QUERY = gql`
  query SettingsSelectValues {
    ages {
      id
      libelle
    }
    departements {
      id
      code
    }
    estimationsNombre {
      id
      libelle
      nonCompte
    }
    observateurs {
      id
      libelle
    }
    sexes {
      id
      libelle
    }
  }
`;

type SettingsInputs = {
  defaultObservateur: number
  defaultDepartement: number
  defaultEstimationNombre: number
  defaultNombre: number | string
  defaultSexe: number
  defaultAge: number
  areAssociesDisplayed: boolean
  isMeteoDisplayed: boolean
  isDistanceDisplayed: boolean
  isRegroupementDisplayed: boolean
  coordinatesSystem: CoordinatesSystemType
}

const COORDINATES_SYSTEMS = Object.values(
  COORDINATES_SYSTEMS_CONFIG
);

export default function SettingsPage(): ReactElement {

  const { t } = useTranslation();

  const { userInfo } = useContext(UserContext);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [alertType, setAlertType] = useState<AlertColor | undefined>(undefined);
  const [alertMessage, setAlertMessage] = useState("");

  // TODO check fetch policies
  const { loading, error, data: userSettingsResult } = useQuery<UserSettingsResult>(USER_SETTINGS_QUERY);
  const {
    error: errorSettingsSelectValuesQueryResult,
    data: settingsSelectValuesQueryResult
  } = useQuery<SettingsSelectValuesQueryResult>(SETTINGS_SELECT_VALUES_QUERY);

  const [sendUserSettingsUpdate] = useMutation<UserSettingsResult, MutationUpdateSettingsArgs>(USER_SETTINGS_MUTATION);

  const { control, formState: { errors }, handleSubmit, reset, watch } = useForm<SettingsInputs>();

  // Reset the form with the user preferences, when they are retrieved
  useEffect(() => {
    if (userSettingsResult?.settings) {
      reset({
        defaultObservateur: userSettingsResult.settings.defaultObservateur?.id,
        defaultDepartement: userSettingsResult.settings.defaultDepartement?.id,
        defaultEstimationNombre: userSettingsResult.settings.defaultEstimationNombre?.id,
        defaultNombre: userSettingsResult.settings.defaultNombre ?? '',
        defaultSexe: userSettingsResult.settings.defaultSexe?.id,
        defaultAge: userSettingsResult.settings.defaultAge?.id,
        areAssociesDisplayed: !!userSettingsResult.settings.areAssociesDisplayed,
        isMeteoDisplayed: !!userSettingsResult.settings.isMeteoDisplayed,
        isDistanceDisplayed: !!userSettingsResult.settings.isDistanceDisplayed,
        isRegroupementDisplayed: !!userSettingsResult.settings.isRegroupementDisplayed,
        coordinatesSystem: userSettingsResult?.settings?.coordinatesSystem
      })
    }
  }, [userSettingsResult, reset]);

  const displaySuccessNotification = useCallback(() => {
    setNotificationOpen(false);
    setAlertType("success");
    setAlertMessage(t("saveSettingsSuccess"));
    setNotificationOpen(true);
  }, [t]);

  const displayErrorNotification = useCallback(() => {
    setNotificationOpen(false);
    setAlertType("error");
    setAlertMessage(t("saveSettingsError"));
    setNotificationOpen(true);
  }, [t]);

  // Handle updated settings
  const sendUpdatedSettings = useCallback(async (values: SettingsInputs) => {
    if (!userSettingsResult?.settings) {
      return;
    }
    const { defaultNombre, ...otherValues } = values;

    // TODO add userId at some point
    console.log(userInfo)

    await sendUserSettingsUpdate({
      variables: {
        appConfiguration: {
          id: userSettingsResult.settings.id,
          defaultNombre: (typeof defaultNombre === "string") ? parseInt(defaultNombre) : defaultNombre,
          ...otherValues
        }
      }
    }).then(({ errors }) => {
      if (!errors) {
        displaySuccessNotification();
      } else {
        displayErrorNotification();
      }
    });
  }, [sendUserSettingsUpdate, userSettingsResult, displaySuccessNotification, displayErrorNotification, userInfo]);


  // Watch inputs for changes, and submit the form if any
  useEffect(() => {
    const subscription = watch(() => {
      if (!loading) {
        void handleSubmit(sendUpdatedSettings)();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, handleSubmit, sendUpdatedSettings, loading]);

  // Display a generic error message when somthing wrong happened while retrieving the settings
  useEffect(() => {
    if (error || errorSettingsSelectValuesQueryResult) {
      setNotificationOpen(false);
      setAlertType("error");
      setAlertMessage(t("retrieveSettingsError"));
      setNotificationOpen(true);
    }
  }, [t, error, errorSettingsSelectValuesQueryResult]);

  const handleNotificationClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setNotificationOpen(false);
  };

  return (
    <>
      <StyledPanelHeader>
        <Typography variant="h5" component="h1" >{t("settings")}</Typography>
      </StyledPanelHeader>
      <Container maxWidth="xl"
        sx={{
          marginTop: 5
        }}>
        <Card sx={{
          padding: 3
        }}>
          <form>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="center"
              alignItems="center"
              spacing={{
                xs: 0,
                sm: 5,
                md: 8
              }}
            >
              <Stack sx={{
                flex: "auto",
                width: {
                  xs: "100%"
                }
              }}>

                <ReactHookFormSelect
                  name="defaultObservateur"
                  label={t("defaultObserver")}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true
                  }}
                  formControlProps={{
                    margin: "normal",
                    fullWidth: true
                  }}
                >
                  {settingsSelectValuesQueryResult?.observateurs?.map((observateur) => (
                    <MenuItem key={observateur.id} value={observateur.id}>{observateur.libelle}</MenuItem>
                  ))}
                </ReactHookFormSelect>

                <ReactHookFormSelect
                  name="defaultDepartement"
                  label={t("defaultDepartment")}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true
                  }}
                  formControlProps={{
                    margin: "normal",
                    fullWidth: true
                  }}
                >
                  {settingsSelectValuesQueryResult?.departements?.map((departement) => (
                    <MenuItem key={departement.id} value={departement.id}>{departement.code}</MenuItem>
                  ))}
                </ReactHookFormSelect>

                <ReactHookFormSelect
                  name="defaultEstimationNombre"
                  label={t("defaultNumberEstimates")}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true
                  }}
                  formControlProps={{
                    margin: "normal",
                    fullWidth: true
                  }}
                >
                  {settingsSelectValuesQueryResult?.estimationsNombre?.map((estimationNombre) => (
                    <MenuItem key={estimationNombre.id} value={estimationNombre.id}>{estimationNombre.libelle}</MenuItem>
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
                    validate: v => !isNaN(v as unknown as number)
                  }}
                  render={({ field }) => (
                    <TextField
                      label={t("defaultNumber")}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
                    required: true
                  }}
                  formControlProps={{
                    margin: "normal",
                    fullWidth: true
                  }}
                >
                  {settingsSelectValuesQueryResult?.sexes?.map((sexe) => (
                    <MenuItem key={sexe.id} value={sexe.id}>{sexe.libelle}</MenuItem>
                  ))}
                </ReactHookFormSelect>

                <ReactHookFormSelect
                  name="defaultAge"
                  label={t("defaultAge")}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true
                  }}
                  formControlProps={{
                    margin: "normal",
                    fullWidth: true
                  }}
                >
                  {settingsSelectValuesQueryResult?.ages?.map((age) => (
                    <MenuItem key={age.id} value={age.id}>{age.libelle}</MenuItem>
                  ))}
                </ReactHookFormSelect>

              </Stack>

              <Stack sx={{
                flex: "auto",
                width: {
                  xs: "100%"
                }
              }}>

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
                    required: true
                  }}
                  formControlProps={{
                    margin: "normal",
                    fullWidth: true
                  }}
                >
                  {COORDINATES_SYSTEMS.map((coordinateSystem) => (
                    <MenuItem key={coordinateSystem.code} value={coordinateSystem.code}>{coordinateSystem.name}</MenuItem>
                  ))}
                </ReactHookFormSelect>

              </Stack>

            </Stack>
          </form>
        </Card>
      </Container>

      <Snackbar
        open={notificationOpen}
        autoHideDuration={2500}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alertType}>{alertMessage}</Alert>
      </Snackbar>
    </>
  )
}