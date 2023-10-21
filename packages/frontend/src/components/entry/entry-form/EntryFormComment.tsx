import { type FunctionComponent } from "react";
import { useFormState, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextArea from "../../common/styled/TextArea";
import { type EntryFormState } from "./EntryFormState";

type EntryFormCommentProps = Pick<UseFormReturn<EntryFormState>, "control" | "register">;

const EntryFormComment: FunctionComponent<EntryFormCommentProps> = ({ register, control }) => {
  const { t } = useTranslation();

  const { errors } = useFormState({ control });

  return (
    <TextArea
      {...register("comment", {
        setValueAs: (v: string) => (v?.length ? v : null),
      })}
      label={t("comments")}
      className="h-16"
      labelTextClassName="first-letter:capitalize"
      hasError={!!errors.comment}
    />
  );
};

export default EntryFormComment;
