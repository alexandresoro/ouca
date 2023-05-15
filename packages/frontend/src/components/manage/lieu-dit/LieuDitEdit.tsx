import { zodResolver } from "@hookform/resolvers/zod";
import { upsertLocalityInput, type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type Department } from "@ou-ca/common/entities/department";
import { useEffect, useState, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import useSnackbar from "../../../hooks/useSnackbar";
import FormSelect from "../../common/form/FormSelect";
import Select from "../../common/styled/select/Select";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { ALL_DEPARTMENTS } from "../commune/CommuneManageQueries";
import { ALL_COMMUNES_OF_DEPARTEMENT } from "./LieuDitManageQueries";

type LieuDitEditProps = {
  title: string;
  defaultValues?: UpsertLocalityInput | null;
  defaultDepartmentId?: string;
  onSubmit: SubmitHandler<UpsertLocalityInput>;
};

const LieuDitEdit: FunctionComponent<LieuDitEditProps> = (props) => {
  const { title, defaultValues, defaultDepartmentId, onSubmit } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

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
      coordinatesSystem: "gps",
      ...defaultValues,
    },
    resolver: zodResolver(upsertLocalityInput),
  });

  const [selectedDepartmentId, setSelectedDepartmentId] = useState(defaultDepartmentId);

  const [{ data: dataDepartements, error: errorDepartements, fetching: fetchingDepartements }] = useQuery({
    query: ALL_DEPARTMENTS,
    variables: {
      orderBy: "code",
      sortOrder: "asc",
    },
  });

  // Workaround as GQL return ids as number and rest returns strings
  const reshapedDepartments = dataDepartements?.departements?.data?.map((department) => {
    const { id, ...rest } = department;
    return {
      ...rest,
      id: `${id}`,
    };
  });

  const [{ data: dataTowns, error: errorTowns, fetching: fetchingTowns }] = useQuery({
    query: ALL_COMMUNES_OF_DEPARTEMENT,
    variables: {
      departmentId: selectedDepartmentId ? parseInt(selectedDepartmentId) : undefined,
      orderBy: "code",
      sortOrder: "asc",
    },
    pause: !selectedDepartmentId,
  });

  // Workaround as GQL return ids as number and rest returns strings
  const reshapedTowns = dataTowns?.communes?.data?.map((town) => {
    const { id, ...rest } = town;
    return {
      ...rest,
      id: `${id}`,
    };
  });

  // When the list of towns change, reset the selection if no longer in the new list
  useEffect(() => {
    const selectedCommuneId = getValues("townId");
    if (selectedCommuneId && !fetchingTowns && !reshapedTowns?.map(({ id }) => id).includes(selectedCommuneId)) {
      setValue("townId", "", { shouldValidate: true });
    }
  }, [reshapedTowns, fetchingTowns, getValues, setValue]);

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
    reshapedDepartments?.find((department) => {
      return department.id === selectedDepartmentId;
    }) ?? null;

  return (
    <>
      <ManageTopBar title={t("localities")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex gap-4">
                <Select
                  selectClassName="basis-1/4"
                  label={t("department")}
                  data={reshapedDepartments}
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
                  control={control}
                  data={reshapedTowns}
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
                onCancelClick={() => navigate("..")}
                disabled={fetchingTowns || fetchingDepartements || !isValid || !isDirty}
              />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default LieuDitEdit;
