import type { MapStyle } from "./useMap";

import React from "react";
import styled from "styled-components";

const StyleSelect = styled.select`
  position: absolute;
  top: 0;
  left: 0;
  margin: 1em;
`;
export const StyleSelector = ({
  mapStyle,
  setMapStyle,
}: {
  mapStyle: MapStyle;
  setMapStyle: React.Dispatch<React.SetStateAction<MapStyle>>;
}) => {
  return (
    <StyleSelect
      value={mapStyle}
      onChange={(event) => setMapStyle(event.target.value as MapStyle)}
    >
      <option value="STREETS">Streets</option>
      <option value="SATELLITE_STREETS">Satellite Streets</option>
    </StyleSelect>
  );
};
