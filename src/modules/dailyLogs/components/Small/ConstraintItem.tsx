import React from "react";
import Box from "@material-ui/core/Box";
import TextContent from "../Micro/TextContent";
import WarningIcon from "@material-ui/icons/Error";

interface Constraint {
  constraintName: string;
  constraintType: string;
}

interface ConstraintItemProps {
  constraints: Array<Constraint>;
  comments: string;
}

const ConstraintItem: React.VFC<ConstraintItemProps> = ({
  constraints,
  comments,
}) => {
  return (
    <Box display="flex" justifyContent="space-between">
      <Box>
        {constraints.map((constraint) => (
          <Box key={constraint.constraintName} marginTop="1rem" display="flex">
            <WarningIcon style={{ fill: "#ffc863", fontSize: "1.8rem" }} />
            <Box marginLeft="1rem">
              <TextContent content={constraint.constraintName} collapseMargin />
              <TextContent
                content={constraint.constraintType}
                style={{ color: "#797979" }}
                collapseMargin
              />
            </Box>
          </Box>
        ))}
      </Box>
      <TextContent
        style={{ maxWidth: "350px" }}
        content={comments}
        collapseMargin
      />
    </Box>
  );
};

export default ConstraintItem;
