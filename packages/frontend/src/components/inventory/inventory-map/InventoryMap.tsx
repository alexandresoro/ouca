/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type InventoryExtended } from "@ou-ca/common/entities/inventory";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  FullscreenControl,
  Marker,
  NavigationControl,
  Popup,
  Map as ReactMapGl,
  ScaleControl,
  type ViewState,
} from "react-map-gl/maplibre";
import { MAP_STYLE_PROVIDERS } from "../../common/maps/map-style-providers";

type InventoryMapProps = {
  inventory: InventoryExtended;
};

const InventoryMap: FunctionComponent<InventoryMapProps> = ({ inventory }) => {
  const { t } = useTranslation();

  const inventoryCoordinates = inventory.customizedCoordinates ?? inventory.locality.coordinates;
  const localityCoordinates = inventory.locality.coordinates;

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: inventoryCoordinates.longitude,
    latitude: inventoryCoordinates.latitude,
    zoom: 15,
  });

  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLE_PROVIDERS>("ign");

  const [displayCoordinatesInfoPopup, setDisplayCoordinatesInfoPopup] = useState(false);
  const [displayLocalityInfoPopup, setDisplayLocalityInfoPopup] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="flex my-4 items-center justify-between">
        <div className="join">
          {Object.entries(MAP_STYLE_PROVIDERS).map(([providerKey, providerConfig]) => {
            return (
              <button
                type="button"
                key={providerKey}
                className={`join-item btn btn-xs ${mapStyle === providerKey ? "btn-active btn-primary" : ""}`}
                onClick={() => setMapStyle(providerKey as keyof typeof MAP_STYLE_PROVIDERS)}
              >
                {t(providerConfig.nameKey)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-80 card border-2 border-primary shadow-xl">
        <ReactMapGl
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          // rome-ignore lint/suspicious/noExplicitAny: <explanation>
          mapStyle={MAP_STYLE_PROVIDERS[mapStyle].mapboxStyle as any}
          style={{
            borderRadius: "14px",
          }}
        >
          <Marker
            longitude={localityCoordinates.longitude}
            latitude={localityCoordinates.latitude}
            color="#3FB1CE"
            onClick={(e) => {
              // Prevent the event from bubbling to avoid closing directly the popup after open
              e.originalEvent.stopPropagation();
              // TODO add the delete custom point
              setDisplayLocalityInfoPopup(true);
            }}
          />
          <Marker
            longitude={inventoryCoordinates.longitude}
            latitude={inventoryCoordinates.latitude}
            color="#b9383c"
            onClick={(e) => {
              // Prevent the event from bubbling to avoid closing directly the popup after open
              e.originalEvent.stopPropagation();
              // TODO add the delete custom point
              setDisplayCoordinatesInfoPopup(true);
            }}
          />
          {displayLocalityInfoPopup && (
            <Popup
              longitude={localityCoordinates.longitude}
              latitude={localityCoordinates.latitude}
              offset={[15, -5] as [number, number]}
              focusAfterOpen={false}
              onClose={() => setDisplayLocalityInfoPopup(false)}
              anchor="left"
              closeOnClick
            >
              <div className="flex flex-col items-center text-gray-700">
                <div>{t("inventoryMap.localityPosition")}</div>
                <div className="font-semibold">{`${inventory.locality.nom}`}</div>
                <div className="font-semibold">{`${inventory.locality.townName} (${inventory.locality.departmentCode})`}</div>
              </div>
            </Popup>
          )}
          {displayCoordinatesInfoPopup && (
            <Popup
              longitude={inventoryCoordinates.longitude}
              latitude={inventoryCoordinates.latitude}
              offset={[-15, -5] as [number, number]}
              focusAfterOpen={false}
              onClose={() => setDisplayCoordinatesInfoPopup(false)}
              anchor="right"
              closeOnClick
            >
              <div className="flex flex-col items-center text-gray-700">
                <div>{t("inventoryMap.inventoryPosition")}</div>
              </div>
            </Popup>
          )}
          <NavigationControl />
          <FullscreenControl />
          <ScaleControl unit="metric" />
        </ReactMapGl>
      </div>
    </div>
  );
};

export default InventoryMap;
