import { type NumberEstimate } from "@ou-ca/common/api/entities/number-estimate";
import { type UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import EstimationNombreEdit from "./EstimationNombreEdit";

type EstimationNombreProps = {
  numberEstimate: NumberEstimate;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertNumberEstimateInput) => void;
};

const EstimationNombreUpdate: FunctionComponent<EstimationNombreProps> = ({ numberEstimate, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertNumberEstimateInput> = (input) => {
    onSubmit(numberEstimate.id, input);
  };

  return <EstimationNombreEdit defaultValues={numberEstimate} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default EstimationNombreUpdate;
