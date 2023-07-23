import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import TextArea from "../../common/styled/TextArea";

const EntryCommentForm: FunctionComponent = () => {
  const { t } = useTranslation();

  return <TextArea label={t("comments")} labelTextClassName="first-letter:capitalize" />;
};

export default EntryCommentForm;
