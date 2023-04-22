import { areCoordinatesCustomized as areCoordinatesCustomizedFn } from "@ou-ca/common/coordinates-system/coordinates-helper";
import { InfoCircle } from "@styled-icons/boxicons-regular";
import { useContext, useEffect, useState, type FunctionComponent } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import { EntryCustomCoordinatesContext } from "../../../contexts/EntryCustomCoordinatesContext";
import usePrevious from "../../../hooks/usePrevious";
import { getAltitudeForCoordinates } from "../../../services/ign-alticodage-service";
import FormAutocomplete from "../../common/form/FormAutocomplete";
import TextInput from "../../common/styled/TextInput";
import {
  AUTOCOMPLETE_DEPARTMENTS_QUERY,
  AUTOCOMPLETE_LOCALITIES_QUERY,
  AUTOCOMPLETE_TOWNS_QUERY,
} from "./InventoryFormQueries";
import { type UpsertInventoryInput } from "./inventory-form-types";

type InventoryFormLocationProps = Pick<
  UseFormReturn<UpsertInventoryInput>,
  "control" | "register" | "setValue" | "getFieldState"
>;

const renderDepartment = (department: { code: string }): string => {
  return department.code;
};

const renderTown = (town: { code: number; nom: string }): string => {
  return town.nom;
};

const renderLocality = (locality: { nom: string }): string => {
  return locality.nom;
};

const InventoryFormLocation: FunctionComponent<InventoryFormLocationProps> = ({
  control,
  register,
  setValue,
  getFieldState,
}) => {
  const { t } = useTranslation();

  // TODO: Think about how to sync this
  const { customCoordinates, updateCustomCoordinates } = useContext(EntryCustomCoordinatesContext);

  const department = useWatch({ control, name: "department" });
  const previousDepartment = usePrevious(department);
  // TODO check if this "workaround" behaves properly
  const [departmentsInput, setDepartmentsInput] = useState(department ? renderDepartment(department) : "");

  const town = useWatch({ control, name: "town" });
  const previousTown = usePrevious(town);
  const [townsInput, setTownsInput] = useState(town ? renderTown(town) : "");

  const locality = useWatch({ control, name: "locality" });
  const previousLocality = usePrevious(locality);
  const [localityInput, setLocalityInput] = useState(locality ? renderLocality(locality) : "");
  const [isLocalityInputTainted, setIsLocalityInputTainted] = useState(false);
  const { isDirty: isLocalityDirty } = getFieldState("locality");

  const [latitude, longitude, altitude] = useWatch({ control, name: ["latitude", "longitude", "altitude"] });
  const [isLatitudeInputTainted, setIsLatitudeInputTainted] = useState(false);
  const { isDirty: isLatitudeDirty } = getFieldState("latitude");
  const [isLongitudeInputTainted, setIsLongitudeInputTainted] = useState(false);
  const { isDirty: isLongitudeDirty } = getFieldState("longitude");

  const [altitudeCallOngoing, setAltitudeCallOngoing] = useState(false);
  const [altitudeCallDisplayError, setAltitudeCallDisplayError] = useState(false);

  // On department change, reset town
  useEffect(() => {
    if (previousDepartment && previousDepartment.id !== department?.id) {
      setValue("town", null, { shouldDirty: true, shouldValidate: true });
      setTownsInput("");
    }
  }, [department, previousDepartment, setValue]);

  // On town change, reset locality
  useEffect(() => {
    if (previousTown && previousTown.id !== town?.id) {
      setValue("locality", null, { shouldDirty: true, shouldValidate: true });
      setLocalityInput("");
    }
    // When a town is selected, set the locality as tainted
    // Fixes the case where from a new entry we select a town then a locality
    // and field was not marked tainted yet, so no coordinates were set
    // TODO tried to replace this with previous distinct version, but it has side effects like reset when reselcting the same element
    if (town?.id != null) {
      setIsLocalityInputTainted(true);
    }
  }, [town, previousTown, setValue]);

  useEffect(() => {
    // TODO check what will happen with dirty WHEN changed from map?
    console.log("LOCALITY CHANGED", locality, previousLocality, isLocalityInputTainted);
    if (locality != null && locality.id !== previousLocality?.id && isLocalityInputTainted) {
      setValue("latitude", `${locality.latitude}`, { shouldDirty: true, shouldValidate: true });
      setValue("longitude", `${locality.longitude}`, { shouldDirty: true, shouldValidate: true });
      setValue("altitude", `${locality.altitude}`, { shouldDirty: true, shouldValidate: true });
    } else if (locality === null) {
      setValue("latitude", "", { shouldDirty: true, shouldValidate: true });
      setValue("longitude", "", { shouldDirty: true, shouldValidate: true });
      setValue("altitude", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [locality, previousLocality, isLocalityInputTainted, setValue]);

  // Retrieve altitude call
  useEffect(() => {
    if (latitude.length && longitude.length && (isLatitudeInputTainted || isLongitudeInputTainted)) {
      const infoMessage = setTimeout(() => {
        setAltitudeCallOngoing(true);
      }, 500);
      getAltitudeForCoordinates({ latitude, longitude })
        .then((result) => {
          switch (result.outcome) {
            case "success": {
              setValue("altitude", `${Math.round(result.altitude)}`, { shouldDirty: true, shouldValidate: true });
            }
          }
          // TODO handle error maybe?
        })
        .catch(() => {
          setAltitudeCallDisplayError(true);
        })
        .finally(() => {
          clearTimeout(infoMessage);
          setAltitudeCallOngoing(false);
        });
    }
  }, [latitude, longitude, isLongitudeInputTainted, isLatitudeInputTainted, setValue]);

  // Clean altitude service error when input have changed
  useEffect(() => {
    setAltitudeCallDisplayError(false);
  }, [latitude, longitude, altitude, setAltitudeCallDisplayError]);

  // If the locality field becomes different from the default value at some point, mark it as tainted
  useEffect(() => {
    if (isLocalityDirty) {
      setIsLocalityInputTainted(true);
    }
  }, [isLocalityDirty, setIsLocalityInputTainted]);

  // If the latitude field becomes different from the default value at some point, mark it as tainted
  useEffect(() => {
    if (isLatitudeDirty) {
      setIsLatitudeInputTainted(true);
    }
  }, [isLatitudeDirty, setIsLatitudeInputTainted]);

  // If the longitude field becomes different from the default value at some point, mark it as tainted
  useEffect(() => {
    if (isLongitudeDirty) {
      setIsLongitudeInputTainted(true);
    }
  }, [isLongitudeDirty, setIsLongitudeInputTainted]);

  const [{ data: dataDepartments }] = useQuery({
    query: AUTOCOMPLETE_DEPARTMENTS_QUERY,
    variables: {
      searchParams: {
        q: departmentsInput,
        pageSize: 5,
      },
    },
  });

  const [{ data: dataTowns }] = useQuery({
    query: AUTOCOMPLETE_TOWNS_QUERY,
    variables: {
      searchParams: {
        q: townsInput,
        pageSize: 5,
      },
      departmentId: department?.id,
    },
    pause: department?.id == null,
  });

  const [{ data: dataLocalities }] = useQuery({
    query: AUTOCOMPLETE_LOCALITIES_QUERY,
    variables: {
      searchParams: {
        q: localityInput,
        pageSize: 5,
      },
      townId: town?.id,
    },
    pause: town?.id == null,
  });

  const autocompleteDepartments = dataDepartments?.departements?.data ?? [];
  const autocompleteTowns = department?.id != null && dataTowns?.communes?.data ? dataTowns.communes.data : [];
  const autocompleteLocalities =
    town?.id != null && dataLocalities?.lieuxDits?.data ? dataLocalities.lieuxDits.data : [];

  // Handle custom coordinates info message
  const areCoordinatesCustomized =
    locality != null &&
    areCoordinatesCustomizedFn(locality, parseFloat(altitude), parseFloat(longitude), parseFloat(latitude), "gps");

  return (
    <>
      LOCALITY: {locality?.nom ?? JSON.stringify(locality)}
      <br />
      PREVIOUS LOC : {previousLocality?.nom ?? JSON.stringify(previousLocality)}
      <div className="flex gap-2">
        <FormAutocomplete
          data={autocompleteDepartments}
          name="department"
          label={t("department")}
          control={control}
          onInputChange={setDepartmentsInput}
          renderValue={renderDepartment}
          autocompleteClassName="w-28"
          labelTextClassName="first-letter:capitalize"
        />
        <FormAutocomplete
          data={autocompleteTowns}
          name="town"
          label={t("town")}
          control={control}
          decorationKey="code"
          onInputChange={setTownsInput}
          renderValue={renderTown}
          autocompleteClassName="flex-grow"
          labelTextClassName="first-letter:capitalize"
        />
      </div>
      <FormAutocomplete
        data={autocompleteLocalities}
        name="locality"
        label={t("inventoryForm.locality")}
        control={control}
        rules={{
          required: true,
        }}
        onInputChange={setLocalityInput}
        renderValue={renderLocality}
        labelTextClassName="first-letter:capitalize"
      />
      <div className="flex gap-2">
        <TextInput
          {...register("latitude", {
            min: -90,
            max: 90,
            required: true,
          })}
          textInputClassName="flex-grow w-24 py-1"
          label={t("latitude")}
          type="number"
          step="any"
        />
        <TextInput
          {...register("longitude", {
            min: -180,
            max: 180,
            required: true,
          })}
          textInputClassName="flex-grow w-24 py-1"
          label={t("longitude")}
          type="number"
          step="any"
        />
        <TextInput
          {...register("altitude", {
            min: -1000,
            max: 9000,
            required: true,
          })}
          textInputClassName="flex-grow w-24 py-1"
          label={t("altitude")}
          type="number"
        />
      </div>
      {areCoordinatesCustomized && (
        <div className="flex items-center gap-2 py-1 text-sm text-info">
          <InfoCircle className="h-4 flex-shrink-0" />
          {t("inventoryForm.customCoordinatesInformation")}
        </div>
      )}
      {altitudeCallOngoing && (
        <div className="flex items-center gap-2 py-1 text-sm text-info">
          <InfoCircle className="h-4 flex-shrink-0" />
          {t("inventoryForm.altitudeCallOngoing")}
        </div>
      )}
      {altitudeCallDisplayError && (
        <div className="flex items-center gap-2 py-1 text-sm text-warning">
          <InfoCircle className="h-4 flex-shrink-0" />
          {t("inventoryForm.altitudeCallError")}
        </div>
      )}
    </>
  );
};

export default InventoryFormLocation;
