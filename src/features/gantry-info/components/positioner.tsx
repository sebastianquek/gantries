import type { ViewType } from "../types";

import styled, { css, keyframes } from "styled-components";

const bounce = keyframes`
0% {
  transform: translate3d(0, 0, 0);
  animation-timing-function: ease-out;
}
12% {
  transform: translate3d(0, -80px, 0);
}
32% {
  transform: translate3d(0, -80px, 0);
  animation-timing-function: ease-in;
}
59.2% {
  transform: translate3d(0, -24px, 0);
  animation-timing-function: ease-in;
}
76.2% {
  transform: translate3d(0, -12px, 0);
  animation-timing-function: ease-in;
}
87.76% {
  transform: translate3d(0, -6px, 0);
  animation-timing-function: ease-in;
}
95.24% {
  transform: translate3d(0, -4px, 0);
  animation-timing-function: ease-in;
}
49%,
69.4%,
83%,
91.16%,
100% {
  transform: translate3d(0, 0px, 0);
  animation-timing-function: ease-out;
}
`;

export const GantryInfoPositioner = styled.div`
  position: absolute;
  z-index: 10;
  left: 1rem;
  touch-action: none;

  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
  }

  @media (min-width: 768px) {
    top: 3.5rem;
    width: 350px;
  }
`;

export const Wrapper = styled.div<{
  viewType: ViewType;
  isDraggable?: boolean;
  showBounceAnimation?: boolean;
}>`
  border-radius: 1.5rem;
  background: var(--background-color-alt);
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.5rem;
  width: 100%;
  touch-action: none;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);

  ${({ viewType }) =>
    viewType === "minimal" &&
    css`
      padding-bottom: 0.5rem;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    `}

  ${({ isDraggable = true }) =>
    isDraggable &&
    css`
      padding-top: 1.5rem;

      &::before {
        content: "";
        position: absolute;
        top: 0.5rem;
        left: 50%;
        height: 2px;
        width: 3rem;
        background-color: var(--color-neutral-50);
        border-radius: 500px;
        transform: translateX(-50%);
      }
    `}

${({ showBounceAnimation = false }) =>
    showBounceAnimation &&
    css`
      animation: ${bounce} 2.5s linear 0.5s;
    `}
`;
