/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type InventoryExtended } from "@ou-ca/common/api/entities/inventory";
import { useEffect, useState, type FunctionComponent } from "react";
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
import { MAP_STYLE_PROVIDERS } from "../../../maps/map-style-providers";

type InventoryMapProps = {
  inventory: InventoryExtended;
};

const InventoryMap: FunctionComponent<InventoryMapProps> = ({ inventory }) => {
  const { t } = useTranslation();

  const inventoryCoordinates = inventory.customizedCoordinates ?? inventory.locality.coordinates;

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    zoom: 15,
  });
  useEffect(() => {
    const inventoryCoordinates = inventory.customizedCoordinates ?? inventory.locality.coordinates;
    setViewState((viewState) => {
      return {
        ...viewState,
        longitude: inventoryCoordinates.longitude,
        latitude: inventoryCoordinates.latitude,
      };
    });
  }, [inventory]);

  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLE_PROVIDERS>("ign");

  const [displayCoordinatesInfoPopup, setDisplayCoordinatesInfoPopup] = useState(false);

  return (
    <div className="flex flex-col card border-2 border-primary shadow-xl">
      <div className="h-80">
        <ReactMapGl
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          mapStyle={MAP_STYLE_PROVIDERS[mapStyle].mapboxStyle as any}
          style={{
            borderRadius: "14px",
          }}
        >
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
      <div className="absolute top-2.5 mx-auto left-0 right-0 flex flex-grow items-center justify-center opacity-90">
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
};

export default InventoryMap;
