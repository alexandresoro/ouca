import { type UpsertClassInput } from "@ou-ca/common/api/species-class";
import { type SpeciesClass } from "@ou-ca/common/entities/species-class";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import ClasseEdit from "./ClasseEdit";

type ClasseUpdateProps = {
  speciesClass: SpeciesClass;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertClassInput) => void;
};

const ClasseUpdate: FunctionComponent<ClasseUpdateProps> = ({ speciesClass, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertClassInput> = (input) => {
    onSubmit(speciesClass.id, input);
  };

  return <ClasseEdit defaultValues={speciesClass} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default ClasseUpdate;
