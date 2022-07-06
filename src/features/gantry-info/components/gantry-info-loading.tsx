import { GantryTitleBar } from "./gantry-title-bar";
import { GantryInfoPositioner, Wrapper } from "./positioner";

/**
 * Shows up with gantry info is still loading
 */
export const GantryInfoLoading = () => {
  return (
    <GantryInfoPositioner>
      <Wrapper viewType="all" isDraggable={false}>
        <GantryTitleBar title="Loading..." />
      </Wrapper>
    </GantryInfoPositioner>
  );
};
