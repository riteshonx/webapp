import { FC, useContext, useState } from "react";
import { projectContext } from "../../Context/projectContext";
import LinkIcon from "@material-ui/icons/Link";
import CloseIcon from "@material-ui/icons/Close";
import { LinkType } from "src/utils/constants";
import { IconButton, Checkbox, Box } from "@material-ui/core";

type FormToTaskLinkType = {
  taskId: string;
  taskName: string;
  taskType: string;
  status: string;
  constraint: boolean;
  modified: any;
  isNew: boolean;
  isTouched: boolean;
};

type FormToTaskLinkTableProps = {
  formToTaskLinks: FormToTaskLinkType[];
  linkType: LinkType;
  onClickLink: (e: any) => void;
  onDeleteLink: (e: any) => void;
  onChangeConstraint: (e: any, item: any) => void;
  subjectValue: string;
};

const TASK_IN_TO_DO = "To-Do";

const FormToTaskLinkTable: FC<FormToTaskLinkTableProps> = ({
  formToTaskLinks,
  onChangeConstraint,
  onClickLink,
  onDeleteLink,
  linkType,
  subjectValue,
}) => {
  const { projectState }: any = useContext(projectContext);
  const isAnyTaskToShow = formToTaskLinks.some((task: any) => !task.isDeleted);
  const canUpdate =
    linkType !== LinkType.VIEW &&
    projectState?.featurePermissions?.canUpdateForm;

  return (
    <Box marginTop="2rem">
      <div className="LinkInput__body">
        {formToTaskLinks.length > 0 && isAnyTaskToShow && (
          <table>
            <thead>
              <tr className="LinkInput__body__rowheader">
                <td className="LinkInput__body__rowheader__name">Activities</td>
                <td className="LinkInput__body__rowheader__relationship">
                  Relationship
                </td>
                {canUpdate && (
                  <td className="LinkInput__body__rowheader__action">Action</td>
                )}
              </tr>
            </thead>
            <tbody>
              {formToTaskLinks
                .filter((task: any) => !task.isDeleted)
                .map((item: FormToTaskLinkType, index: number) => (
                  <tr
                    key={`${item.taskId}-${item.taskName}-${item.taskType}`}
                    className="LinkInput__body__row"
                  >
                    <td className="LinkInput__body__row__name">
                      <div className="LinkInput__body__row__name__container">
                        <IconButton
                          className="LinkInput__body__row__name__container__btn"
                          onClick={() => onClickLink(item)}
                        >
                          <LinkIcon className="LinkInput__body__row__name__container__btn__icon" />
                        </IconButton>
                        <Box
                          display="flex"
                          marginRight="3rem"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <p className="LinkInput__body__row__name__container__target">
                            {item.taskType === "task" ? "Task" : "Work Package"}{" "}
                            - {item.taskName}
                            {item.isNew && <sup>+</sup>}
                            {item.isTouched && "*"}
                          </p>
                          {subjectValue?.trim() && (
                            <div className="LinkInput__body__row__name__container__constraint">
                              <Checkbox
                                color="default"
                                disabled={!canUpdate}
                                checked={
                                  item.modified
                                    ? item.modified.constraint
                                    : item.constraint
                                }
                                onChange={(event: any) =>
                                  onChangeConstraint(event, item)
                                }
                                id={`constraint-checkbox-${item.taskId}`}
                              />
                              <label
                                htmlFor={`constraint-checkbox-${item.taskId}`}
                                className={`LinkInput__body__row__name__container__constraint_${
                                  canUpdate ? "_label" : "_labelDisabled"
                                }`}
                              >
                                Add as constraint
                              </label>
                            </div>
                          )}
                        </Box>
                      </div>
                    </td>
                    <td className="LinkInput__body__row__relationship">
                      Relates To
                    </td>
                    {canUpdate && (
                      <td className="LinkInput__body__row__action">
                        <IconButton
                          size="small"
                          className="LinkInput__body__row__action__btn"
                          onClick={() => onDeleteLink(item)}
                        >
                          <CloseIcon className="LinkInput__body__row__action__btn__icon" />
                        </IconButton>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </Box>
  );
};

export default FormToTaskLinkTable;
