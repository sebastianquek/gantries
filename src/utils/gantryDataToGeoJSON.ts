export type GantryLocationData = {
  id: number;
  zone: string;
  name: string;
  bearing: number;
  longitude: number;
  latitude: number;
};

export const gantryDataToGeoJSON = (data: GantryLocationData[]) => {
  return {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: data.map(
        ({ id, zone, name, bearing, longitude, latitude }) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          properties: {
            id,
            name,
            zone,
            bearing,
          },
        })
      ),
    },
  };
};
