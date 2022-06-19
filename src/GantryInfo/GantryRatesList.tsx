import type { Rate, ViewType } from "./types";

import React from "react";
import FlipMove from "react-flip-move";
import styled from "styled-components";

import { filterRates } from "./utils/filterRates";

const OverflowWrapper = styled.div`
  overflow: hidden;
`;

const Rates = styled(FlipMove)`
  display: flex;
  flex-direction: column;
  font-size: 13px;
  gap: 0.5em;
`;

const RateItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5em;
  font-family: "IBM Plex Sans"; // Numbers are monospace

  &:last-child {
    margin-bottom: 0.25rem;
  }
`;

const RateInterval = styled.p<{ isCurrent: boolean }>`
  margin: 0;
  font-weight: ${({ isCurrent }) => (isCurrent ? "700" : "400")};
  width: 11ch;
`;

const RateBarWrapper = styled.div`
  background-color: #efefef;
  flex-grow: 1;
`;

const RateBar = styled.div<{ isCurrent: boolean }>`
  height: 1em;
  background-color: ${({ isCurrent }) => (isCurrent ? "#EB7449" : "#F7C589")};
  min-width: 1px;
`;

const RateValue = styled.p<{ isCurrent: boolean }>`
  margin: 0;
  text-align: right;
  font-weight: ${({ isCurrent }) => (isCurrent ? "800" : "400")};
  width: 3em;
`;

export const GantryRatesList = React.memo(
  ({
    maxRateAmount,
    rates,
    time,
    viewType,
  }: {
    maxRateAmount: number;
    rates: Rate[];
    time: string;
    viewType: ViewType;
  }) => {
    const filteredRates = filterRates(rates, viewType, time);

    return (
      <OverflowWrapper>
        <Rates enterAnimation="fade" leaveAnimation="none">
          {filteredRates.map(({ startTime, endTime, amount }) => {
            const interval = `${startTime} - ${endTime}`;
            const isCurrent = time >= startTime && time < endTime;
            return (
              <RateItem key={`${interval}-${amount}`}>
                <RateInterval isCurrent={isCurrent}>{interval}</RateInterval>
                <RateBarWrapper>
                  <RateBar
                    isCurrent={isCurrent}
                    style={{
                      width:
                        amount === 0
                          ? `1px`
                          : `${((amount / maxRateAmount) * 100).toFixed(2)}%`,
                    }}
                  />
                </RateBarWrapper>
                <RateValue isCurrent={isCurrent}>${amount}</RateValue>
              </RateItem>
            );
          })}
        </Rates>
      </OverflowWrapper>
    );
  }
);
