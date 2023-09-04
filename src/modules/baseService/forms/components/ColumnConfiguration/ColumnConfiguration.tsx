import React, { ReactElement, useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import "./ColumnConfiguration.scss";
import { TemplateData } from "../../models/template";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { setIsLoading } from "../../../../root/context/authentication/action";
import {
  LOAD_COLUMNCONFIG_TEMPLATE,
  UPDATE_COLUMN_CONFIG,
} from "../../grqphql/queries/formTemplates";
import { client } from "../../../../../services/graphql";
import { FormsRoles } from "../../../../../utils/role";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { canUpdateTemplates } from "../../utils/permission";
import { InputType } from "../../../../../utils/constants";

interface IColumnConfiguration {
  open: boolean;
  close: (event: boolean) => void;
  fields: any;
  columns: Array<TemplateData>;
  templateId: any;
}

function ColumnConfiguration(props: IColumnConfiguration): ReactElement {
  const { dispatch, state }: any = useContext(stateContext);
  const [templateList, setTemplateList] = useState<Array<any>>([]);
  const [columnLists, setColumnLists] = useState<Array<any>>([]);
  const [diaplayColumns, setDiaplayColumns] = useState<Array<any>>([]);

  useEffect(() => {
    if (props.templateId) {
      fetchColConfig(props.templateId);
    }
  }, [props.templateId]);

  useEffect(() => {
    if (props.fields) {
      setTemplateList(props.fields);
    }
  }, [props.fields]);

  const fetchColConfig = async (formTemplateId: number) => {
    try {
      dispatch(setIsLoading(true));
      const colConfigResponse: any = await client.query({
        query: LOAD_COLUMNCONFIG_TEMPLATE,
        variables: {
          templateId: formTemplateId,
        },
        fetchPolicy: "network-only",
        context: { role: FormsRoles.viewFormTemplate },
      });
      const colConfigArray: Array<any> = [];
      if (colConfigResponse.data?.templateColumnConfiguration) {
        colConfigResponse.data?.templateColumnConfiguration?.forEach(
          (item: any) => {
            const form: any = {
              elementId: item.elementId,
              fixed: item.fixed,
              sequence: item.sequence,
            };
            colConfigArray.push(form);
          }
        );
      }
      colConfigArray.sort(sortData);
      setColumnLists(colConfigArray);
      dispatch(setIsLoading(false));
      columnConfigData(colConfigArray);
    } catch (error) {
      dispatch(setIsLoading(false));
      console.log(error);
    }
  };

  const sortData = (a: any, b: any) => {
    let comparison = 0;

    if (a.sequence > b.sequence) {
      comparison = 1;
    } else if (a.sequence < b.sequence) {
      comparison = -1;
    }
    return comparison;
  };

  const columnConfigData = (arg: any) => {
    const lists = arg.map((item: any) => item.elementId);
    setDiaplayColumns(lists);
    const resArray: any = [];
    props.fields.map((item: TemplateData) => resArray.push(item));
    arg.forEach((column: any) => {
      resArray.forEach((item: any, i: number) => {
        if (
          column.elementId === item.elementId &&
          item.fieldTypeId != InputType.TABLE
        ) {
          column.caption = item.caption;
          if (column.fixed) {
            resArray.splice(i, 1);
          }
        }
      });
    });
    setTemplateList(resArray);
  };

  const addColumn = (item: any) => {
    const lists = [...columnLists];
    lists.push({
      caption: item.caption,
      elementId: item.elementId,
      fixed: false,
    });
    setColumnLists(lists);
    setDiaplayColumns([...diaplayColumns, item.elementId]);
  };

  const removeColumn = (item: any) => {
    const index = columnLists.indexOf(item);
    const lists = [...columnLists];
    const displayColList = [...diaplayColumns];
    lists.splice(index, 1);
    setColumnLists(lists);
    const displayIndex = displayColList.indexOf(item.elementId);
    displayColList.splice(displayIndex, 1);
    setDiaplayColumns(displayColList);
  };

  const handleClose = () => {
    props.close(false);
  };

  const reorder = (list: any, startIndex: any, endIndex: any) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      columnLists,
      result.source.index,
      result.destination.index
    );

    setColumnLists(items);
  };

  const handleSubmit = () => {
    updateColumnConfig();
  };

  const updateColumnConfig = async () => {
    let payload: any = [];
    const resList = [...columnLists];
    payload = resList.map((item: any) => item.elementId);
    try {
      dispatch(setIsLoading(true));
      const formSubmitResponse = await client.mutate({
        mutation: UPDATE_COLUMN_CONFIG,
        variables: {
          templateId: props.templateId,
          columnData: payload,
        },
        context: { role: FormsRoles.updateFormTemplate },
      });
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        "Column Cnfiguration updated successfully",
        AlertTypes.success
      );
      handleClose();
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }
  };

  return (
    <Dialog
      open={props.open}
      className="columnConfiguration"
      disableBackdropClick={true}
      fullWidth={true}
      maxWidth={"md"}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <div id="form-dialog-title" className="columnConfiguration__head">
        <div className="columnConfiguration__head__title">
          Column configuration
        </div>
        <div
          data-testid={`close-dialog`}
          className="columnConfiguration__head__subtitle"
        >
          Select the columns for the default column configuration in the list
          view for all users.
        </div>
        <CancelIcon
          onClick={handleClose}
          className="columnConfiguration__head__close"
        />
      </div>
      <DialogContent className="columnConfiguration__body">
        <div className="columnConfiguration__body__main">
          <div className="columnConfiguration__body__main__title">
            All Columns
          </div>
          {templateList.map(
            (item: TemplateData) =>
              item?.fieldTypeId != InputType.TABLE && (
                <div
                  key={item.elementId}
                  className="columnConfiguration__body__main__item"
                >
                  <div className="columnConfiguration__body__main__item__field">
                    {item.caption}
                  </div>
                  <div
                    className="columnConfiguration__body__main__item__action
                        
                        "
                  >
                    {canUpdateTemplates && (
                      <IconButton
                        aria-label="add"
                        data-testid={`add-${item.elementId}`}
                        disabled={diaplayColumns.indexOf(item.elementId) > -1}
                        onClick={() => addColumn(item)}
                      >
                        <AddCircleIcon />
                      </IconButton>
                    )}
                  </div>
                </div>
              )
          )}
        </div>
        <div className="columnConfiguration__body__main">
          <div className="columnConfiguration__body__main__title">
            Columns to display
          </div>
          <div className="dragZone">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided: any) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {columnLists.map((item: any, index: number) =>
                      canUpdateTemplates ? (
                        <Draggable
                          key={item.elementId}
                          draggableId={item.elementId}
                          index={index}
                        >
                          {(provided: any, snapshot) => (
                            <div
                              className={
                                snapshot.isDragging ? "dragging" : "dropping"
                              }
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="columnConfiguration__body__main__item">
                                <div className="columnConfiguration__body__main__item__field activeFiled">
                                  {item.caption}
                                </div>
                                {canUpdateTemplates && !item.fixed && (
                                  <div className="columnConfiguration__body__main__item__action ">
                                    <IconButton
                                      aria-label="remove"
                                      data-testid={`remove-${item.elementId}`}
                                      onClick={() => removeColumn(item)}
                                    >
                                      <RemoveCircleIcon />
                                    </IconButton>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ) : (
                        <React.Fragment>
                          <div className="columnConfiguration__body__main__item">
                            <div className="columnConfiguration__body__main__item__field activeFiled">
                              {item.caption}
                            </div>
                            {canUpdateTemplates && !item.fixed && (
                              <div className="columnConfiguration__body__main__item__action ">
                                <IconButton
                                  aria-label="remove"
                                  data-testid={`remove-${item.elementId}`}
                                  onClick={() => removeColumn(item)}
                                >
                                  <RemoveCircleIcon />
                                </IconButton>
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      )
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </DialogContent>
      <DialogActions className="columnConfiguration__footer">
        {canUpdateTemplates && (
          <Button
            data-testid={"column-config"}
            variant="outlined"
            type="submit"
            // disabled={isCreateDisabled}
            // className="draft-btn"
            className="rfi-primary"
            onClick={handleSubmit}
          >
            Update
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ColumnConfiguration;
