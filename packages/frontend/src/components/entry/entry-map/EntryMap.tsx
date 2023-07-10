/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLocalityResponse } from "@ou-ca/common/api/locality";
import { type GeoJSONLocality } from "@ou-ca/common/geojson/geojson-localities";
import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import booleanDisjoint from "@turf/boolean-disjoint";
import booleanWithin from "@turf/boolean-within";
import concave from "@turf/concave";
import { featureCollection, point } from "@turf/helpers";
import { type BBox2d } from "@turf/helpers/dist/js/lib/geojson";
import { featureReduce } from "@turf/meta";
// eslint-disable-next-line import/no-unresolved
import { type Feature, type FeatureCollection, type MultiPolygon, type Point, type Polygon } from "geojson";
import { useAtom, useAtomValue } from "jotai";
import { RESET } from "jotai/utils";
import { type GeoJSONSource } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  FullscreenControl,
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Map as ReactMapGl,
  ScaleControl,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
  type ViewState,
} from "react-map-gl/maplibre";
import {
  areCoordinatesDifferentFromLocalityAtom,
  inventoryCoordinatesAtom,
  inventoryLocalityAtom,
} from "../../../atoms/inventoryFormAtoms";
import { localitySelectionAtom, type LocalitySelectionType } from "../../../atoms/inventoryMapAtom";
import useApiFetch from "../../../hooks/api/useApiFetch";
import useApiQuery from "../../../hooks/api/useApiQuery";
import {
  clusterCountLayer,
  clusterLayer,
  selectionLayer,
  singleLocalityLayer,
} from "../../common/maps/localities-layers";
import { MAP_STYLE_PROVIDERS } from "../../common/maps/map-style-providers";

const EntryMap: FunctionComponent = () => {
  const { t } = useTranslation();

  const mapRef = useRef<MapRef>(null);

  const [inventoryCoordinates, setInventoryCoordinates] = useAtom(inventoryCoordinatesAtom);

  const [selectedLocality, setSelectedLocality] = useAtom(inventoryLocalityAtom);

  const areCoordinatesCustomized = useAtomValue(areCoordinatesDifferentFromLocalityAtom);

  const localitySelection = useAtomValue(localitySelectionAtom);
  const previousSelection = useRef<LocalitySelectionType>(null);

  const { data: localitiesGeoJson } = useApiQuery<FeatureCollection<Point>>(
    {
      path: "/geojson/localities.json",
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 2 * 60 * 60 * 1000,
    }
  );

  // The feature collection containing only localities that
  // match the current selection
  const selectionFeatureCollection = useMemo(() => {
    if (!localitiesGeoJson || !localitySelection) {
      return null;
    }

    // Filter localities that only match the selection
    let propertyField: string;
    switch (localitySelection.type) {
      case "locality":
        propertyField = "id";
        break;
      case "town":
        propertyField = "townId";
        break;
      case "department":
        propertyField = "departmentId";
        break;
      default:
        return;
    }

    const filteredLocalities = featureReduce(
      localitiesGeoJson,
      (previous, current) => {
        if (current.properties?.[propertyField] === localitySelection.id) {
          return [...previous, current];
        }
        return previous;
      },
      [] as Feature<Point>[]
    );

    return featureCollection(filteredLocalities);
  }, [localitySelection, localitiesGeoJson]);

  // Compute the polygon for the selection
  const selectionFeatureCollectionPolygon = useMemo(() => {
    if (!selectionFeatureCollection) {
      return null;
    }
    const selectionPolygon = concave(selectionFeatureCollection);

    if (!selectionPolygon) {
      return null;
    }

    return featureCollection([selectionPolygon]);
  }, [selectionFeatureCollection]);

  // Whenever the selection changes,
  // make sure that the map is focusing on it
  const handleSelectionChange = (selectionCollectionPolygon: FeatureCollection<Polygon | MultiPolygon>) => {
    const currentMap = mapRef.current;
    if (!currentMap || !selectionCollectionPolygon?.features.length) {
      return;
    }

    const currentMapBounds = currentMap.getBounds();
    const currentMapBoundsPolygon = bboxPolygon(
      bbox(
        featureCollection([
          point(currentMapBounds.getSouthWest().toArray()),
          point(currentMapBounds.getNorthEast().toArray()),
        ])
      )
    );

    const shouldMoveToSelection =
      // Zoom in whenever the current map completely contains the selection
      booleanWithin(selectionCollectionPolygon.features[0], currentMapBoundsPolygon) ||
      // Move whenever the current map contains no part of the selection
      booleanDisjoint(selectionCollectionPolygon.features[0], currentMapBoundsPolygon);

    if (shouldMoveToSelection) {
      const selectionBoundingBox = bbox(selectionCollectionPolygon) as BBox2d;
      currentMap.fitBounds(selectionBoundingBox, { linear: true, padding: 10, duration: 300, maxZoom: 15 });
    }
  };

  useEffect(() => {
    if (
      selectionFeatureCollectionPolygon != null &&
      localitySelection != null &&
      localitySelection !== previousSelection.current
    ) {
      handleSelectionChange(selectionFeatureCollectionPolygon);
      previousSelection.current = localitySelection;
    }
  }, [localitySelection, selectionFeatureCollectionPolygon]);

  const fetchLocality = useApiFetch({
    schema: getLocalityResponse,
  });

  const [hoverLocalityProperties, setHoverLocalityProperties] = useState<{
    locality: GeoJSONLocality;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const currentMap = mapRef.current;
    if (inventoryCoordinates && currentMap != null) {
      const currentBounds = currentMap.getMap().getBounds();
      const areCoordinatesInBounds = currentBounds?.contains(inventoryCoordinates);

      if (!areCoordinatesInBounds) {
        currentMap.easeTo({
          center: inventoryCoordinates,
          zoom: 15,
          duration: 500,
        });
      }
    }
  }, [inventoryCoordinates]);

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: inventoryCoordinates?.lng ?? 1,
    latitude: inventoryCoordinates?.lat ?? 46.5,
    zoom: inventoryCoordinates != null ? 15 : 0,
  });

  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLE_PROVIDERS>("ign");

  const [displayCoordinatesInfoPopup, setDisplayCoordinatesInfoPopup] = useState(false);

  const onHoverMap = useCallback((event: MapLayerMouseEvent) => {
    const {
      features,
      point: { x, y },
    } = event;
    const hoveredFeature = features?.[0];

    setHoverLocalityProperties(
      hoveredFeature?.properties && !hoveredFeature.properties.cluster
        ? { locality: hoveredFeature.properties as GeoJSONLocality, x, y }
        : null
    );
  }, []);

  const onClickMap = useCallback(
    async (event: MapLayerMouseEvent) => {
      const { features } = event;

      const feature = features?.[0];

      // In case of cluster, zoom in
      // https://github.com/visgl/react-map-gl/blob/7.1-release/examples/clusters/src/app.tsx
      if (feature?.properties?.cluster_id != null) {
        const clusterId = feature.properties.cluster_id as number;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const mapboxSource = mapRef.current!.getSource("localities")! as GeoJSONSource;

        mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !zoom) {
            return;
          }

          mapRef.current?.easeTo({
            center: (feature.geometry as Point).coordinates as [number, number],
            zoom,
            duration: 500,
          });
        });
        return;
      }

      // In case of locality, set as selected
      if (feature?.properties != null && !feature.properties.cluster) {
        const clickedLocality = feature.properties as GeoJSONLocality | undefined;

        if (clickedLocality != null && clickedLocality.id !== selectedLocality?.id) {
          const newLocality = await fetchLocality({
            path: `/localities/${clickedLocality.id}`,
          });
          await setSelectedLocality(newLocality);
        }
      }
    },
    [fetchLocality, selectedLocality?.id, setSelectedLocality]
  );

  const handleOnMapLoad = () => {
    if (selectionFeatureCollectionPolygon != null) {
      handleSelectionChange(selectionFeatureCollectionPolygon);
    }
  };

  const resetCustomCoordinates = (): void => {
    void setInventoryCoordinates(
      selectedLocality
        ? {
            lat: selectedLocality?.coordinates.latitude,
            lng: selectedLocality?.coordinates.longitude,
          }
        : RESET
    );
  };

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
      <div className="h-80 lg:h-[500px] card border-2 border-primary shadow-xl">
        <ReactMapGl
          ref={mapRef}
          {...viewState}
          onLoad={handleOnMapLoad}
          onMove={(evt) => setViewState(evt.viewState)}
          // rome-ignore lint/suspicious/noExplicitAny: <explanation>
          mapStyle={MAP_STYLE_PROVIDERS[mapStyle].mapboxStyle as any}
          interactiveLayerIds={[clusterLayer.id!, singleLocalityLayer.id!]}
          onMouseMove={onHoverMap}
          onClick={onClickMap}
          style={{
            borderRadius: "14px",
          }}
        >
          {selectionFeatureCollectionPolygon && (
            <Source id="selected-localities" type="geojson" data={selectionFeatureCollectionPolygon}>
              <Layer {...selectionLayer} />
            </Source>
          )}
          {localitiesGeoJson && (
            <Source id="localities" type="geojson" data={localitiesGeoJson} cluster clusterMinPoints={3}>
              <Layer {...clusterLayer} />
              <Layer {...clusterCountLayer} />
              <Layer {...singleLocalityLayer} />
            </Source>
          )}
          {selectedLocality != null && (
            <Marker
              longitude={selectedLocality.coordinates.longitude}
              latitude={selectedLocality.coordinates.latitude}
              color="#3FB1CE"
            />
          )}
          {inventoryCoordinates != null && (
            <>
              {displayCoordinatesInfoPopup && (
                <Popup
                  longitude={inventoryCoordinates.lng}
                  latitude={inventoryCoordinates.lat}
                  offset={[-15, -5] as [number, number]}
                  focusAfterOpen={false}
                  onClose={() => setDisplayCoordinatesInfoPopup(false)}
                  anchor="right"
                >
                  <div className="flex flex-col items-center text-gray-700">
                    <div>{t("maps.currentPosition")}</div>
                    {areCoordinatesCustomized && (
                      <button className="link-primary" type="button" onClick={resetCustomCoordinates}>
                        {t("maps.resetCustomCoordinates")}
                      </button>
                    )}
                  </div>
                </Popup>
              )}
              <Marker
                longitude={inventoryCoordinates.lng}
                latitude={inventoryCoordinates.lat}
                draggable
                color="#b9383c"
                onDragEnd={(e) => setInventoryCoordinates(e.lngLat)}
                onClick={(e) => {
                  // Prevent the event from bubbling to avoid closing directly the popup after open
                  e.originalEvent.stopPropagation();
                  // TODO add the delete custom point
                  setDisplayCoordinatesInfoPopup(true);
                }}
              />
            </>
          )}
          {hoverLocalityProperties && (
            <div
              className="bg-base-100 relative pointer-events-none w-max px-2 rounded border"
              style={{ left: hoverLocalityProperties.x, top: hoverLocalityProperties.y + 12 }}
            >
              <div className="font-semibold">{hoverLocalityProperties.locality.nom}</div>
              <div className="">{`${hoverLocalityProperties.locality.townName} (${hoverLocalityProperties.locality.departmentCode})`}</div>
            </div>
          )}
          <NavigationControl />
          <FullscreenControl />
          <ScaleControl unit="metric" />
        </ReactMapGl>
      </div>
    </div>
  );
};

export default EntryMap;
