import { zodResolver } from "@hookform/resolvers/zod";
import { getAgesResponse } from "@ou-ca/common/api/age";
import { getDepartmentsResponse } from "@ou-ca/common/api/department";
import { getNumberEstimatesResponse } from "@ou-ca/common/api/number-estimate";
import { getObserversResponse } from "@ou-ca/common/api/observer";
import {
  getSettingsResponse,
  putSettingsInput,
  putSettingsResponse,
  type PutSettingsInput,
} from "@ou-ca/common/api/settings";
import { getSexesResponse } from "@ou-ca/common/api/sex";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiMutation from "../hooks/api/useApiMutation";
import useApiQuery from "../hooks/api/useApiQuery";
import useSnackbar from "../hooks/useSnackbar";
import FormSelect from "./common/form/FormSelect";
import FormSwitch from "./common/form/FormSwitch";
import TextInput from "./common/styled/TextInput";
import ContentContainerLayout from "./layout/ContentContainerLayout";
import StyledPanelHeader from "./layout/StyledPanelHeader";

type SettingsInputs = {
  defaultObserver: string | null;
  defaultDepartment: string | null;
  defaultEstimationNombre: string | null;
  defaultNombre: string;
  defaultSexe: string | null;
  defaultAge: string | null;
  areAssociesDisplayed: boolean;
  isMeteoDisplayed: boolean;
  isDistanceDisplayed: boolean;
  isRegroupementDisplayed: boolean;
};

const SettingsPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const {
    data: settings,
    isError,
    isFetching,
    refetch,
  } = useApiQuery({
    path: "/settings",
    schema: getSettingsResponse,
  });

  const {
    data: ages,
    isError: isErrorAges,
    isFetching: isFetchingAges,
  } = useApiQuery({
    path: "/ages",
    schema: getAgesResponse,
  });

  const {
    data: departments,
    isError: isErrorDepartments,
    isFetching: isFetchingDepartments,
  } = useApiQuery({
    path: "/departments",
    schema: getDepartmentsResponse,
  });

  const {
    data: numberEstimates,
    isError: isErrorNumberEstimates,
    isFetching: isFetchingNumberEstimates,
  } = useApiQuery({
    path: "/number-estimates",
    schema: getNumberEstimatesResponse,
  });

  const {
    data: observers,
    isError: isErrorObservers,
    isFetching: isFetchingObservers,
  } = useApiQuery({
    path: "/observers",
    schema: getObserversResponse,
  });

  const {
    data: sexes,
    isError: isErrorSexes,
    isFetching: isFetchingSexes,
  } = useApiQuery({
    path: "/sexes",
    schema: getSexesResponse,
  });

  const fetching =
    isFetching ||
    isFetchingAges ||
    isFetchingDepartments ||
    isFetchingNumberEstimates ||
    isFetchingObservers ||
    isFetchingSexes;
  const error =
    isError || isErrorAges || isErrorDepartments || isErrorNumberEstimates || isErrorObservers || isErrorSexes;

  const { mutate } = useApiMutation(
    {
      path: "/settings",
      method: "PUT",
      schema: putSettingsResponse,
    },
    {
      onSuccess: (updatedSettings) => {
        queryClient.setQueryData(["API", "/settings"], updatedSettings);
        displayNotification({
          type: "success",
          message: t("saveSettingsSuccess"),
        });
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("saveSettingsError"),
        });
        void refetch();
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
    },
    resolver: zodResolver(putSettingsInput),
  });

  useEffect(() => {
    reset({
      defaultObserver: settings?.defaultObserver?.id ?? null,
      defaultDepartment: settings?.defaultDepartment?.id ?? null,
      defaultEstimationNombre: settings?.defaultNumberEstimate?.id ?? null,
      defaultNombre: settings?.defaultNombre ? `${settings.defaultNombre}` : "",
      defaultSexe: settings?.defaultSex?.id ?? null,
      defaultAge: settings?.defaultAge?.id ?? null,
      areAssociesDisplayed: !!settings?.areAssociesDisplayed,
      isMeteoDisplayed: !!settings?.isMeteoDisplayed,
      isDistanceDisplayed: !!settings?.isDistanceDisplayed,
      isRegroupementDisplayed: !!settings?.isRegroupementDisplayed,
    });
  }, [settings, reset]);

  // Handle updated settings
  const sendUpdatedSettings: SubmitHandler<PutSettingsInput> = useCallback(
    (values) => {
      if (!settings) {
        return;
      }

      mutate({ body: values });
    },
    [mutate, settings]
  );

  // Watch inputs for changes, and submit the form if any
  useEffect(() => {
    const subscription = watch(() => {
      if (!isFetching) {
        void handleSubmit(sendUpdatedSettings as unknown as SubmitHandler<SettingsInputs>)();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, handleSubmit, sendUpdatedSettings, isFetching]);

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
                  data={observers?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSelect
                  name="defaultDepartment"
                  label={t("defaultDepartment")}
                  control={control}
                  data={departments?.data}
                  renderValue={({ code }) => code}
                />

                <FormSelect
                  name="defaultEstimationNombre"
                  label={t("defaultNumberPrecision")}
                  control={control}
                  data={numberEstimates?.data}
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
                  data={sexes?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSelect
                  name="defaultAge"
                  label={t("defaultAge")}
                  control={control}
                  data={ages?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSwitch name="areAssociesDisplayed" label={t("displayAssociateObservers")} control={control} />

                <FormSwitch name="isMeteoDisplayed" label={t("displayWeather")} control={control} />

                <FormSwitch name="isDistanceDisplayed" label={t("displayDistance")} control={control} />

                <FormSwitch name="isRegroupementDisplayed" label={t("displayRegroupmentNumber")} control={control} />
              </div>
            </form>
          </div>
        )}
      </ContentContainerLayout>
    </>
  );
};

export default SettingsPage;
