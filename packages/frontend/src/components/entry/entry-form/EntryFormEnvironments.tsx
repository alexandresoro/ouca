import { type Environment } from "@ou-ca/common/entities/environment";
import { type FunctionComponent } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { type EntryFormState } from "./EntryFormState";

type EntryFormEnvironmentsProps = Pick<UseFormReturn<EntryFormState>, "control"> & {
  initialEnvironments?: Environment[];
};

const EntryFormEnvironments: FunctionComponent<EntryFormEnvironmentsProps> = ({ control, initialEnvironments }) => {
  const { t } = useTranslation();

  return <></>;
};

export default EntryFormEnvironments;
