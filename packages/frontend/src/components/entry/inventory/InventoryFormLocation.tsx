import { getDepartmentResponse } from "@ou-ca/common/api/department";
import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { getTownResponse } from "@ou-ca/common/api/town";
import { type Department } from "@ou-ca/common/entities/department";
import { type Locality } from "@ou-ca/common/entities/locality";
import { type Town } from "@ou-ca/common/entities/town";
import { InfoCircle } from "@styled-icons/boxicons-regular";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ChangeEventHandler, type FunctionComponent } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery as useQueryGql } from "urql";
import TextInput from "../../common/styled/TextInput";
import Autocomplete from "../../common/styled/select/Autocomplete";
import {
  AUTOCOMPLETE_DEPARTMENTS_QUERY,
  AUTOCOMPLETE_LOCALITIES_QUERY,
  AUTOCOMPLETE_TOWNS_QUERY,
} from "./InventoryFormQueries";

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

  const queryClient = useQueryClient();

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
      queryClient
        .fetchQuery({
          queryKey: ["IGN", "altimetrie", { latitude, longitude }],
          staleTime: Infinity,
          queryFn: () =>
            getAltitudeForCoordinates({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) }),
        })
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
  }, [latitude, longitude, isLongitudeInputTainted, isLatitudeInputTainted, setValue, queryClient]);

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

  // When the locality changes, make sure that the appropriate town is displayed
  // This can happen when locality is updated from outside the component
  useEffect(() => {
    if (locality != null && locality.townId !== town?.id) {
      setTownId(locality.townId);
    }
  }, [locality, town]);

  // When the town changes, make sure that the appropriate department is displayed
  // This can happen when town is updated from an update of locality outside the component
  useEffect(() => {
    if (town != null && town.departmentId !== department?.id) {
      setDepartmentId(town.departmentId);
    }
  }, [town, department]);

  const [{ data: dataDepartments }] = useQueryGql({
    query: AUTOCOMPLETE_DEPARTMENTS_QUERY,
    variables: {
      searchParams: {
        q: departmentsInput,
        pageSize: 5,
      },
    },
  });

  const [{ data: dataTowns }] = useQueryGql({
    query: AUTOCOMPLETE_TOWNS_QUERY,
    variables: {
      searchParams: {
        q: townsInput,
        pageSize: 5,
      },
      departmentId: department?.id ? parseInt(department.id) : undefined,
    },
    pause: department?.id == null,
  });

  const [{ data: dataLocalities }] = useQueryGql({
    query: AUTOCOMPLETE_LOCALITIES_QUERY,
    variables: {
      searchParams: {
        q: localityInput,
        pageSize: 5,
      },
      townId: town?.id ? parseInt(town.id) : undefined,
    },
    pause: town?.id == null,
  });

  // Reshape GraphQL entities to map REST ones
  // TODO cleanup one migration is complete
  const autocompleteDepartments = dataDepartments?.departements?.data
    ? dataDepartments?.departements?.data.map((department) => {
        return {
          id: `${department.id}`,
          code: department.code,
        } satisfies Department;
      })
    : [];
  const autocompleteTowns =
    department?.id != null && dataTowns?.communes?.data
      ? dataTowns.communes.data.map((town) => {
          return {
            id: `${town.id}`,
            code: town.code,
            nom: town.nom,
            departmentId: `${town.departement.id}`,
          } satisfies Town;
        })
      : [];
  const autocompleteLocalities =
    town?.id != null && dataLocalities?.lieuxDits?.data
      ? dataLocalities.lieuxDits.data.map((locality) => {
          const { id, altitude, latitude, longitude, __typename, coordinatesSystem, commune, ...restLocality } =
            locality;
          return {
            ...restLocality,
            id: `${id}`,
            coordinates: {
              altitude,
              latitude,
              longitude,
            },
            townId: `${commune.id}`,
          } satisfies Locality;
        })
      : [];

  // Handle when department is changed by the user
  const handleDepartmentChange = (newDepartment: Department | null) => {
    setDepartmentId(newDepartment?.id ?? null);

    // On department change, reset town if it does not belong to department anymore
    if (town != null && town.departmentId !== newDepartment?.id) {
      handleTownChange(null);
    }
  };

  // Handle when town is changed by the user
  const handleTownChange = (newTown: Town | null) => {
    setTownId(newTown?.id ?? null);

    if (locality != null && locality.townId !== newTown?.id) {
      handleLocalityChange(null);
    }
  };

  // Handle when locality is changed by the user
  const handleLocalityChange = (newLocality: Locality | null) => {
    void setLocality(newLocality);
  };

  // Handlers when fields are changed manually by the user
  const handleLatitudeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    void setLatitude(event.target.value ? parseFloat(event.target.value) : null);
  };

  const handleLongitudeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    void setLongitude(event.target.value ? parseFloat(event.target.value) : null);
  };

  const handleAltitudeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setAltitude(event.target.value ? parseFloat(event.target.value) : null);
  };

  return (
    <>
      LOCALITY: {locality?.nom ?? JSON.stringify(locality)}
      <br />
      PREVIOUS LOC : {previousLocality?.nom ?? JSON.stringify(previousLocality)}
      <div className="flex gap-2">
        <Autocomplete
          data={autocompleteDepartments}
          name="department"
          label={t("department")}
          onInputChange={setDepartmentsInput}
          onChange={handleDepartmentChange}
          renderValue={renderDepartment}
          value={department ?? null}
          autocompleteClassName="w-28"
          labelTextClassName="first-letter:capitalize"
        />
        <Autocomplete
          data={autocompleteTowns}
          name="town"
          label={t("town")}
          decorationKey="code"
          onInputChange={setTownsInput}
          onChange={handleTownChange}
          renderValue={renderTown}
          value={town ?? null}
          autocompleteClassName="flex-grow"
          labelTextClassName="first-letter:capitalize"
        />
      </div>
      <Autocomplete
        {...register("localityId")}
        data={autocompleteLocalities}
        label={t("inventoryForm.locality")}
        onInputChange={setLocalityInput}
        onChange={handleLocalityChange}
        value={locality}
        renderValue={renderLocality}
        labelTextClassName="first-letter:capitalize"
      />
      <div className="flex gap-2">
        <TextInput
          {...register("coordinates.latitude", {
            valueAsNumber: true,
          })}
          onChange={handleLatitudeChange}
          textInputClassName="flex-grow w-24 py-1"
          label={t("latitude")}
          type="number"
          step="any"
        />
        <TextInput
          {...register("coordinates.longitude", {
            valueAsNumber: true,
          })}
          onChange={handleLongitudeChange}
          textInputClassName="flex-grow w-24 py-1"
          label={t("longitude")}
          type="number"
          step="any"
        />
        <TextInput
          {...register("coordinates.altitude", {
            valueAsNumber: true,
          })}
          onChange={handleAltitudeChange}
          textInputClassName="flex-grow w-24 py-1"
          label={t("altitude")}
          type="number"
        />
      </div>
      {areCoordinatesCustomized && (
        <div className="alert alert-info py-1 text-sm">
          <div>
            <InfoCircle className="h-4 flex-shrink-0" />
            {t("inventoryForm.customCoordinatesInformation")}
          </div>
        </div>
      )}
      {altitudeCallOngoing && (
        <div className="alert alert-info py-1 text-sm">
          <div>
            <InfoCircle className="h-4 flex-shrink-0" />
            {t("inventoryForm.altitudeCallOngoing")}
          </div>
        </div>
      )}
      {altitudeServiceStatus === "error" && (
        <div className="alert alert-warning py-1 text-sm">
          <div>
            <InfoCircle className="h-4 flex-shrink-0" />
            {t("inventoryForm.altitudeCallError")}
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryFormLocation;
