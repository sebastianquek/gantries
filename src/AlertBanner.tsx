import styled from "styled-components";

import { useFilters } from "./contexts/FiltersContext";
import { ReactComponent as WarningIcon } from "./svg/warning.svg";

const Positioner = styled.div`
  position: absolute;
  right: 3.5rem;
  top: 3.5rem;

  @media (max-width: 768px) {
    left: 1rem;
  }

  @media (min-width: 768px) {
    width: 270px;
  }
`;

const Wrapper = styled.div`
  background: white;
  border-radius: 1.5rem;
  padding: 1rem 1rem 1rem 2.5rem;
  font-size: 0.8rem;
  color: #de6235;
  font-weight: 600;
`;

const Icon = styled(WarningIcon)`
  position: absolute;
  font-size: 1.5em;
  top: 0.8rem;
  left: 0.8rem;
`;

export const AlertBanner = () => {
  const { dayType } = useFilters();
  const isSunday = new Date().getDay() === 0;

  return isSunday ? (
    <Positioner>
      <Wrapper>
        <Icon />
        {`ERP is not operational on Sundays, you're seeing rates for ${dayType}.`}
      </Wrapper>
    </Positioner>
  ) : null;
};
