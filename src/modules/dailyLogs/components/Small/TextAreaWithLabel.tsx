import React from "react";
import clsx from "clsx";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import TextContent from "../Micro/TextContent";
import Box from "@material-ui/core/Box";

interface TextAreaWithLabelProps {
  label: string;
  value: string;
  size?: "s" | "m" | "l";
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  readOnly?: boolean;
  onChange?: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  onBlur?: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      resize: "none",
      width: (props: any) => (props.size === "s" ? "80%" : "100%"),
      fontFamily: "inherit",
      padding: "8px",
      borderColor: "#0000003b",
      borderRadius: "4px",
      "&:hover": {
        borderColor: "#000000de",
      },
    },
    medium: {
      height: "80px",
    },
    large: {
      height: "110px",
    },

    readOnly: {
      "&:hover": {
        borderColor: "#0000003b",
      },
      "&:active": {
        borderColor: "#0000003b",
      },
    },
  })
);

const TextAreaWithLabel: React.VFC<TextAreaWithLabelProps> = ({
  label,
  labelStyle,
  value,
  size = "s",
  style,
  onChange,
  onBlur,
  readOnly,
}) => {
  const classes = useStyles({ size });
  return (
    <Box marginLeft='50px' style={style}>
      <TextContent
        style={{ color: "#9b9b9b", ...labelStyle }}
        content={label}
      />
      <textarea
        readOnly={readOnly}
        disabled={readOnly}
        className={clsx({
          [classes.root]: true,
          [classes.large]: size === "l",
          [classes.medium]: size === "m",
          [classes.readOnly]: readOnly,
        })}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </Box>
  );
};

export default TextAreaWithLabel;
