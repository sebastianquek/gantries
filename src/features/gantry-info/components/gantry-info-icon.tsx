import styled from "styled-components";

const Icon = styled.div`
  position: relative;
  font-size: 10px;
  font-weight: 800;
  align-self: flex-start;

  p {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    color: white;
    text-align: center;
  }
`;

export const GantryInfoIcon = ({ zone }: { zone?: string }) => (
  <Icon>
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.2645 0.83579C14.3612 0.307624 15.6388 0.307623 16.7355 0.835789L24.9919 4.81186C26.0887 5.34003 26.8852 6.33888 27.1561 7.52565L29.1953 16.4598C29.4662 17.6466 29.1819 18.8921 28.4229 19.8439L22.7093 27.0085C21.9503 27.9602 20.7993 28.5145 19.582 28.5145H10.418C9.20074 28.5145 8.04969 27.9602 7.29072 27.0085L1.57711 19.8439C0.818136 18.8921 0.533849 17.6466 0.804723 16.4598L2.84389 7.52566C3.11476 6.33888 3.91131 5.34003 5.00806 4.81186L13.2645 0.83579Z"
        fill="var(--color-primary-50)"
      />
    </svg>
    {zone && <p>{zone}</p>}
  </Icon>
);
