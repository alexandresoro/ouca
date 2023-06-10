import { getDepartmentResponse } from "@ou-ca/common/api/department";
import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { getTownResponse } from "@ou-ca/common/api/town";
import { type Department } from "@ou-ca/common/entities/department";
import { type Locality } from "@ou-ca/common/entities/locality";
import { type Town } from "@ou-ca/common/entities/town";
import { InfoCircle } from "@styled-icons/boxicons-regular";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState, type ChangeEventHandler, type FunctionComponent } from "react";
import { type UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery as useQueryGql } from "urql";
import { altitudeServiceStatusAtom } from "../../../atoms/altitudeServiceAtom";
import {
  areCoordinatesCustomizedFromLocalityAtom,
  inventoryAltitudeAtom,
  inventoryLatitudeAtom,
  inventoryLocalityAtom,
  inventoryLongitudeAtom,
} from "../../../atoms/inventoryFormAtoms";
import useApiQuery from "../../../hooks/api/useApiQuery";
import TextInput from "../../common/styled/TextInput";
import Autocomplete from "../../common/styled/select/Autocomplete";
import {
  AUTOCOMPLETE_DEPARTMENTS_QUERY,
  AUTOCOMPLETE_LOCALITIES_QUERY,
  AUTOCOMPLETE_TOWNS_QUERY,
} from "./InventoryFormQueries";

type InventoryFormLocationProps = { register: UseFormRegister<UpsertInventoryInput> } & {
  defaultDepartment?: Department;
};

const renderDepartment = (department: Department | null): string => {
  return department?.code ?? "";
};

const renderTown = (town: Town | null): string => {
  return town?.nom ?? "";
};

const renderLocality = (locality: Locality | null): string => {
  return locality?.nom ?? "";
};

const InventoryFormLocation: FunctionComponent<InventoryFormLocationProps> = ({ register, defaultDepartment }) => {
  const { t } = useTranslation();

  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [departmentsInput, setDepartmentsInput] = useState("");
  const { data: department } = useApiQuery(
    {
      path: `/departments/${departmentId!}`,
      schema: getDepartmentResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
      enabled: departmentId != null,
    }
  );
  useEffect(() => {
    setDepartmentsInput(renderDepartment(department ?? null));
  }, [department]);
  useEffect(() => {
    if (defaultDepartment != null) {
      setDepartmentId(defaultDepartment.id);
    }
  }, [defaultDepartment]);

  const [townId, setTownId] = useState<string | null>(null);
  const [townsInput, setTownsInput] = useState("");
  const { data: town } = useApiQuery(
    {
      path: `/towns/${townId!}`,
      schema: getTownResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
      enabled: townId != null,
    }
  );
  useEffect(() => {
    setTownsInput(renderTown(town ?? null));
  }, [town]);

  const [localityInput, setLocalityInput] = useState("");
  const [locality, setLocality] = useAtom(inventoryLocalityAtom);
  useEffect(() => {
    setLocalityInput(renderLocality(locality ?? null));
  }, [locality]);

  const setLatitude = useSetAtom(inventoryLatitudeAtom);
  const setLongitude = useSetAtom(inventoryLongitudeAtom);
  const setAltitude = useSetAtom(inventoryAltitudeAtom);

  const areCoordinatesCustomized = useAtomValue(areCoordinatesCustomizedFromLocalityAtom);

  const altitudeServiceStatus = useAtomValue(altitudeServiceStatusAtom);

  // Only display altitude loading service if it takes too long
  const [altitudeCallOngoing, setAltitudeCallOngoing] = useState(false);
  useEffect(() => {
    let altitudeCallOngoingTimeout: NodeJS.Timeout;
    if (altitudeServiceStatus === "ongoing") {
      altitudeCallOngoingTimeout = setTimeout(() => {
        setAltitudeCallOngoing(true);
      }, 500);
    } else {
      setAltitudeCallOngoing(false);
    }
    return () => {
      clearTimeout(altitudeCallOngoingTimeout);
    };
  }, [altitudeServiceStatus]);

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
          <InfoCircle className="h-4 flex-shrink-0" />
          {t("inventoryForm.customCoordinatesInformation")}
        </div>
      )}
      {altitudeCallOngoing && (
        <div className="alert alert-info py-1 text-sm">
          <InfoCircle className="h-4 flex-shrink-0" />
          {t("inventoryForm.altitudeCallOngoing")}
        </div>
      )}
      {altitudeServiceStatus === "error" && (
        <div className="alert alert-warning py-1 text-sm">
          <InfoCircle className="h-4 flex-shrink-0" />
          {t("inventoryForm.altitudeCallError")}
        </div>
      )}
    </>
  );
};

export default InventoryFormLocation;
