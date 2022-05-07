import type React from "react";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";

export type MapStyle = "SATELLITE_STREETS" | "STREETS";
export const useMap = ({
  mapRef,
  initialLng,
  initialLat,
  initialZoom = 13,
  initialBounds = [
    [103.5997, 1.20634], // bottom-left, sw
    [104.03846, 1.47337], // top-right, ne
  ],
  mapStyle,
}: {
  mapRef: React.RefObject<HTMLDivElement>;
  initialLng: number;
  initialLat: number;
  initialZoom?: number;
  initialBounds?: mapboxgl.MapboxOptions["maxBounds"];
  mapStyle?: MapStyle;
}): {
  lng: number;
  lat: number;
  zoom: number;
  isLoaded: boolean;
  isMoving: boolean;
  map?: mapboxgl.Map;
} => {
  const mapboxRef = useRef<mapboxgl.Map>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [cameraState, setCameraState] = useState({
    lng: initialLng,
    lat: initialLat,
    zoom: initialZoom,
  });

  let style = "";
  switch (mapStyle) {
    case "STREETS":
      // style = "mapbox://styles/mapbox/streets-v11?optimize=true";
      style = `${process.env.REACT_APP_MAPBOX_STYLE ?? ""}`;
      break;
    default:
    case "SATELLITE_STREETS":
      style = "mapbox://styles/mapbox/satellite-streets-v11?optimize=true";
      break;
  }

  useEffect(() => {
    if (
      mapboxRef.current ||
      !mapRef.current ||
      !process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
    ) {
      return;
    }

    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

    mapboxRef.current = new mapboxgl.Map({
      container: mapRef.current,
      style,
      center: [initialLng, initialLat],
      zoom: initialZoom,
      maxBounds: initialBounds,
    });

    mapboxRef.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        showUserHeading: true,
        showUserLocation: true,
        trackUserLocation: true,
      })
    );

    mapboxRef.current.once("load", () => {
      setIsLoaded(true);
    });
  }, [initialBounds, initialLat, initialLng, initialZoom, mapRef, style]);

  useEffect(() => {
    if (mapboxRef.current) {
      mapboxRef.current.setStyle(style);
    }
  }, [style]);

  useEffect(() => {
    const moveFn = () => {
      if (!mapboxRef.current) {
        return;
      }
      const { lat, lng } = mapboxRef.current.getCenter();
      const zoom = mapboxRef.current.getZoom();
      setCameraState({
        lng,
        lat,
        zoom,
      });
    };
    mapboxRef.current?.on("move", moveFn);

    const moveStartFn = () => {
      if (!mapboxRef.current) {
        return;
      }
      setIsMoving(true);
    };
    mapboxRef.current?.on("movestart", moveStartFn);

    const moveEndFn = () => {
      if (!mapboxRef.current) {
        return;
      }
      setIsMoving(false);
    };
    mapboxRef.current?.on("moveend", moveEndFn);

    return () => {
      mapboxRef.current?.off("move", moveFn);
      mapboxRef.current?.off("movestart", moveStartFn);
      mapboxRef.current?.off("moveend", moveEndFn);
    };
  }, []);

  return {
    ...cameraState,
    isLoaded,
    isMoving,
    map: mapboxRef.current,
  };
};
