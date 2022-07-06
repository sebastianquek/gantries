import { GantryTitleBar } from "./gantry-title-bar";
import { GantryInfoPositioner, Wrapper } from "./positioner";

/**
 * Shows up when no gantry is selected
 */
export const GantryInfoHelpPanelOutlet = () => {
  return (
    <GantryInfoPositioner>
      <Wrapper viewType="all" isDraggable={false}>
        <GantryTitleBar title="Click on a gantry to see more" />
      </Wrapper>
    </GantryInfoPositioner>
  );
};
