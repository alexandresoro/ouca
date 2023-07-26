import { type DistanceEstimate } from "@ou-ca/common/entities/distance-estimate";
import { type FunctionComponent } from "react";
import { type UseFormReturn } from "react-hook-form";
import { type EntryFormState } from "./EntryFormState";

type EntryFormDistanceRegroupmentProps = Pick<UseFormReturn<EntryFormState>, "control" | "register"> & {
  defaultDistanceEstimate?: DistanceEstimate;
  isDistanceDisplayed?: boolean;
  isRegroupmentDisplayed?: boolean;
};

const EntryFormDistanceRegroupment: FunctionComponent<EntryFormDistanceRegroupmentProps> = ({
  defaultDistanceEstimate,
  isDistanceDisplayed,
  isRegroupmentDisplayed,
}) => {
  return <>TODO</>;
};

export default EntryFormDistanceRegroupment;
