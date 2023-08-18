import { type UpsertAgeInput } from "@ou-ca/common/api/age";
import { type Age } from "@ou-ca/common/entities/age";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import AgeEdit from "./AgeEdit";

type AgeUpdateProps = {
  age: Age;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertAgeInput) => void;
};

const AgeUpdate: FunctionComponent<AgeUpdateProps> = ({ age, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertAgeInput> = (input) => {
    onSubmit(age.id, input);
  };

  return <AgeEdit defaultValues={age} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default AgeUpdate;
