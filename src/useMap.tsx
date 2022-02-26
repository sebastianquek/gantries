import type React from "react";

import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";

export type MapStyle = "SATELLITE_STREETS" | "STREETS";
export const useMap = ({
  mapRef,
  initialLng,
  initialLat,
  initialZoom = 13,
  mapStyle,
}: {
  mapRef: React.RefObject<HTMLDivElement>;
  initialLng: number;
  initialLat: number;
  initialZoom?: number;
  mapStyle?: MapStyle;
}): {
  lng: number;
  lat: number;
  zoom: number;
  isLoaded: boolean;
  isMoving: boolean;
  flyTo?: (options: mapboxgl.FlyToOptions) => void;
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
      style = "mapbox://styles/mapbox/streets-v11?optimize=true";
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
    });

    mapboxRef.current.once("load", () => {
      setIsLoaded(true);
    });
  }, [initialLat, initialLng, initialZoom, mapRef, style]);

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

  const flyTo = useCallback((options: mapboxgl.FlyToOptions) => {
    if (mapboxRef.current) {
      mapboxRef.current.flyTo(options);
    }
  }, []);

  return {
    ...cameraState,
    isLoaded,
    isMoving,
    flyTo,
  };
};