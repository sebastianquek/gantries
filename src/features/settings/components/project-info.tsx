import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { ReactComponent as CrossIcon } from "src/assets/svg/close-outline.svg";
import { ReactComponent as GantryIcon } from "src/assets/svg/gantry-on.svg";
import { Button } from "src/components/button";

const Modal = styled.div`
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

const GantryLogo = styled(GantryIcon)`
  transform: rotate(40deg);
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

const ProjectInfoModal = ({
  lastCheckDate,
  version,
}: {
  lastCheckDate?: Date;
  version?: string;
}) => {
  return (
    <Modal>
      <GantryLogo />
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
      {version && (
        <Version data-test-id="version">{version.slice(0, 7)}</Version>
      )}
      <a href="https://github.com/sebastianquek/gantries">GitHub</a>
    </Modal>
  );
};

const ProjectInfoPositioner = styled.div`
  position: absolute;
  z-index: 20;

  @media (max-width: 768px) {
    left: 0;
  }

  @media (min-width: 768px) {
    width: 300px;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  z-index: -1;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  cursor: pointer;
`;

const ProjectInfoCloseButton = styled.button`
  border: none;
  padding: 1em;
  font-size: 20px;
  z-index: 40;
  background: none;
  cursor: pointer;

  position: absolute;
  top: 0;
  right: 0;
`;

const LOCATION_HASH = "#about";

export const ProjectInfo = () => {
  const lastCheckedDate = process.env.REACT_APP_LAST_CHECK_DATE
    ? new Date(Number(process.env.REACT_APP_LAST_CHECK_DATE))
    : undefined;
  const version = process.env.REACT_APP_COMMIT_REF;

  const navigate = useNavigate();
  const location = useLocation();

  const isProjectInfoVisible = location.hash === LOCATION_HASH;

  const show = () => {
    navigate(LOCATION_HASH);
  };

  const hide = () => {
    // TODO: add E2E tests: when URL with "#about" is opened in a new tab and close button is clicked, the modal should close
    if (location.key === "default") {
      navigate(location.pathname, { replace: true });
    } else {
      navigate(-1);
    }
  };

  return isProjectInfoVisible ? (
    <ProjectInfoPositioner>
      <Backdrop onClick={hide} data-test-id="backdrop" />
      <ProjectInfoModal lastCheckDate={lastCheckedDate} version={version} />
      <ProjectInfoCloseButton onClick={hide} data-test-id="close">
        <CrossIcon />
      </ProjectInfoCloseButton>
    </ProjectInfoPositioner>
  ) : (
    <Button onClick={show}>Info</Button>
  );
};
