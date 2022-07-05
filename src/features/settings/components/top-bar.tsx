import { lazy, Suspense } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  display: flex;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.8rem;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  gap: 0.5rem;
`;

const Middle = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const AppTitle = styled.h1`
  margin: 0;
  padding: 0;
  line-height: 1;
  text-transform: uppercase;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.1em;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: flex-end;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8em;
  font-weight: 800;
  font-family: monospace;
`;

const ProjectInfo = lazy(() => import("./project-info"));
const SettingsSection = lazy(() => import("./settings-section"));

export const TopBar = () => {
  return (
    <Wrapper>
      <Left>
        <Suspense fallback={<LoadingIndicator>Loading...</LoadingIndicator>}>
          <SettingsSection />
        </Suspense>
      </Left>
      <Middle>
        <AppTitle data-test-id="app-title">Gantries</AppTitle>
      </Middle>
      <Right>
        <Suspense fallback={<div></div>}>
          <ProjectInfo />
        </Suspense>
      </Right>
    </Wrapper>
  );
};
