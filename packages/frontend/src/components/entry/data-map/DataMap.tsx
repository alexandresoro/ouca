import "leaflet/dist/leaflet.css";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { ScaleControl as LeafletScaleControl, MapContainer, TileLayer } from "react-leaflet";
// rome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { FullscreenControl, Layer, Map, NavigationControl, ScaleControl, Source, type ViewState } from "react-map-gl";
import PhotosViewMapOpacityControl from "./PhotosViewMapOpacityControl";
import { MAP_PROVIDERS } from "./map-providers";

const DataMap: FunctionComponent = () => {
  const { t } = useTranslation();

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: 0,
    latitude: 45,
    zoom: 11,
  });

  const [mapProvider, setMapProvider] = useState<keyof typeof MAP_PROVIDERS>("ign");

  const [overlayOpacity, setOverlayOpacity] = useState(0);

  return (
    <div className="flex flex-col">
      <div className="flex my-4 items-center justify-between">
        <div className="btn-group">
          {Object.entries(MAP_PROVIDERS).map(([providerKey, providerConfig]) => {
            return (
              <button
                key={providerKey}
                className={`btn btn-xs ${mapProvider === providerKey ? "btn-active" : ""}`}
                onClick={() => setMapProvider(providerKey as keyof typeof MAP_PROVIDERS)}
              >
                {t(providerConfig.nameKey)}
              </button>
            );
          })}
        </div>
        <PhotosViewMapOpacityControl
          value={overlayOpacity}
          onChange={(e) => setOverlayOpacity(+e.currentTarget.value)}
        />
      </div>
      <div className="h-80 lg:h-[500px] card border-2 border-primary shadow-xl">
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapLib={maplibregl}
          mapStyle={MAP_PROVIDERS[mapProvider].mapboxStyle}
          style={{
            borderRadius: "14px",
          }}
        >
          {overlayOpacity && (
            <Source
              key="ign-satellite"
              type="raster"
              tiles={[
                "https://wxs.ign.fr/ortho/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal",
              ]}
              tileSize={256}
              attribution={t("maps.maps.ignSatellite.attribution")}
            >
              <Layer type="raster" paint={{ "raster-opacity": overlayOpacity }}></Layer>
            </Source>
          )}
          <NavigationControl />
          <FullscreenControl />
          <ScaleControl unit="metric" />
        </Map>
      </div>
      <MapContainer
        center={[45, 0]}
        zoom={12}
        zoomSnap={0.5}
        zoomDelta={0.5}
        className="h-80 lg:h-[500px] card border-2 border-primary shadow-xl"
      >
        <TileLayer
          url="https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&format=image/png&style=normal"
          attribution={t("maps.maps.ign.attribution")}
        ></TileLayer>
        <LeafletScaleControl metric imperial={false} />
      </MapContainer>
    </div>
  );
};

export default DataMap;
