import styled from "styled-components";

const Rates = styled.div`
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

export const GantryRatesList = ({
  maxRateAmount,
  rates,
  time,
  viewType,
}: {
  maxRateAmount: number;
  rates: {
    startTime: string;
    endTime: string;
    amount: number;
  }[];
  time: string;
  viewType: "minimal" | "all";
}) => {
  let filteredRates = rates;
  if (viewType === "minimal" && rates.length > 4) {
    const idx = filteredRates.findIndex(({ startTime, endTime }) => {
      return time >= startTime && time < endTime;
    });
    // Ensure at least 0 so the slice doesn't take incorrect elements
    const loopAroundIdx = Math.max(0, 4 - (rates.length - idx));
    filteredRates = [
      ...rates.slice(idx, idx + 4),
      ...rates.slice(0, loopAroundIdx),
    ];
  }
  return (
    <Rates>
      {filteredRates.map(({ startTime, endTime, amount }) => {
        const interval = `${startTime} - ${endTime}`;
        const isCurrent = time >= startTime && time < endTime;
        return (
          <RateItem key={interval}>
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
  );
};
