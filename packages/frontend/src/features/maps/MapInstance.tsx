import { useAtom, useAtomValue } from "jotai";
import { type PropsWithChildren, forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FullscreenControl,
  Layer,
  type MapProps,
  type MapRef,
  type MapStyleDataEvent,
  NavigationControl,
  Map as ReactMapGl,
  ScaleControl,
  Source,
} from "react-map-gl/maplibre";
import { mapStyleAtom } from "./map-style-atom";
import { type MapProvider, ignSatelliteTileUrl, mapStyleProvidersAtom } from "./map-style-providers";

type MapInstanceProps = {
  containerClassName?: string;
  mapClassName?: string;
  controlsPosition?: "top" | "bottom";
} & Omit<MapProps, "children">;

const MapInstance = forwardRef<MapRef, PropsWithChildren<MapInstanceProps>>((props, ref) => {
  const { containerClassName, mapClassName, controlsPosition, children, ...restProps } = props;

  const { t } = useTranslation();

  const [mapStyle, setMapStyle] = useAtom(mapStyleAtom);
  const mapStyleProviders = useAtomValue(mapStyleProvidersAtom);

  // Ugly workaround to have the satellite layer below the other layers in satellite mode
  const [beforeIdForSatellite, setBeforeIdForSatellite] = useState<string | undefined>(undefined);
  const handleOnStyleData = (event: MapStyleDataEvent) => {
    const map = event.target;
    if (mapStyle === "ignSatellite") {
      const firstLayerId = map.getStyle().layers?.[0].id;
      setBeforeIdForSatellite(firstLayerId);
    } else {
      setBeforeIdForSatellite(undefined);
    }
  };

  return (
    <div className={`card border-2 border-primary shadow-xl ${containerClassName ?? ""}`}>
      <div className={mapClassName ?? ""}>
        <ReactMapGl
          ref={ref}
          mapStyle={mapStyleProviders[mapStyle].mapboxStyle}
          style={{
            borderRadius: "14px",
          }}
          onStyleData={handleOnStyleData}
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          {...(restProps as any)}
        >
          {mapStyle === "ignSatellite" && (
            <Source type="raster" tiles={[ignSatelliteTileUrl]} tileSize={256} attribution="IGN-F/Géoportail">
              <Layer type="raster" beforeId={beforeIdForSatellite} />
            </Source>
          )}
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
          {Object.entries(mapStyleProviders).map(([providerKey, providerConfig]) => {
            return (
              <button
                type="button"
                key={providerKey}
                className={`join-item btn btn-xs uppercase ${mapStyle === providerKey ? "btn-active btn-primary" : ""}`}
                onClick={() => setMapStyle(providerKey as MapProvider)}
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
