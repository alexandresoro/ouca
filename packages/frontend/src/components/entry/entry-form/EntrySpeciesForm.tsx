import { getSpeciesPaginatedResponse } from "@ou-ca/common/api/species";
import { getClassesResponse } from "@ou-ca/common/api/species-class";
import { type Species } from "@ou-ca/common/entities/species";
import { type SpeciesClass } from "@ou-ca/common/entities/species-class";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import Autocomplete from "../../common/styled/select/Autocomplete";

type EntrySpeciesFormProps = {
  autofocusOnSpecies?: boolean;
};

const renderSpeciesClass = (speciesClass: SpeciesClass | null): string => {
  return speciesClass?.libelle ?? "";
};

const renderSpecies = (species: Species | null): string => {
  return species ? `${species.code} - ${species.nomFrancais} - ${species.nomLatin}` : "";
};

const EntrySpeciesForm: FunctionComponent<EntrySpeciesFormProps> = ({ autofocusOnSpecies }) => {
  const { t } = useTranslation();

  const [classInput, setClassInput] = useState("");
  const [selectedClass, setSelectedClass] = useState<SpeciesClass | null>(null);

  const [speciesInput, setSpeciesInput] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

  const { data: dataClasses } = useApiQuery(
    {
      path: "/classes",
      queryParams: {
        q: classInput,
        pageSize: 5,
      },
      schema: getClassesResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const { data: dataSpecies } = useApiQuery(
    {
      path: "/species",
      queryParams: {
        q: speciesInput,
        pageSize: 5,
        classIds: selectedClass?.id,
      },
      schema: getSpeciesPaginatedResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  // Handle when class is changed by the user
  const handleClassChange = (newClass: SpeciesClass | null) => {
    setSelectedClass(newClass);

    // On class change, reset species if it does not belong to class anymore
    if (selectedSpecies != null && newClass != null && selectedSpecies.classId !== newClass?.id) {
      setSelectedSpecies(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Autocomplete
        autocompleteClassName="basis-1/4"
        inputProps={{
          // Species class field should not be focusable
          tabIndex: -1,
        }}
        data={dataClasses?.data}
        name="class"
        label={t("speciesClass")}
        onInputChange={setClassInput}
        onChange={handleClassChange}
        value={selectedClass}
        renderValue={renderSpeciesClass}
        labelTextClassName="first-letter:capitalize"
      />
      <Autocomplete
        autocompleteClassName="basis-3/4"
        inputProps={{
          autoFocus: autofocusOnSpecies,
        }}
        data={dataSpecies?.data}
        name="species"
        label={t("speciesSingular")}
        onInputChange={setSpeciesInput}
        onChange={setSelectedSpecies}
        value={selectedSpecies}
        renderValue={renderSpecies}
        labelTextClassName="first-letter:capitalize"
      />
    </div>
  );
};

export default EntrySpeciesForm;
