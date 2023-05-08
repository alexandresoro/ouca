import { getSettingsResponse } from "@ou-ca/common/api/settings";
import { COORDINATES_SYSTEMS_CONFIG } from "@ou-ca/common/coordinates-system/coordinates-system-list.object";
import { useCallback, useEffect, type FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "urql";
import { graphql } from "../gql";
import { type CoordinatesSystemType } from "../gql/graphql";
import useApiQuery from "../hooks/api/useApiQuery";
import useSnackbar from "../hooks/useSnackbar";
import useUserSettingsContext from "../hooks/useUserSettingsContext";
import FormSelect from "./common/form/FormSelect";
import FormSwitch from "./common/form/FormSwitch";
import TextInput from "./common/styled/TextInput";
import ContentContainerLayout from "./layout/ContentContainerLayout";
import StyledPanelHeader from "./layout/StyledPanelHeader";

const SETTINGS_QUERY = graphql(`
  query GetUserSettingsPage {
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

  const { updateUserSettings } = useUserSettingsContext();

  const { displayNotification } = useSnackbar();

  const {
    data: settingsData,
    error: errorSettings,
    isFetching,
    refetch,
  } = useApiQuery({
    path: "/settings",
    schema: getSettingsResponse,
  });

  const [{ fetching: fetchingGql, error: errorGql, data }, refetchSettings] = useQuery({ query: SETTINGS_QUERY });

  const fetching = isFetching || fetchingGql;
  const error = errorSettings || errorGql;

  const [_, sendUserSettingsUpdate] = useMutation(USER_SETTINGS_MUTATION);

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<SettingsInputs>();

  // Reset the form with the user preferences, when they are retrieved
  useEffect(() => {
    if (settingsData) {
      reset({
        defaultObservateur: settingsData.defaultObservateurId ?? undefined,
        defaultDepartement: settingsData.defaultDepartementId ?? undefined,
        defaultEstimationNombre: settingsData.defaultEstimationNombreId ?? undefined,
        defaultNombre: settingsData.defaultNombre ?? "",
        defaultSexe: settingsData.defaultSexeId ?? undefined,
        defaultAge: settingsData.defaultAgeId ?? undefined,
        areAssociesDisplayed: !!settingsData.areAssociesDisplayed,
        isMeteoDisplayed: !!settingsData.isMeteoDisplayed,
        isDistanceDisplayed: !!settingsData.isDistanceDisplayed,
        isRegroupementDisplayed: !!settingsData.isRegroupementDisplayed,
        coordinatesSystem: settingsData?.coordinatesSystem,
      });
    }
  }, [settingsData, reset]);

  const displaySuccessNotification = useCallback(() => {
    displayNotification({
      type: "success",
      message: t("saveSettingsSuccess"),
    });
  }, [t, displayNotification]);

  const displayErrorNotification = useCallback(() => {
    displayNotification({
      type: "error",
      message: t("saveSettingsError"),
    });
  }, [t, displayNotification]);

  // Handle updated settings
  const sendUpdatedSettings = useCallback(
    async (values: SettingsInputs) => {
      if (!settingsData) {
        return;
      }
      const { defaultNombre, ...otherValues } = values;

      await sendUserSettingsUpdate({
        appConfiguration: {
          id: settingsData.id,
          defaultNombre: typeof defaultNombre === "string" ? parseInt(defaultNombre) : defaultNombre,
          ...otherValues,
        },
      }).then(({ error }) => {
        void refetch();

        if (!error) {
          displaySuccessNotification();
          // Update the app-wide user settings when settings change
          void updateUserSettings();
        } else {
          displayErrorNotification();
          refetchSettings();
        }
      });
    },
    [
      sendUserSettingsUpdate,
      settingsData,
      displaySuccessNotification,
      displayErrorNotification,
      refetch,
      refetchSettings,
      updateUserSettings,
    ]
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
      displayNotification({
        type: "error",
        message: t("retrieveSettingsError"),
      });
    }
  }, [t, displayNotification, error]);

  return (
    <>
      <StyledPanelHeader>
        <h1 className="text-2xl font-normal">{t("settings")}</h1>
      </StyledPanelHeader>
      <ContentContainerLayout>
        {fetching && (
          <div className="flex justify-center items-center">
            <progress className="progress progress-primary w-56" />
          </div>
        )}
        {!(fetching || error) && (
          <div className="card border-2 border-primary p-6 bg-base-200 shadow-xl">
            <form className="flex justify-center items-center flex-col sm:flex-row gap-0 sm:gap-10 md:gap-16">
              <div className="flex flex-col w-full">
                <FormSelect
                  name="defaultObservateur"
                  label={t("defaultObserver")}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                  }}
                  data={data?.observateurs?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSelect
                  name="defaultDepartement"
                  label={t("defaultDepartment")}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                  }}
                  data={data?.departements?.data}
                  renderValue={({ code }) => code}
                />

                <FormSelect
                  name="defaultEstimationNombre"
                  label={t("defaultNumberPrecision")}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                  }}
                  data={data?.estimationsNombre?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <TextInput
                  textInputClassName="w-full"
                  label={t("defaultNumber")}
                  type="text"
                  required
                  defaultValue=""
                  hasError={!!errors.defaultNombre}
                  className="text-base-content text-sm font-semibold"
                  {...register("defaultNombre", {
                    required: true,
                    min: 1,
                    max: 65535,
                    validate: (v) => !isNaN(v as unknown as number),
                  })}
                />
              </div>

              <div className="flex flex-col w-full">
                <FormSelect
                  name="defaultSexe"
                  label={t("defaultSex")}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                  }}
                  data={data?.sexes?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSelect
                  name="defaultAge"
                  label={t("defaultAge")}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                  }}
                  data={data?.ages?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSwitch
                  name="areAssociesDisplayed"
                  label={t("displayAssociateObservers")}
                  control={control}
                  defaultValue=""
                />

                <FormSwitch name="isMeteoDisplayed" label={t("displayWeather")} control={control} defaultValue="" />

                <FormSwitch name="isDistanceDisplayed" label={t("displayDistance")} control={control} defaultValue="" />

                <FormSwitch
                  name="isRegroupementDisplayed"
                  label={t("displayRegroupmentNumber")}
                  control={control}
                  defaultValue=""
                />

                <FormSelect
                  name="coordinatesSystem"
                  label={t("coordinatesSystem")}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                  }}
                  data={COORDINATES_SYSTEMS}
                  by="code"
                  renderValue={({ name }) => name}
                />
              </div>
            </form>
          </div>
        )}
      </ContentContainerLayout>
    </>
  );
};

export default SettingsPage;
