import { type ComponentPropsWithoutRef, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type PhotosViewMapOpacityControlProps = ComponentPropsWithoutRef<"input">;

const PhotosViewMapOpacityControl: FunctionComponent<PhotosViewMapOpacityControlProps> = (props) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">{t("maps.opacityPhotosLabel")}</span>
      <input
        className={`range range-xs cursor-default w-24 ${props.disabled ? "" : "range-primary"}`}
        type="range"
        min="0"
        max="1"
        step={0.1}
        onDrag={(e) => e.preventDefault()}
        onDragCapture={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
        {...props}
      />
    </div>
  );
};

export default PhotosViewMapOpacityControl;
