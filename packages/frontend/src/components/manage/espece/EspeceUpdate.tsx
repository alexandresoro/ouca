import { type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { type Species } from "@ou-ca/common/entities/species";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import EspeceEdit from "./EspeceEdit";

type EspeceUpdateProps = {
  species: Species;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertSpeciesInput) => void;
};

const EspeceUpdate: FunctionComponent<EspeceUpdateProps> = ({ species, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertSpeciesInput> = (input) => {
    onSubmit(species.id, input);
  };

  return (
    <EspeceEdit
      defaultValues={{ ...species, classId: species.classId ?? undefined }}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  );
};

export default EspeceUpdate;
