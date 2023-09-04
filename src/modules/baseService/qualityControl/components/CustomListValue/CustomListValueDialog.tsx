import React, { ReactElement, useContext, useEffect, useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import { ConfigListItem } from "../../../customList/models/customList";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { IconButton } from "@material-ui/core";
import "./CustomListValue.scss";
import { CustomNestedDropDownContext } from "./CustomListValue";

function CustomListDialog(props: any): ReactElement {
  return (
    <Dialog
      className="CustomListValue__dialog"
      fullWidth={true}
      maxWidth={"md"}
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="max-width-dialog-title"
    >
      <div
        className="CustomListValue__dialog__title"
        id="max-width-dialog-title"
      >
        Select your list item
      </div>
      <DialogContent className="CustomListValue__dialog__body">
        {props.customListArray.map((item: ConfigListItem, itemindex: number) =>
          item.childItems.length > 0 ? (
            <div key={item.id} onClick={() => props.toggleChildView(itemindex)}>
              <div className="CustomListValue__dialog__body__item">
                {item.childItems.length > 0 ? (
                  item.isOpen ? (
                    <IconButton className="CustomListValue__dialog__body__item__btn">
                      <ExpandMoreIcon />
                    </IconButton>
                  ) : (
                    <IconButton className="CustomListValue__dialog__body__item__btn">
                      <ChevronRightIcon />
                    </IconButton>
                  )
                ) : (
                  ""
                )}
                <div className="CustomListValue__dialog__body__item__label">
                  {item.nodeName}
                </div>
              </div>
              {item.isOpen && (
                <CustomListValueSubItem index={itemindex} item={item} />
              )}
            </div>
          ) : (
            <div key={item.id} onClick={() => props.handleChange(item.id)}>
              <div
                className={`CustomListValue__dialog__body__item ${
                  item.id === props.currentValue ? " selected" : ""
                }`}
              >
                <div
                  className={`CustomListValue__dialog__body__item__label ${
                    item.childItems.length === 0 ? "only" : ""
                  }`}
                >
                  {item.nodeName}
                </div>
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(CustomListDialog);

function CustomListValueSubItem(props: any): ReactElement {
  const { handleChange, applyChanges, currentValue }: any = useContext(
    CustomNestedDropDownContext
  );
  const [currentItem, setcurrentItem] = useState<any>(null);

  useEffect(() => {
    setcurrentItem(props.item);
  }, [props.item]);

  const toggleNestedChildView = (
    argEvent: React.MouseEvent<HTMLDivElement, MouseEvent>,
    argIndex: number
  ) => {
    argEvent.stopPropagation();
    argEvent.preventDefault();
    currentItem.childItems[argIndex].isOpen =
      !currentItem.childItems[argIndex].isOpen;
    applyChanges();
  };

  const handleChangeInSelect = (
    argEvent: React.MouseEvent<HTMLDivElement, MouseEvent>,
    argValue: string
  ) => {
    argEvent.stopPropagation();
    argEvent.preventDefault();
    handleChange(argValue);
  };

  return (
    <>
      {props.item.childItems.map(
        (subitem: ConfigListItem, subItemIndex: number) =>
          subitem.childItems.length > 0 ? (
            <div
              key={subitem.id}
              className="customListDropdown"
              onClick={(e) => toggleNestedChildView(e, subItemIndex)}
            >
              <div className="customListDropdown__item">
                {subitem.childItems.length > 0 ? (
                  subitem.isOpen ? (
                    <IconButton className="customListDropdown__item__btn">
                      <ExpandMoreIcon />
                    </IconButton>
                  ) : (
                    <IconButton className="customListDropdown__item__btn">
                      <ChevronRightIcon />
                    </IconButton>
                  )
                ) : (
                  ""
                )}
                <div
                  className={`CustomListValue__dialog__body__item__label ${
                    subitem.childItems.length === 0 ? "only" : ""
                  }`}
                >
                  {subitem.nodeName}
                </div>
              </div>
              {subitem.isOpen && (
                <CustomListValueSubItem index={subItemIndex} item={subitem} />
              )}
            </div>
          ) : (
            <div
              key={subitem.id}
              className="customListDropdown"
              onClick={(e) => handleChangeInSelect(e, subitem.id)}
            >
              <div
                className={`customListDropdown__item ${
                  currentValue === subitem.id ? " selected" : ""
                }`}
              >
                {subitem.nodeName}
              </div>
              {subitem.isOpen && (
                <CustomListValueSubItem index={subItemIndex} item={subitem} />
              )}
            </div>
          )
      )}
    </>
  );
}
