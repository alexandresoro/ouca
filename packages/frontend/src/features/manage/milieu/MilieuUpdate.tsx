import type { Environment } from "@ou-ca/common/api/entities/environment";
import type { UpsertEnvironmentInput } from "@ou-ca/common/api/environment";
import type { FunctionComponent } from "react";
import type { SubmitHandler } from "react-hook-form";
import MilieuEdit from "./MilieuEdit";

type MilieuUpdateProps = {
  environment: Environment;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertEnvironmentInput) => void;
};

const MilieuUpdate: FunctionComponent<MilieuUpdateProps> = ({ environment, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertEnvironmentInput> = (input) => {
    onSubmit(environment.id, input);
  };

  return <MilieuEdit defaultValues={environment} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default MilieuUpdate;
