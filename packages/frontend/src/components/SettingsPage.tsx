import { COORDINATES_SYSTEMS_CONFIG } from "@ou-ca/common/coordinates-system/coordinates-system-list.object";
import { useCallback, useContext, useEffect, type FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "urql";
import { UserContext } from "../contexts/UserContext";
import { graphql } from "../gql";
import { type CoordinatesSystemType } from "../gql/graphql";
import useSnackbar from "../hooks/useSnackbar";
import FormSelect from "./common/form/FormSelect";
import FormSwitch from "./common/form/FormSwitch";
import TextInput from "./common/styled/TextInput";
import ContentContainerLayout from "./layout/ContentContainerLayout";
import StyledPanelHeader from "./layout/StyledPanelHeader";

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

  const { displayNotification } = useSnackbar();

  const [{ fetching, error, data }, refetchSettings] = useQuery({ query: SETTINGS_QUERY });

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
      if (!data?.settings) {
        return;
      }
      const { defaultNombre, ...otherValues } = values;

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
            <progress className="progress progress-primary w-56"></progress>
          </div>
        )}
        {!(fetching || error) && (
          <div className="card border-2 border-primary p-6 bg-base-100 shadow-xl">
            <form className="flex justify-center items-center flex-col sm:flex-row gap-5 sm:gap-10 md:gap-16">
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
                  className={`input input-bordered text-base-content text-sm font-semibold ${
                    errors?.defaultNombre ? "input-error" : "input-primary"
                  }`}
                  {...register("defaultNombre", {
                    required: true,
                    min: 1,
                    max: 65535,
                    validate: (v) => !isNaN(v as unknown as number),
                  })}
                />

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
              </div>

              <div className="flex flex-col w-full">
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
