import React, { FC, ReactElement, Children } from "react";
import Box from "@material-ui/core/Box";

const Slot: FC<{
  name: "left" | "right";
}> = () => null;

const SlotBox = ({ children }: any): ReactElement => {
  const childrenArray = Children.toArray(
    children
  ) as unknown as React.ReactElement[];
  const leftSideContent = childrenArray.find(
    (ele: any) => ele.props.name === "left"
  );
  const rightSideContent = childrenArray.find(
    (ele) => ele.props.name === "right"
  );

  return (
    <Box display="flex" height="100%">
      <Box border="1px solid #0000001f" width="210px">
        {leftSideContent?.props.children}
      </Box>
      <Box flex="1" marginLeft="2rem" border="1px solid #0000001f">
        {rightSideContent?.props.children}
      </Box>
    </Box>
  );
};

SlotBox.Slot = Slot;

export default SlotBox;
