import React, { useState } from "react";
import { LinkOptions } from "../LinkOptions/LinkOptions";
import { Button } from "@material-ui/core";

const AddLink = () => {
  const [isLinkOptionsDialogOpen, setIsLinkOptionsDialogOpen] = useState(false);

  const handleOnSave = ({ formToFormLinks, formToTaskLinks }: any) => {
    console.log("Here after handling save");
  };

  return (
    <div>
      <div className="LinkInput__header__right">
        <Button
          className="btn-text LinkInput__header__right__btn"
          onClick={() => setIsLinkOptionsDialogOpen(true)}
        >
          + Add Link
        </Button>
      </div>
      {/* {isLinkOptionsDialogOpen && (
        <LinkOptions
          isOpen={isLinkOptionsDialogOpen}
          setValues={handleOnSave}
          close={() => setIsLinkOptionsDialogOpen(false)}
        />
      )} */}
    </div>
  );
};

export default AddLink;
