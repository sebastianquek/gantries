import type { GantryLocation } from "../types";

type RawGantrylocation = {
  [k in keyof GantryLocation]: string;
};

export const gantryDataToGeoJSON = (data: RawGantrylocation[]) => {
  return {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: data.map(
        ({ id, zone, name, bearing, longitude, latitude }) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          properties: {
            id: Number(id),
            name,
            zone,
            bearing: Number(bearing),
          },
        })
      ),
    },
  };
};
