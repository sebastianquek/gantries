import type { ReactElement } from "react";

import styled from "styled-components";

import { ReactComponent as ArrowUp } from "src/assets/svg/arrow-up-sharp.svg";
import { ReactComponent as Checkmark } from "src/assets/svg/checkmark-sharp.svg";

const Wrapper = styled.div`
  position: absolute;
  top: 99%;
  left: 0;
  right: 0;
  height: 100vh;
  background: var(--background-color-alt);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.7rem;
  gap: 0.25em;

  p {
    margin: 0;
    text-align: center;
  }
`;

const GestureHelperIcon = styled.div`
  font-size: 1rem;
`;

export const GestureHelperText = ({
  state,
}: {
  state: "CONTINUE" | "RELEASE";
}) => {
  let content: ReactElement;
  switch (state) {
    case "CONTINUE":
      content = (
        <>
          <GestureHelperIcon>
            <ArrowUp />
          </GestureHelperIcon>
          <p>
            Continue dragging upwards
            <br />
            to see all rates
          </p>
        </>
      );
      break;
    case "RELEASE":
      content = (
        <>
          <GestureHelperIcon>
            <Checkmark />
          </GestureHelperIcon>
          <p>Release to see all rates</p>
        </>
      );
      break;
  }
  return <Wrapper>{content}</Wrapper>;
};
