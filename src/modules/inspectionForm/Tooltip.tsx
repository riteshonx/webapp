import { ClickAwayListener, TableCell, Tooltip } from "@material-ui/core";
import React, { useState } from "react";
import "./Tooltip.scss";

const ClickTooltip = ({ title, align }: any) => {
  const [openTooltip, setOpenTooltip] = useState(false);
  const [openHoverTooltip, setOpenHoverTooltip] = useState(false);

  return (
    <TableCell align={align} className="tooltip-main">
      <ClickAwayListener onClickAway={() => setOpenTooltip(false)}>
        <div>
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => setOpenTooltip(false)}
            open={openTooltip || openHoverTooltip}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title={<div className="tooltip-main__titleStyle">{title}</div>}
            arrow
          >
            <div
              onClick={() => {
                setOpenHoverTooltip(false);
                setOpenTooltip(true);
              }}
              onMouseOver={() => {
                setOpenHoverTooltip(true);
              }}
              onMouseOut={() => setOpenHoverTooltip(false)}
            >
              {title?.length > 25 ? title.slice(0, 25) + "..." : title}
            </div>
          </Tooltip>
        </div>
      </ClickAwayListener>
    </TableCell>
  );
};

export default ClickTooltip;
