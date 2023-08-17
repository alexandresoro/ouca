import { zodResolver } from "@hookform/resolvers/zod";
import { getDepartmentsResponse } from "@ou-ca/common/api/department";
import { upsertLocalityInput, type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { getTownsResponse } from "@ou-ca/common/api/town";
import { type Department } from "@ou-ca/common/entities/department";
import { useEffect, useState, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import FormSelect from "../../common/form/FormSelect";
import TextInput from "../../common/styled/TextInput";
import Select from "../../common/styled/select/Select";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type LieuDitEditProps = {
  defaultValues?: UpsertLocalityInput | null;
  defaultDepartmentId?: string;
  onCancel?: () => void;
  onSubmit: SubmitHandler<UpsertLocalityInput>;
};

const LieuDitEdit: FunctionComponent<LieuDitEditProps> = (props) => {
  const { defaultValues, defaultDepartmentId, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    setValue,
    getValues,
    control,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<UpsertLocalityInput>({
    defaultValues: {
      nom: "",
      altitude: undefined,
      latitude: undefined,
      longitude: undefined,
      townId: "",
      ...defaultValues,
    },
    resolver: zodResolver(upsertLocalityInput),
  });

  const [selectedDepartmentId, setSelectedDepartmentId] = useState(defaultDepartmentId);

  const {
    data: departments,
    isError: errorDepartements,
    isFetching: fetchingDepartements,
  } = useApiQuery(
    {
      path: "/departments",
      queryParams: {
        orderBy: "code",
        sortOrder: "asc",
      },
      schema: getDepartmentsResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const {
    data: dataTowns,
    isError: errorTowns,
    isFetching: fetchingTowns,
  } = useApiQuery(
    {
      path: "/towns",
      queryParams: {
        departmentId: selectedDepartmentId,
        orderBy: "code",
        sortOrder: "asc",
      },
      schema: getTownsResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
      enabled: !!selectedDepartmentId,
    }
  );

  // When the list of towns change, reset the selection if no longer in the new list
  useEffect(() => {
    const selectedCommuneId = getValues("townId");
    if (selectedCommuneId && !fetchingTowns && !dataTowns?.data.map(({ id }) => id).includes(selectedCommuneId)) {
      setValue("townId", "", { shouldValidate: true });
    }
  }, [dataTowns, fetchingTowns, getValues, setValue]);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (errorTowns || errorDepartements) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [errorTowns, errorDepartements, displayNotification, t]);

  const handleOnChangeDepartment = (newDepartment: Department | undefined) => {
    setSelectedDepartmentId(newDepartment?.id);
  };

  const selectedDepartment =
    departments?.data?.find((department) => {
      return department.id === selectedDepartmentId;
    }) ?? null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-4">
        <Select
          selectClassName="basis-1/4"
          label={t("department")}
          data={departments?.data}
          value={selectedDepartment}
          onChange={handleOnChangeDepartment}
          renderValue={(dept) => {
            return dept?.code ?? "";
          }}
        />

        <FormSelect
          selectClassName="basis-3/4"
          name="townId"
          label={t("town")}
          required
          control={control}
          data={dataTowns?.data}
          renderValue={({ code, nom }) => `${code} - ${nom}`}
        />
      </div>

      <TextInput label={t("localityName")} type="text" required {...register("nom")} />

      <h3 className="font-semibold mt-6">{t("localityCoordinates")}</h3>

      <div className="flex gap-4">
        <TextInput
          textInputClassName="basis-1/3"
          label={t("latitudeWithUnit")}
          type="number"
          step="any"
          required
          {...register("latitude", {
            valueAsNumber: true,
          })}
        />

        <TextInput
          textInputClassName="basis-1/3"
          label={t("longitudeWithUnit")}
          type="number"
          step="any"
          required
          {...register("longitude", {
            valueAsNumber: true,
          })}
        />

        <TextInput
          textInputClassName="basis-1/3"
          label={t("altitudeWithUnit")}
          type="number"
          step="any"
          required
          {...register("altitude", {
            valueAsNumber: true,
          })}
        />
      </div>

      <EntityUpsertFormActionButtons
        className="mt-6"
        onCancelClick={onCancel}
        disabled={fetchingTowns || fetchingDepartements || !isValid || !isDirty}
      />
    </form>
  );
};

export default LieuDitEdit;
