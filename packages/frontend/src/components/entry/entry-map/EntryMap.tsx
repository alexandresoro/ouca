import "leaflet/dist/leaflet.css";
import { Marker as MapLibreMarker } from "maplibre-gl";
import { useContext, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { ScaleControl as LeafletScaleControl, MapContainer, TileLayer } from "react-leaflet";
import {
  FullscreenControl,
  Layer,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
  type ViewState,
} from "react-map-gl";
import { EntryCustomCoordinatesContext } from "../../../contexts/EntryCustomCoordinatesContext";
import MaplibreMap from "../../common/maps/MaplibreMap";
import { MAP_PROVIDERS } from "../../common/maps/map-providers";
import PhotosViewMapOpacityControl from "./PhotosViewMapOpacityControl";

// This is a workaround aswe want to be able to have the popup
// open on marker hover.
// To do that we create a div within Marker, but then, it won't
// display back the default logo + we need to apply the same offset workarounds
const RED_PIN = new MapLibreMarker({
  color: "#b9383c",
});

const EntryMap: FunctionComponent = () => {
  const { t } = useTranslation();

  const { customCoordinates, updateCustomCoordinates } = useContext(EntryCustomCoordinatesContext);

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: 0,
    latitude: 45,
    zoom: 11,
  });

  const [mapProvider, setMapProvider] = useState<keyof typeof MAP_PROVIDERS>("ign");

  const [overlayOpacity, setOverlayOpacity] = useState(0);

  const [displayCoordinatesInfoPopup, setDisplayCoordinatesInfoPopup] = useState(false);

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
        <MaplibreMap
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={MAP_PROVIDERS[mapProvider].mapboxStyle}
          style={{
            borderRadius: "14px",
          }}
        >
          {displayCoordinatesInfoPopup && (
            <Popup
              longitude={customCoordinates.lng}
              latitude={customCoordinates.lat}
              offset={[-15, -35]}
              focusAfterOpen={false}
              closeButton={false}
              onClose={() => setDisplayCoordinatesInfoPopup(false)}
              anchor="right"
            >
              {t("maps.customPosition")}
            </Popup>
          )}
          <Marker
            longitude={customCoordinates.lng}
            latitude={customCoordinates.lat}
            draggable
            color="#b9383c"
            offset={[0, -14]}
            onDragEnd={(e) => updateCustomCoordinates(e.lngLat)}
            onClick={(e) => {
              // Prevent the event from bubbling to avoid closing directly the popup after open
              e.originalEvent.stopPropagation();
              // TODO add the delete custom point
              // setDisplayCustomMarkerPopup(true);
            }}
            anchor="bottom"
          >
            <div
              // rome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              dangerouslySetInnerHTML={{ __html: RED_PIN._element.innerHTML }}
              onMouseEnter={() => setDisplayCoordinatesInfoPopup(true)}
              onMouseLeave={() => setDisplayCoordinatesInfoPopup(false)}
            />
          </Marker>
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
        </MaplibreMap>
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

export default EntryMap;
