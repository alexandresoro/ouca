import { type FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import TempPage from "../TempPage";

type DataFormProps = {
  isNewEntry?: boolean;
};

const DataForm: FunctionComponent<DataFormProps> = ({ isNewEntry }) => {
  const {
    register,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm({});

  return (
    <div className="container mx-auto flex gap-10">
      <div className="basis-1/3 bg-red-600">
        <TempPage />
      </div>
      <div className="basis-2/3 bg-green-600">
        <TempPage />
      </div>
    </div>
  );
};

export default DataForm;
