import { zodResolver } from "@hookform/resolvers/zod";
import { useNotifications } from "@hooks/useNotifications";
import { type UpsertSpeciesInput, upsertSpeciesInput } from "@ou-ca/common/api/species";
import { getClassesResponse } from "@ou-ca/common/api/species-class";
import { type FunctionComponent, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../../components/base/TextInput";
import FormSelect from "../../../components/form/FormSelect";
import useApiQuery from "../../../hooks/api/useApiQuery";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type EspeceEditProps = {
  defaultValues?: (Omit<UpsertSpeciesInput, "classId"> & { classId?: string }) | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertSpeciesInput>;
};

const EspeceEdit: FunctionComponent<EspeceEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    control,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertSpeciesInput>({
    defaultValues: defaultValues ?? {
      code: "",
      nomFrancais: "",
      nomLatin: "",
      classId: undefined,
    },
    resolver: zodResolver(upsertSpeciesInput),
    mode: "onTouched",
  });

  const {
    data: classes,
    isError: errorClasses,
    isFetching: fetchingClasses,
  } = useApiQuery(
    {
      path: "/classes",
      queryParams: {
        orderBy: "libelle",
        sortOrder: "asc",
      },
      schema: getClassesResponse,
    },
    {
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: "always",
    },
  );

  const { displayNotification } = useNotifications();

  useEffect(() => {
    if (errorClasses) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [errorClasses, displayNotification, t]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSelect
          name="classId"
          label={t("speciesClass")}
          required
          control={control}
          data={classes?.data}
          renderValue={({ libelle }) => libelle}
        />

        <TextInput label={t("speciesCode")} type="text" required {...register("code")} hasError={!!errors.code} />
        <TextInput
          label={t("localizedName")}
          type="text"
          required
          {...register("nomFrancais")}
          hasError={!!errors.nomFrancais}
        />
        <TextInput
          label={t("scientificName")}
          type="text"
          required
          {...register("nomLatin")}
          hasError={!!errors.nomLatin}
        />

        <EntityUpsertFormActionButtons
          className="mt-6"
          onCancelClick={onCancel}
          disabled={fetchingClasses || !isValid || !isDirty}
        />
      </form>
    </>
  );
};

export default EspeceEdit;
