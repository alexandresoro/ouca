import { type FunctionComponent } from "react";
import { type UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextArea from "../../common/styled/TextArea";
import { type EntryFormState } from "./EntryFormState";

type EntryFormCommentProps = { register: UseFormRegister<EntryFormState> };

const EntryFormComment: FunctionComponent<EntryFormCommentProps> = ({ register }) => {
  const { t } = useTranslation();

  return (
    <TextArea
      {...register("comment", {
        setValueAs: (v: string) => (v?.length ? v : null),
      })}
      label={t("comments")}
      labelTextClassName="first-letter:capitalize"
    />
  );
};

export default EntryFormComment;
