import type { Species } from "@ou-ca/common/api/entities/species";
import { useApiSpeciesInfoQuery } from "@services/api/species/api-species-queries";
import { useAtomValue } from "jotai";
import type { FunctionComponent } from "react";
import { searchEntriesCriteriaAtom } from "../searchEntriesCriteriaAtom";

type SearchSpeciesTableRowProps = {
  species: Species;
};

const SearchSpeciesTableRow: FunctionComponent<SearchSpeciesTableRowProps> = ({ species }) => {
  const { data: speciesInfo } = useApiSpeciesInfoQuery(species.id);

  const searchCriteria = useAtomValue(searchEntriesCriteriaAtom);

  return (
    <tr className="hover:bg-base-200" key={species.id}>
      <td>{species.speciesClass?.libelle}</td>
      <td>{species.code}</td>
      <td>{species.nomFrancais}</td>
      <td>{species.nomLatin}</td>
      <td>{searchCriteria.onlyOwnData ? speciesInfo?.ownEntriesCount : speciesInfo?.totalEntriesCount}</td>
    </tr>
  );
};

export default SearchSpeciesTableRow;
