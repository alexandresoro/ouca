import TextInput from "@components/base/TextInput";
import { useAtom } from "jotai";
import { type ChangeEventHandler, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFilterCommentAtom } from "../searchEntriesCriteriaAtom";

const SearchFilterComment: FunctionComponent = () => {
  const { t } = useTranslation();

  const [comment, setComment] = useAtom(searchEntriesFilterCommentAtom);

  const onChangeComment: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setComment(value);
  };

  return (
    <>
      <div className={"label px-0 pb-0"}>
        <div className={"label-text uppercase text-base font-semibold"}>{t("comments")}</div>
      </div>
      <TextInput textInputClassName="w-full" value={comment ?? ""} onChange={onChangeComment} />
    </>
  );
};

export default SearchFilterComment;
