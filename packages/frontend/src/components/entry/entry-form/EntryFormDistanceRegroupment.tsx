import { getDistanceEstimatesResponse } from "@ou-ca/common/api/distance-estimate";
import { type DistanceEstimate } from "@ou-ca/common/entities/distance-estimate";
import { MagicWand } from "@styled-icons/boxicons-solid";
import { useEffect, useState, type FunctionComponent } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import useApiFetch from "../../../hooks/api/useApiFetch";
import useApiQuery from "../../../hooks/api/useApiQuery";
import TextInput from "../../common/styled/TextInput";
import Autocomplete from "../../common/styled/select/Autocomplete";
import { type EntryFormState } from "./EntryFormState";

type EntryFormDistanceRegroupmentProps = Pick<UseFormReturn<EntryFormState>, "control" | "register" | "setValue"> & {
  defaultDistanceEstimate?: DistanceEstimate;
  isDistanceDisplayed?: boolean;
  isRegroupmentDisplayed?: boolean;
};

const renderDistanceEstimate = (distanceEstimate: DistanceEstimate | null): string => {
  return distanceEstimate?.libelle ?? "";
};

const EntryFormDistanceRegroupment: FunctionComponent<EntryFormDistanceRegroupmentProps> = ({
  register,
  control,
  setValue,
  defaultDistanceEstimate,
  isDistanceDisplayed,
  isRegroupmentDisplayed,
}) => {
  const { t } = useTranslation();

  const [distanceEstimateInput, setDistanceEstimateInput] = useState("");
  const [selectedDistanceEstimate, setSelectedDistanceEstimate] = useState<DistanceEstimate | null>(null);
  useEffect(() => {
    setSelectedDistanceEstimate(defaultDistanceEstimate ?? null);
  }, [defaultDistanceEstimate]);

  const fetchNextRegroupment = useApiFetch({
    schema: z.object({ id: z.number() }),
  });

  const {
    field: { ref: refDistanceEstimate, onChange: onChangeDistanceEstimateForm },
  } = useController({
    name: "distanceEstimateId",
    control,
  });

  useEffect(() => {
    // When the selected distanceEstimate changes, update both the input and the form value
    setDistanceEstimateInput(renderDistanceEstimate(selectedDistanceEstimate));
    onChangeDistanceEstimateForm(selectedDistanceEstimate?.id ?? null);
  }, [selectedDistanceEstimate, onChangeDistanceEstimateForm]);

  const { data: dataDistanceEstimates } = useApiQuery(
    {
      path: "/distance-estimates",
      queryParams: {
        q: distanceEstimateInput,
        pageSize: 5,
      },
      schema: getDistanceEstimatesResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
      enabled: isDistanceDisplayed,
    }
  );

  const generateRegroupment = () => {
    void fetchNextRegroupment({
      path: "/entries/next-regroupment",
    }).then(({ id: nextRegroupment }) => {
      setValue("regroupment", nextRegroupment, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  return (
    <div className="flex gap-16 justify-between">
      {isDistanceDisplayed && (
        <div className="flex gap-4 items-center">
          <Autocomplete
            ref={refDistanceEstimate}
            data={dataDistanceEstimates?.data}
            name="distanceEstimate"
            label={t("entryForm.distancePrecision")}
            onInputChange={setDistanceEstimateInput}
            onChange={setSelectedDistanceEstimate}
            value={selectedDistanceEstimate}
            renderValue={renderDistanceEstimate}
            labelTextClassName="first-letter:capitalize"
          />
          <TextInput
            {...register("distance", {
              setValueAs: (v: string) => (v?.length ? parseInt(v) : typeof v === "number" ? v : null),
            })}
            className="w-32"
            suffix={t("entryForm.distanceUnit")}
            textInputClassName="py-1"
            label={t("entryForm.distance")}
            type="number"
          />
        </div>
      )}
      {isRegroupmentDisplayed && (
        <div className="flex gap-4 items-center">
          <TextInput
            {...register("regroupment", {
              setValueAs: (v: string) => (v?.length ? parseInt(v) : typeof v === "number" ? v : null),
            })}
            textInputClassName="w-36 py-1"
            label={t("entryForm.regroupment")}
            type="number"
          />
          <button type="button" className="btn btn-secondary btn-sm mt-5" onClick={generateRegroupment}>
            <MagicWand className="h-5" />
            {t("entryForm.regroupmentGenerate")}
          </button>
        </div>
      )}
    </div>
  );
};

export default EntryFormDistanceRegroupment;
