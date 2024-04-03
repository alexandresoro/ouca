/* eslint-disable @typescript-eslint/no-explicit-any */
import { type PropsWithChildren, forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FullscreenControl,
  type MapProps,
  type MapRef,
  NavigationControl,
  Map as ReactMapGl,
  ScaleControl,
} from "react-map-gl/maplibre";
import { MAP_STYLE_PROVIDERS } from "./map-style-providers";

type MapInstanceProps = {
  containerClassName?: string;
  mapClassName?: string;
  controlsPosition?: "top" | "bottom";
} & Omit<MapProps, "children">;

const MapInstance = forwardRef<MapRef, PropsWithChildren<MapInstanceProps>>((props, ref) => {
  const { containerClassName, mapClassName, controlsPosition, children, ...restProps } = props;

  const { t } = useTranslation();

  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLE_PROVIDERS>("ign");

  return (
    <div className={`card border-2 border-primary shadow-xl ${containerClassName ?? ""}`}>
      <div className={mapClassName ?? ""}>
        <ReactMapGl
          ref={ref}
          mapStyle={MAP_STYLE_PROVIDERS[mapStyle].mapboxStyle}
          style={{
            borderRadius: "14px",
          }}
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          {...(restProps as any)}
        >
          {children}
          <NavigationControl />
          <FullscreenControl />
          <ScaleControl unit="metric" />
        </ReactMapGl>
      </div>
      <div
        className={`absolute ${
          controlsPosition === "top" ? "top-2.5" : "bottom-2.5"
        } mx-auto left-0 right-0 flex flex-grow items-center justify-center opacity-90`}
      >
        <div className="join">
          {Object.entries(MAP_STYLE_PROVIDERS).map(([providerKey, providerConfig]) => {
            return (
              <button
                type="button"
                key={providerKey}
                className={`join-item btn btn-xs uppercase ${mapStyle === providerKey ? "btn-active btn-primary" : ""}`}
                onClick={() => setMapStyle(providerKey as keyof typeof MAP_STYLE_PROVIDERS)}
              >
                {t(providerConfig.nameKey)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default MapInstance;
