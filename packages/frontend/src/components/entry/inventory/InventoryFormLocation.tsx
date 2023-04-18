import { useContext, useEffect, useState, type FunctionComponent } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import { EntryCustomCoordinatesContext } from "../../../contexts/EntryCustomCoordinatesContext";
import usePrevious from "../../../hooks/usePrevious";
import FormAutocomplete from "../../common/form/FormAutocomplete";
import TextInput from "../../common/styled/TextInput";
import { AUTOCOMPLETE_DEPARTMENTS_QUERY, AUTOCOMPLETE_TOWNS_QUERY } from "./InventoryFormQueries";
import { type UpsertInventoryInput } from "./inventory-form-types";

type InventoryFormLocationProps = Pick<
  UseFormReturn<UpsertInventoryInput>,
  "control" | "register" | "getValues" | "setValue"
>;

const InventoryFormLocation: FunctionComponent<InventoryFormLocationProps> = ({
  control,
  register,
  getValues,
  setValue,
}) => {
  const { t } = useTranslation();

  // TODO: Think about how to sync this
  const { customCoordinates, updateCustomCoordinates } = useContext(EntryCustomCoordinatesContext);

  const [departmentsInput, setDepartmentsInput] = useState("");
  const [townsInput, setTownsInput] = useState("");

  // TODO check if useWatch properly updates the form status e.g. when clearing locality
  const department = useWatch({ control, name: "department" });
  const previousDepartment = usePrevious(department);

  const town = useWatch({ control, name: "town" });
  const previousTown = usePrevious(town);

  // On department change, reset town
  useEffect(() => {
    if (previousDepartment && previousDepartment.id !== department?.id) {
      setValue("town", null);
    }
  }, [department, previousDepartment]);

  // On town change, reset locality
  useEffect(() => {
    if (previousTown && previousTown.id !== town?.id) {
      console.log("RESET LOCALITY", previousTown, town);
    }
  }, [town, previousTown]);

  // TODO On locality change, reset coordinates

  // TODO Handle altitude call
  // TODO Handle custom coordinates info message

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
  });

  return (
    <>
      <div className="flex gap-2">
        <FormAutocomplete
          data={dataDepartments?.departements?.data ?? []}
          name="department"
          label={t("department")}
          control={control}
          onInputChange={setDepartmentsInput}
          renderValue={({ code }) => code}
          autocompleteClassName="w-28"
          labelTextClassName="first-letter:capitalize"
        />
        <FormAutocomplete
          data={department?.id != null && dataTowns?.communes?.data ? dataTowns.communes.data : []}
          name="town"
          label={t("town")}
          control={control}
          decorationKey="code"
          onInputChange={setTownsInput}
          renderValue={({ nom }) => nom}
          autocompleteClassName="flex-grow"
          labelTextClassName="first-letter:capitalize"
        />
      </div>
      TODO <br />
      <div className="flex gap-2">
        <TextInput
          {...register("customLatitude", {
            min: -90,
            max: 90,
            validate: {
              allCustomCoordinates: () => {
                const customCoordinatesElements = getValues(["customLatitude", "customLongitude", "customAltitude"]);
                return (
                  customCoordinatesElements.every((elt) => elt != null && elt !== "") ||
                  customCoordinatesElements.every((elt) => elt == null || elt === "")
                );
              },
            },
          })}
          textInputClassName="flex-grow w-24 py-1"
          label={t("latitude")}
          type="number"
          step="any"
        />
        <TextInput
          {...register("customLongitude", {
            min: -180,
            max: 180,
          })}
          textInputClassName="flex-grow w-24 py-1"
          label={t("longitude")}
          type="number"
          step="any"
        />
        <TextInput
          {...register("customAltitude", {
            min: -1000,
            max: 9000,
          })}
          textInputClassName="flex-grow w-24 py-1"
          label={t("altitude")}
          type="number"
        />
      </div>
    </>
  );
};

export default InventoryFormLocation;
