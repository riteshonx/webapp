import React from "react";
import Box from "@material-ui/core/Box";
import TextContent from "../Micro/TextContent";
import { CheckCircleIcon } from "../../icons";

interface TextWithCheckIconProps {
  label: string;
  content?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const TextWithCheckIcon: React.VFC<TextWithCheckIconProps> = ({
  content,
  label,
  disabled,
  style,
}) => {
  return (
    <Box style={style} display="flex" alignItems="center">
      <CheckCircleIcon disabled={disabled} />
      <TextContent
        style={{ color: !content ? "#000" : "#797979", marginLeft: "2px" }}
        content={label}
        collapseMargin
      />
      {content && (
        <TextContent
          style={{ marginLeft: "1rem" }}
          content={content}
          collapseMargin
        />
      )}
    </Box>
  );
};

export default TextWithCheckIcon;
