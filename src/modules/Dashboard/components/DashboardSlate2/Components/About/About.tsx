import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import "./About.scss";
import BannerLogo from "../../../../../..//assets/images/BannerLogo.svg";

const About = (props: any) => {
  const { onClose, open } = props;

  const handleClose = () => {
    onClose(false);
  };

  return (
    <Dialog
      disableEnforceFocus
      onClose={handleClose}
      open={open}
      className="aboutMain"
      PaperProps={{
        sx: {
          maxHeight: "60%",
          width: "40%",
          minHeight: "60%",
          minWidth: "40%",
          backgroundColor: "#171d25",
        },
      }}
    >
      <div>
        <DialogTitle className="aboutMain__title">About</DialogTitle>
      </div>
      <DialogContent dividers className="aboutMain__content">
        <div style={{ flex: 0.25, flexDirection: "column" }}></div>
        <div className="aboutMain__content__heading">Slate 2.0</div>
        <div style={{ flex: 0.15, flexDirection: "column" }}></div>
        <div className="aboutMain__content__logoContent">
          <img src={BannerLogo} width={"300px"} />
        </div>
        <div style={{ flex: 0.45, flexDirection: "column" }}></div>
        <div className="aboutMain__content__footer">
          Copyright 2023 Slate Technologies Inc. All rights reserved.
        </div>
        <div style={{ flex: 0.1, flexDirection: "column" }}></div>
      </DialogContent>
    </Dialog>
  );
};

export default About;
