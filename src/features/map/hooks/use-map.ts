import type React from "react";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";

export type MapStyle = "LIGHT" | "DARK";
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
  map?: mapboxgl.Map;
} => {
  const mapboxRef = useRef<mapboxgl.Map>();
  const [isLoaded, setIsLoaded] = useState(false);

  let style = "";
  switch (mapStyle) {
    case "LIGHT":
      style = `${process.env.REACT_APP_MAPBOX_STYLE_LIGHT ?? ""}`;
      break;
    default:
    case "DARK":
      style = `${process.env.REACT_APP_MAPBOX_STYLE_DARK ?? ""}`;
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

    // eslint-disable-next-line import/no-named-as-default-member
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

    // eslint-disable-next-line import/no-named-as-default-member
    mapboxRef.current = new mapboxgl.Map({
      container: mapRef.current,
      style,
      center: [initialLng, initialLat],
      zoom: initialZoom,
      maxBounds: initialBounds,
      attributionControl: false,
      logoPosition: "top-right",
      touchPitch: false,
    });

    mapboxRef.current.addControl(
      // eslint-disable-next-line import/no-named-as-default-member
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

    mapboxRef.current.once("idle", () => {
      // Propagates the idle event to the document
      // Useful for e2e tests to wait for the map to be ready to be asserted
      document.dispatchEvent(new Event("idle", { bubbles: true }));
    });
  }, [initialBounds, initialLat, initialLng, initialZoom, mapRef, style]);

  useEffect(() => {
    if (mapboxRef.current) {
      mapboxRef.current.setStyle(style);
    }
  }, [style]);

  return {
    map: isLoaded ? mapboxRef.current : undefined,
  };
};
