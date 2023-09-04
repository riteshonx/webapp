import React, { ReactElement, useContext, useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog, { DialogProps } from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Link, TabType } from "../../models/link";
import "./LinkOptions.scss";
import FormToFormLinkTabOption from "../FormLinkOption/FormToFormLinkTabOption";
import FormToTaskLinkTabOption from "../FormToTaskLinkOption/FormToTaskLinkTabOption";
import ConfirmDialog from "src/modules/shared/components/ConfirmDialog/ConfirmDialog";
import { LinkContext } from "../../Context/link/linkContext";
import { Box } from "@material-ui/core";

interface IProps {
  isOpen: boolean;
  setValues: (argValue: Array<Link>) => void;
  close: () => void;
  linkValues: any;
}
const confirmMessage = {
  header: "Unsaved changes",
  text: "Are you sure to switch tabs?",
  cancel: "No",
  proceed: "Yes",
};

export const LinkOptions = ({
  isOpen,
  setValues,
  close,
  linkValues,
}: IProps): ReactElement => {
  const [fullWidth] = React.useState(true);
  const [maxWidth] = React.useState<DialogProps["maxWidth"]>("md");
  const [currentTab, setCurrentTab] = React.useState(() => {
    return TabType.forms;
  });
  const { linkState, linkDispatch }: any = useContext(LinkContext);
  const [showConfirm, setShowConfirm] = useState({
    value: false,
    data: { switchFrom: TabType.forms, switchTo: TabType.forms },
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState([
    { value: false, tab: TabType.forms, enable: false, count: 0 },
    {
      value: false,
      tab: TabType.Tasks,
      enable: false,
      count: linkState.formToTaskLinks.selectedLinks?.length,
    },
  ]);
  const linkedFormToTaskValues = linkValues.formToTaskLinks
    .filter((link: any) => !link.isNew)
    .map((item: any) => item.taskId);

  const {
    formToFormLinks: { draftSelectedFormLinks },
    formToTaskLinks: { selectedLinks },
  } = linkState;

  const handleClose = () => {
    close();
  };

  const saveChanges = () => {
    setValues([]);
  };

  const closeConfirmDialog = () => {
    setShowConfirm((prev) => {
      return { ...prev, value: false };
    });
  };

  const handleUnsavedChanges = (
    value: boolean,
    tab: TabType,
    count: number
  ) => {
    const otherValues = hasUnsavedChanges.filter(
      (item: any) => item.tab !== tab
    );
    setHasUnsavedChanges([
      ...otherValues,
      { value, tab, enable: false, count },
    ]);
  };

  const handleTabClick = (toTab: TabType) => {
    const unsavedInfoOncurrentTab = hasUnsavedChanges.find(
      (item: any) => item.tab === currentTab
    );
    if (
      currentTab !== toTab &&
      unsavedInfoOncurrentTab?.value &&
      unsavedInfoOncurrentTab?.enable
    ) {
      setShowConfirm({
        value: true,
        data: { switchFrom: currentTab, switchTo: toTab },
      });
    } else {
      setCurrentTab(toTab);
    }
  };

  const formToLinksTabUnsaved: any = hasUnsavedChanges.find(
    (item: any) => item.tab === TabType.Tasks
  );

  return (
    <React.Fragment>
      <Dialog
        className="LinkOptions"
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        disableBackdropClick={true}
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle
          className="LinkOptions__header"
          id="max-width-dialog-title"
        >
          Add links
        </DialogTitle>
        <DialogContent className="LinkOptions__body">
          <div className="LinkOptions__body__tabs">
            <div
              className={`LinkOptions__body__tabs__item ${
                currentTab === TabType.forms
                  ? "LinkOptions__body__tabs__active"
                  : ""
              }`}
              onClick={() => handleTabClick(TabType.forms)}
            >
              Forms
            </div>
            <div
              className={`LinkOptions__body__tabs__item ${
                currentTab === TabType.Tasks
                  ? "LinkOptions__body__tabs__active"
                  : ""
              }`}
              onClick={() => handleTabClick(TabType.Tasks)}
            >
              <Box display="flex" justifyContent="center" alignItems="center">
                <span>Activities</span>
                {formToLinksTabUnsaved.count > 0 && (
                  <Box
                    component="span"
                    borderRadius="50%"
                    padding="0.8rem"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="20px"
                    width="20px"
                    bgcolor="black"
                    marginLeft="0.5rem"
                  >
                    <Box fontSize="8px" color="white">
                      {formToLinksTabUnsaved.count}
                    </Box>
                  </Box>
                )}
              </Box>
            </div>
          </div>
          <div className="LinkOptions__body__tabsSection">
            {(() => {
              switch (currentTab) {
                case TabType.forms:
                  return <FormToFormLinkTabOption />;
                case TabType.Tasks:
                  return (
                    <FormToTaskLinkTabOption
                      linkedTasks={linkedFormToTaskValues}
                      selectedRowsCount={(value: number) =>
                        handleUnsavedChanges(
                          value ? true : false,
                          TabType.Tasks,
                          value
                        )
                      }
                    />
                  );
              }
            })()}
          </div>
        </DialogContent>
        <DialogActions className="LinkOptions__footer">
          <Button onClick={handleClose} className="btn-secondary">
            Close
          </Button>
          <Button
            disabled={!(draftSelectedFormLinks.length || selectedLinks.length)}
            onClick={saveChanges}
            className="btn-primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={showConfirm.value}
        message={confirmMessage}
        close={() => closeConfirmDialog()}
        proceed={() => {
          setCurrentTab(showConfirm.data.switchTo);
          closeConfirmDialog();
        }}
      />
    </React.Fragment>
  );
};
