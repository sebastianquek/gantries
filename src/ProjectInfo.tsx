import styled from "styled-components";

import { ReactComponent as GantryIcon } from "./svg/gantry-on.svg";

const Wrapper = styled.div`
  border-radius: 1.5rem;
  background: white;
  padding: 1.5rem;
  border: 1px solid hsl(0deg 0% 80%);
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.3;

  em {
    display: inline-block;
    line-height: 1.2;
    font-size: 0.8em;
  }
`;

const Title = styled.h2`
  margin: 0.5rem 0 0;
  font-size: 1.2rem;
  line-height: 1.2;
`;

const GantryIconWrapper = styled.div`
  svg {
    transform: rotate(40deg);
  }
`;

const Version = styled.p`
  display: block;
  position: absolute;
  right: 1.5rem;
  bottom: 1.5rem;
  margin: 0;
  font-size: 0.75em;
  font-style: italic;
  color: hsl(0deg 0% 40%);
`;

export const ProjectInfo = ({
  lastCheckDate,
  version,
}: {
  lastCheckDate?: Date;
  version?: string;
}) => {
  console.log(version);
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
      {lastCheckDate && (
        <p>
          Last check for updates:
          <br />
          <em>{lastCheckDate.toString()}</em>
        </p>
      )}
      {version && <Version>{version.slice(0, 6)}</Version>}
      <a href="https://github.com/sebastianquek/gantries">GitHub</a>
    </Wrapper>
  );
};
