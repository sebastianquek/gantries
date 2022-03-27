import type { PropsWithChildren } from "react";

import styled from "styled-components";

import { ReactComponent as WarningIcon } from "./svg/warning.svg";

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

export const AlertBanner = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <Wrapper>
      <Icon />
      {children}
    </Wrapper>
  );
};
