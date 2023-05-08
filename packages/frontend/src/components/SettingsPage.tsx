import { zodResolver } from "@hookform/resolvers/zod";
import {
  getSettingsResponse,
  putSettingsInput,
  putSettingsResponse,
  type PutSettingsInput,
} from "@ou-ca/common/api/settings";
import { COORDINATES_SYSTEMS_CONFIG } from "@ou-ca/common/coordinates-system/coordinates-system-list.object";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import { graphql } from "../gql";
import { type CoordinatesSystemType } from "../gql/graphql";
import useApiMutation from "../hooks/api/useApiMutation";
import useApiQuery from "../hooks/api/useApiQuery";
import useSnackbar from "../hooks/useSnackbar";
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

type SettingsInputs = {
  defaultObserver: number | null;
  defaultDepartment: number | null;
  defaultEstimationNombre: number | null;
  defaultNombre: string;
  defaultSexe: number | null;
  defaultAge: number | null;
  areAssociesDisplayed: boolean;
  isMeteoDisplayed: boolean;
  isDistanceDisplayed: boolean;
  isRegroupementDisplayed: boolean;
  coordinatesSystem: CoordinatesSystemType;
};

const COORDINATES_SYSTEMS = Object.values(COORDINATES_SYSTEMS_CONFIG);

const SettingsPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const {
    data: settings,
    error: errorSettings,
    isFetching,
    refetch,
  } = useApiQuery(
    {
      path: "/settings",
      schema: getSettingsResponse,
    },
    {
      onSuccess: (updatedSettings) => {
        reset({
          defaultObserver: updatedSettings?.defaultObserver?.id ? parseInt(updatedSettings.defaultObserver.id) : null,
          defaultDepartment: updatedSettings?.defaultDepartment?.id
            ? parseInt(updatedSettings.defaultDepartment.id)
            : null,
          defaultEstimationNombre: updatedSettings?.defaultEstimationNombreId ?? null,
          defaultNombre: updatedSettings?.defaultNombre ? `${updatedSettings.defaultNombre}` : "",
          defaultSexe: updatedSettings?.defaultSexeId ?? null,
          defaultAge: updatedSettings?.defaultAgeId ?? null,
          areAssociesDisplayed: !!updatedSettings?.areAssociesDisplayed,
          isMeteoDisplayed: !!updatedSettings?.isMeteoDisplayed,
          isDistanceDisplayed: !!updatedSettings?.isDistanceDisplayed,
          isRegroupementDisplayed: !!updatedSettings?.isRegroupementDisplayed,
          coordinatesSystem: updatedSettings?.coordinatesSystem ?? "gps",
        });
      },
    }
  );

  const [{ fetching: fetchingGql, error: errorGql, data }, refetchSettings] = useQuery({ query: SETTINGS_QUERY });

  const fetching = isFetching || fetchingGql;
  const error = errorSettings || errorGql;

  const { mutate } = useApiMutation(
    {
      path: "/settings",
      method: "PUT",
      schema: putSettingsResponse,
    },
    {
      onSuccess: (updatedSettings) => {
        queryClient.setQueryData(["API", "/settings"], updatedSettings);
        displaySuccessNotification();
      },
      onError: () => {
        displayErrorNotification();
        void refetch();
      },
      onSettled: () => {
        refetchSettings();
      },
    }
  );

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<SettingsInputs>({
    defaultValues: {
      defaultObserver: null,
      defaultDepartment: null,
      defaultEstimationNombre: null,
      defaultNombre: "",
      defaultSexe: null,
      defaultAge: null,
      areAssociesDisplayed: false,
      isMeteoDisplayed: false,
      isDistanceDisplayed: false,
      isRegroupementDisplayed: false,
      coordinatesSystem: "gps",
    },
    resolver: zodResolver(putSettingsInput),
  });

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
  const sendUpdatedSettings: SubmitHandler<PutSettingsInput> = useCallback(
    (values) => {
      if (!settings) {
        return;
      }

      mutate({ body: values });
    },
    [mutate, settings, displaySuccessNotification, displayErrorNotification, refetch, refetchSettings]
  );

  // Watch inputs for changes, and submit the form if any
  useEffect(() => {
    const subscription = watch(() => {
      if (!fetching) {
        void handleSubmit(sendUpdatedSettings as unknown as SubmitHandler<SettingsInputs>)();
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
                  name="defaultObserver"
                  label={t("defaultObserver")}
                  control={control}
                  data={data?.observateurs?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSelect
                  name="defaultDepartment"
                  label={t("defaultDepartment")}
                  control={control}
                  data={data?.departements?.data}
                  renderValue={({ code }) => code}
                />

                <FormSelect
                  name="defaultEstimationNombre"
                  label={t("defaultNumberPrecision")}
                  control={control}
                  data={data?.estimationsNombre?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <TextInput
                  textInputClassName="w-full"
                  label={t("defaultNumber")}
                  type="text"
                  required
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
                  data={data?.sexes?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSelect
                  name="defaultAge"
                  label={t("defaultAge")}
                  control={control}
                  data={data?.ages?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSwitch name="areAssociesDisplayed" label={t("displayAssociateObservers")} control={control} />

                <FormSwitch name="isMeteoDisplayed" label={t("displayWeather")} control={control} />

                <FormSwitch name="isDistanceDisplayed" label={t("displayDistance")} control={control} />

                <FormSwitch name="isRegroupementDisplayed" label={t("displayRegroupmentNumber")} control={control} />

                <FormSelect
                  name="coordinatesSystem"
                  label={t("coordinatesSystem")}
                  control={control}
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
