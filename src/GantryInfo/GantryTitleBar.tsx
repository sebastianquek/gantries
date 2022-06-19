import React from "react";
import styled from "styled-components";

import { GantryInfoIcon } from "./GantryInfoIcon";

const TitleBar = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  flex-grow: 1;
`;

const Amount = styled.p`
  font-size: 32px;
  margin: 0;
  font-weight: 700;
  font-family: "IBM Plex Sans";
  align-self: flex-start;
`;

export const GantryTitleBar = React.memo(
  ({
    title,
    zone,
    amount,
  }: {
    title: string;
    zone?: string;
    amount?: number;
  }) => {
    return (
      <TitleBar>
        <GantryInfoIcon zone={zone} />
        <Title>{title}</Title>
        {amount !== undefined && <Amount>${amount}</Amount>}
      </TitleBar>
    );
  }
);
