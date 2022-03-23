import styled from "styled-components";

import { ReactComponent as GantryIcon } from "./svg/gantry-on.svg";

const Wrapper = styled.div`
  border-radius: 1.5rem;
  background: white;
  padding: 1.5rem;
  border: 1px solid hsl(0deg 0% 80%);

  p {
    line-height: 1.3;
  }

  em {
    display: inline-block;
    line-height: 1.2;
    font-size: 0.8em;
  }
`;

const Title = styled.h2`
  margin: 0.8rem 0 0;
  font-size: 18px;
`;

const GantryIconWrapper = styled.div`
  svg {
    transform: rotate(40deg);
  }
`;

export const ProjectInfo = ({ lastUpdateDate }: { lastUpdateDate?: Date }) => {
  return (
    <Wrapper>
      <GantryIconWrapper>
        <GantryIcon />
      </GantryIconWrapper>
      <Title>Gantries: ERP rates at a glance</Title>
      <p>
        Rates and gantry location data are obtained from LTA&#39;s DataMall
        while OpenStreetMap is used to calculate the bearing of the gantries.
      </p>
      {lastUpdateDate && (
        <p>
          Last check for updates:
          <br />
          <em>{lastUpdateDate.toString()}</em>
        </p>
      )}

      <a href="https://github.com/sebastianquek/gantries">GitHub</a>
    </Wrapper>
  );
};
