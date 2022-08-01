import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { ReactComponent as CrossIcon } from "src/assets/svg/close-outline.svg";
import { ReactComponent as GantryIcon } from "src/assets/svg/gantry-on.svg";
import { Button } from "src/components/button";
import {
  COMMIT_REF,
  LAST_CHECK_DATE,
  RATES_EFFECTIVE_DATE,
} from "src/constants";

const Modal = styled.div`
  border-radius: 1.5rem;
  background: var(--background-color-alt);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
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

const AttributionList = styled.p`
  a {
    display: inline-block;
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
`;

const ProjectInfoModal = ({
  lastCheckDate,
  ratesEffectiveDate,
  version,
}: {
  lastCheckDate?: Date;
  ratesEffectiveDate?: string;
  version?: string;
}) => {
  return (
    <Modal>
      <GantryLogo />
      <Title>Gantries: ERP rates at a glance</Title>
      <p>
        Rates and gantry location data are obtained from{" "}
        <a
          href="https://datamall.lta.gov.sg/"
          target="_blank"
          title="LTA DataMall"
          aria-label="LTA DataMall"
          rel="noreferrer"
        >
          LTA&#39;s DataMall
        </a>{" "}
        while OpenStreetMap is used to calculate the bearing of the gantries.
      </p>

      <AttributionList role="list">
        <a
          href="https://www.mapbox.com/about/maps/"
          target="_blank"
          title="Mapbox"
          aria-label="Mapbox"
          role="listitem"
          rel="noreferrer"
        >
          © Mapbox
        </a>{" "}
        <a
          href="https://www.openstreetmap.org/about/"
          target="_blank"
          title="OpenStreetMap"
          aria-label="OpenStreetMap"
          role="listitem"
          rel="noreferrer"
        >
          © OpenStreetMap
        </a>{" "}
        <a
          href="https://www.mapbox.com/map-feedback/"
          target="_blank"
          aria-label="Map feedback"
          role="listitem"
          rel="noopener nofollow noreferrer"
        >
          Improve this map
        </a>
      </AttributionList>
      {ratesEffectiveDate && (
        <p>
          Rates effective from:
          <br />
          <em>{ratesEffectiveDate}</em>
        </p>
      )}
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
  --base-background-color: var(--color-neutral-10-hsl);
  @media (prefers-color-scheme: dark) {
    --base-background-color: var(--color-neutral-90-hsl);
  }

  position: fixed;
  z-index: -1;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: hsla(var(--base-background-color), 0.3);
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
  const navigate = useNavigate();
  const location = useLocation();

  const isProjectInfoVisible = location.hash === LOCATION_HASH;

  const show = () => {
    navigate(LOCATION_HASH);
  };

  const hide = () => {
    if (location.key === "default") {
      navigate(location.pathname, { replace: true });
    } else {
      navigate(-1);
    }
  };

  return isProjectInfoVisible ? (
    <ProjectInfoPositioner>
      <Backdrop onClick={hide} data-test-id="backdrop" />
      <ProjectInfoModal
        lastCheckDate={LAST_CHECK_DATE}
        ratesEffectiveDate={RATES_EFFECTIVE_DATE}
        version={COMMIT_REF}
      />
      <ProjectInfoCloseButton onClick={hide} data-test-id="close">
        <CrossIcon />
      </ProjectInfoCloseButton>
    </ProjectInfoPositioner>
  ) : (
    <Button onClick={show}>Info</Button>
  );
};
