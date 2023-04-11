import "leaflet/dist/leaflet.css";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { LayersControl, MapContainer, ScaleControl, TileLayer } from "react-leaflet";

const DataMap: FunctionComponent = () => {
  const { t } = useTranslation();

  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  return (
    <>
      <input
        className="range range-xs range-secondary w-20"
        type="range"
        min="0"
        max="1"
        value={overlayOpacity}
        step={0.1}
        onChange={(v) => setOverlayOpacity(+v.currentTarget.value)}
      />
      <MapContainer zoomSnap={0.5} zoomDelta={0.5} className="h-[600px] card border-2 border-primary shadow-xl">
        <LayersControl>
          <LayersControl.BaseLayer checked name={t("maps.openStreetMap.name")}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution={t("maps.openStreetMap.attribution")}
            ></TileLayer>
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={t("maps.openTopoMap.name")}>
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution={t("maps.openTopoMap.attribution")}
              maxZoom={17}
            ></TileLayer>
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={t("maps.ign.name")}>
            <TileLayer
              url="https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&format=image/png&style=normal"
              attribution={t("maps.ign.attribution")}
            ></TileLayer>
          </LayersControl.BaseLayer>
          <LayersControl.Overlay name={t("maps.ignSatellite.name")}>
            <TileLayer
              url="https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal"
              attribution={t("maps.ignSatellite.attribution")}
              opacity={overlayOpacity}
            ></TileLayer>
          </LayersControl.Overlay>
        </LayersControl>
        <ScaleControl metric imperial={false} />
      </MapContainer>
    </>
  );
};

export default DataMap;
