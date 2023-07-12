import { type FunctionComponent } from "react";
import EntryDetailsCommentForm from "./EntryDetailsCommentForm";
import EntryDetailsSpeciesForm from "./EntryDetailsSpeciesForm";

const EntryDetailsForm: FunctionComponent = () => {
  return (
    <form className="flex flex-col gap-4">
      <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
        <EntryDetailsSpeciesForm />
      </div>
      <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
        <EntryDetailsCommentForm />
      </div>
    </form>
  );
};

export default EntryDetailsForm;
