import React, {
  ReactElement,
  useState,
  useReducer,
  useEffect,
  useContext,
} from "react";
import { LinkOptions } from "../LinkOptions/LinkOptions";
import { Button } from "@material-ui/core";
import { LinkInitailState, LinkReducer } from "../../Context/link/linkReducer";
import { LinkContext } from "../../Context/link/linkContext";
import "./Link.scss";
import {
  setCurrentFormId,
  setSelectedFormLinks,
  setResetValue,
  setDraftSelectedFormLinks,
  setFormStatus,
  setSelectedFormToTaskLinks,
  resetSelectedFormTaskLinks,
} from "../../Context/link/linkAction";

import { LinkType, LinkRelationship } from "../../../../../utils/constants";
import { match, useRouteMatch } from "react-router-dom";
import { client } from "../../../../../services/graphql";
import {
  CREATE_LINK,
  DELETE_LINK,
  UPDATE_LINK_RELATIONSHIP,
  FETCH_TASK_TYPE_ID,
} from "../../graphql/queries/link";
import { projectContext } from "../../Context/projectContext";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { featureFormRoles, projectFeatureAllowedRoles } from "src/utils/role";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { CustomPopOver } from "../../../../shared/utils/CustomPopOver";
import FormToTaskLinkTable from "../FormToTaskLinkOption/FormToTaskLinkTable";
import FormToFormLinkTable from "../FormsLinkTable/FormToFormLinkTable";
import { TabType } from "../../models/link";
import {
  decodeProjectExchangeToken,
  decodeProjectFormExchangeToken,
} from "src/services/authservice";
import { useHistory } from "react-router-dom";

export interface Params {
  id: string;
  featureId: string;
  formId: string;
}

interface Iprops {
  linkValues: any;
  setValue: (argvalue: any) => void;
  type: LinkType;
  updateLinkList?: () => void;
  status: string;
  subjectValue: string;
}

const confirmMessage = {
  header: "Remove Link",
  text: "Are you sure you want to remove the Link?",
  cancel: "Cancel",
  proceed: "Remove",
};

function LinkInput({
  linkValues,
  type,
  status,
  setValue,
  updateLinkList,
  subjectValue,
}: Iprops): ReactElement {
  const pathMatch: match<Params> = useRouteMatch();
  const [isLinkOptionsOpen, setIsLinkOptionsOpen] = useState(false);
  const [linkState, linkDispatch] = useReducer(LinkReducer, LinkInitailState);
  const [isEdit, setIsEdit] = useState(false);
  const { projectState }: any = useContext(projectContext);
  const { state, dispatch }: any = useContext(stateContext);
  const [confirmOpen, setConfirmOpen] = useState({ value: false, type: "" });
  const [deleteFormIndex, setDeleteFormIndex] = useState(-1);
  const [deleteTask, setDeleteTask] = useState<any>({});
  const [taskLinkTargetType, setTaskLinkTargetType] = useState(4);
  const classes = CustomPopOver();
  const { formToFormLinks, formToTaskLinks } = linkState;
  const history = useHistory();

  useEffect(() => {
    const { formToFormLinks, formToTaskLinks } = linkValues;
    const targetValues: Array<any> = formToFormLinks.filter(
      (item: any) => !item.deleted
    );
    linkDispatch(
      setSelectedFormLinks(JSON.parse(JSON.stringify(targetValues)))
    );
    linkDispatch(
      setDraftSelectedFormLinks(JSON.parse(JSON.stringify(targetValues)))
    );
  }, [linkValues]);

  useEffect(() => {
    async function fetchTargetType() {
      const {
        data: {
          projectFeature: [item],
        },
      } = await client.query({
        query: FETCH_TASK_TYPE_ID,
        variables: {},
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      setTaskLinkTargetType(item.id);
    }
    fetchTargetType();
    console.log;
  }, []);

  useEffect(() => {
    if (type === LinkType.CREATE) {
      linkDispatch(
        setResetValue({
          formToFormLinks: {
            formFeatures: [],
            selectedFeature: null,
            selectedFormLinks: [],
            selectedFeatureFormsList: [],
            draftSelectedFormLinks: [],
            currentFormId: -1,
          },
          formToTaskLinks: {
            selectedLinks: [],
          },
          formStatus: "",
        })
      );
    }
    if (type !== LinkType.CREATE && formToFormLinks.length === 0) {
      setIsEdit(true);
    }
    if (type !== LinkType.CREATE) {
      const formId = Number(pathMatch.params.formId);
      linkDispatch(setCurrentFormId(formId));
    }
  }, []);

  useEffect(() => {
    linkDispatch(setFormStatus(status));
  }, [status]);

  const setLinkValues = () => {
    if (
      (status === "OPEN" || status === "OVERDUE") &&
      type === LinkType.UPDATE
    ) {
      setIsLinkOptionsOpen(false);
      updateOpenFormLinks();
    } else {
      setIsLinkOptionsOpen(false);
      const formToFormLinksSelected =
        formToFormLinks.draftSelectedFormLinks.filter(
          (item: any) => item.isSelected
        );
      linkDispatch(
        setSelectedFormLinks([...formToFormLinks.draftSelectedFormLinks])
      );
      const selectedTaskLinks = formToTaskLinks.selectedLinks;
      const existingLinks = linkValues.formToTaskLinks.filter(
        (link: any) => !link.isNew
      );
      setValue({
        formToTaskLinks: [...existingLinks, ...selectedTaskLinks],
        formToFormLinks: formToFormLinksSelected,
      });
    }
  };

  const updateOpenFormLinks = async () => {
    try {
      dispatch(setIsLoading(true));
      const formToFormLinksSelected =
        formToFormLinks.draftSelectedFormLinks.filter(
          (item: any) => item.isSelected
        );
      const newLinks = formToFormLinksSelected.filter((item: any) =>
        linkValues.formToFormLinks.every(
          (linkitem: any) =>
            item.targetId !== linkitem.targetId && item.new && !item.deleted
        )
      );
      const deleteLinks = linkValues.formToFormLinks.filter((item: any) =>
        formToFormLinksSelected.every(
          (linkitem: any) =>
            item.targetId !== linkitem.targetId && !linkitem.deleted
        )
      );

      const linkPromiseList: Array<any> = [];
      const newLinksEnriched: Array<any> = [];
      const deletedLinksEnriched: Array<any> = [];
      const formToTaskLinksSelected = formToTaskLinks.selectedLinks;
      formToTaskLinksSelected.forEach((item: any) => {
        const selectedFormToTaskLink = {
          linkType: item.relation,
          sourceId: item.sourceId,
          sourceType: item.sourceType,
          targetId: item.taskId,
          targetType: item.targetType,
          constraint: item.constraint,
          constraintName: item.constraintName,
        };
        newLinksEnriched.push(selectedFormToTaskLink);
      });
      newLinks.forEach((item: any) => {
        const newLink = {
          linkType: item.relation,
          sourceId: pathMatch.params.formId,
          sourceType: projectState?.currentFeature.id,
          targetId: item.targetId.toString(),
          targetType: item.targetType,
          constraint: item.constraint,
          constraintName: item.constraintName,
        };
        newLinksEnriched.push(newLink);
      });
      deleteLinks.forEach((element: any) => {
        let relation: any = element.relation;
        if (element.reverse) {
          if (element.relation !== LinkRelationship.RELATES_TO) {
            relation =
              element.relation === LinkRelationship.BLOCKS
                ? LinkRelationship.BLOCKED_BY
                : LinkRelationship.BLOCKS;
          }
        }
        const deleteLink = {
          linkType: relation,
          sourceId: element.reverse
            ? element.targetId.toString()
            : element.id.toString(),
          sourceType: element.reverse ? element.targetType : element.sourceType,
          targetId: element.reverse
            ? element.id.toString()
            : element.targetId.toString(),
          targetType: element.reverse ? element.sourceType : element.targetType,
        };

        deletedLinksEnriched.push(deleteLink);
      });
      if (newLinksEnriched.length) {
        linkPromiseList.push(
          client.mutate({
            mutation: CREATE_LINK,
            variables: {
              objects: newLinksEnriched,
            },
            context: {
              role: featureFormRoles.createForm,
              token: state.selectedProjectToken,
            },
          })
        );
      }
      if (deletedLinksEnriched.length) {
        linkPromiseList.push(
          client.mutate({
            mutation: DELETE_LINK,
            variables: {
              objects: deletedLinksEnriched,
            },
            context: {
              role: featureFormRoles.updateForm,
              token: state.selectedProjectToken,
            },
          })
        );
      }
      if (linkPromiseList.length > 0) {
        await Promise.all(linkPromiseList);
        if (updateLinkList) {
          updateLinkList();
        }
      }
      linkDispatch(resetSelectedFormTaskLinks());
      dispatch(setIsLoading(false));
    } catch (error: any) {
      dispatch(setIsLoading(false));
    }
  };

  const setRelationship = async (
    argvalue: React.ChangeEvent<{ name?: string | undefined; value: unknown }>,
    argIndex: number
  ) => {
    try {
      if (
        (status === "OPEN" || status === "OVERDUE") &&
        type === LinkType.UPDATE
      ) {
        dispatch(setIsLoading(true));
        const list = [...formToFormLinks.selectedFormLinks];
        const item = list[argIndex];
        let relation: any = argvalue.target.value;
        let existingRelationship: any = item.originalRelationShip;
        if (item.reverse) {
          if (relation !== LinkRelationship.RELATES_TO) {
            relation =
              relation === LinkRelationship.BLOCKS
                ? LinkRelationship.BLOCKED_BY
                : LinkRelationship.BLOCKS;
          }
          if (item.originalRelationShip !== LinkRelationship.RELATES_TO) {
            existingRelationship =
              item.originalRelationShip === LinkRelationship.BLOCKS
                ? LinkRelationship.BLOCKED_BY
                : LinkRelationship.BLOCKS;
          }
        }
        const updateLinkRelationShip = {
          existingRelationship,
          newRelationship: relation,
          sourceId: item.reverse
            ? item.targetId.toString()
            : item.id.toString(),
          sourceType: item.reverse ? item.targetType : item.sourceType,
          targetId: item.reverse
            ? item.id.toString()
            : item.targetId.toString(),
          targetType: item.reverse ? item.sourceType : item.targetType,
          constraint: false,
          constraintName: "FORM_TO_FORM",
        };
        await client.mutate({
          mutation: UPDATE_LINK_RELATIONSHIP,
          variables: {
            ...updateLinkRelationShip,
          },
          context: {
            role: featureFormRoles.updateForm,
            token: state.selectedProjectToken,
          },
        });
        if (updateLinkList) {
          updateLinkList();
        }
        dispatch(setIsLoading(false));
      } else {
        //Type = Create or Status = Draft
        const list = [...formToFormLinks.selectedFormLinks];
        list[argIndex].relation = argvalue.target.value;
        linkDispatch(setSelectedFormLinks(list));
        const selectedTaskLinks = formToTaskLinks.selectedLinks;
        const existingLinks = linkValues.formToTaskLinks.filter(
          (link: any) => !link.isNew
        );
        setValue({
          formToFormLinks: list,
          formToTaskLinks: [...existingLinks, ...selectedTaskLinks],
        });
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
      console.log(error.message);
    }
  };

  const removeFormLink = (argIndex: number) => {
    if (
      type === LinkType.CREATE ||
      formToFormLinks.selectedFormLinks[argIndex].new
    ) {
      const list = [...formToFormLinks.selectedFormLinks];
      list.splice(argIndex, 1);
      linkDispatch(setSelectedFormLinks(list));
      const selectedTaskLinks = formToTaskLinks.selectedLinks;
      const existingLinks = linkValues.formToTaskLinks.filter(
        (link: any) => !link.isNew
      );
      setValue({
        formToFormLinks: list,
        formToTaskLinks: [...existingLinks, ...selectedTaskLinks],
      });
    } else {
      // on Type = Update only since old links cannot exist in draft mode
      setDeleteFormIndex(argIndex);
      setConfirmOpen({ value: true, type: TabType.forms });
    }
  };

  const removeTaskLink = (task: any) => {
    if (type === LinkType.CREATE || task.isNew) {
      const filteredList = formToTaskLinks.selectedLinks.filter(
        (item: any) => item.taskId !== task.taskId
      );
      const existingLinks = linkValues.formToTaskLinks.filter(
        (link: any) => !link.isNew
      );
      linkDispatch(setSelectedFormToTaskLinks(filteredList));
      setValue({
        formToFormLinks: formToFormLinks.selectedFormLinks,
        formToTaskLinks: [...existingLinks, ...filteredList],
      });
    } else {
      setDeleteTask(task);
      setConfirmOpen({ value: true, type: TabType.Tasks });
    }
  };

  const updateLinks = async () => {
    try {
      const linkPromiseList: Array<any> = [];
      const newLinks: any = [];
      const deletedLinks: any = [];
      linkValues.formToFormLinks.forEach((item: any) => {
        if (item.new && !item.deleted) {
          const newLink = {
            linkType: item.relation,
            sourceId: pathMatch.params.formId,
            sourceType: projectState?.currentFeature.id,
            targetId: item.targetId.toString(),
            targetType: item.targetType,
            constraint: false,
          };
          newLinks.push(newLink);
        }
        if (!item.new && item.deleted) {
          let relation: any = item.relation;
          if (item.reverse) {
            if (item.relation !== LinkRelationship.RELATES_TO) {
              relation =
                item.relation === LinkRelationship.BLOCKS
                  ? LinkRelationship.BLOCKED_BY
                  : LinkRelationship.BLOCKS;
            }
          }
          const deleteLink = {
            linkType: relation,
            sourceId: item.reverse
              ? item.targetId.toString()
              : item.id.toString(),
            sourceType: item.reverse ? item.targetType : item.sourceType,
            targetId: item.reverse
              ? item.id.toString()
              : item.targetId.toString(),
            targetType: item.reverse ? item.sourceType : item.targetType,
            constraint: false,
          };
          deletedLinks.push(deleteLink);
        }
        if (!item.new && item.relationShipModifield) {
          let relation: any = item.relation;
          let existingRelationship: any = item.originalRelationShip;
          if (item.reverse) {
            if (item.relation !== LinkRelationship.RELATES_TO) {
              relation =
                item.relation === LinkRelationship.BLOCKS
                  ? LinkRelationship.BLOCKED_BY
                  : LinkRelationship.BLOCKS;
            }
            if (item.originalRelationShip !== LinkRelationship.RELATES_TO) {
              existingRelationship =
                item.originalRelationShip === LinkRelationship.BLOCKS
                  ? LinkRelationship.BLOCKED_BY
                  : LinkRelationship.BLOCKS;
            }
          }
          const updateLink = {
            existingRelationship,
            newRelationship: relation,
            sourceId: item.reverse
              ? item.targetId.toString()
              : item.id.toString(),
            sourceType: item.reverse ? item.targetType : item.sourceType,
            targetId: item.reverse
              ? item.id.toString()
              : item.targetId.toString(),
            targetType: item.reverse ? item.sourceType : item.targetType,
            constraint: false,
            constraintName: "FORM_TO_TASK",
          };
          linkPromiseList.push(
            client.mutate({
              mutation: UPDATE_LINK_RELATIONSHIP,
              variables: {
                ...updateLink,
              },
              context: {
                role: featureFormRoles.updateForm,
                token: state.selectedProjectToken,
              },
            })
          );
        }
      });
      if (newLinks.length) {
        linkPromiseList.push(
          client.mutate({
            mutation: CREATE_LINK,
            variables: {
              objects: newLinks,
            },
            context: {
              role: featureFormRoles.createForm,
              token: state.selectedProjectToken,
            },
          })
        );
      }
      if (deletedLinks.length) {
        linkPromiseList.push(
          client.mutate({
            mutation: DELETE_LINK,
            variables: {
              objects: deletedLinks,
            },
            context: {
              role: featureFormRoles.updateForm,
              token: state.selectedProjectToken,
            },
          })
        );
      }
      if (linkPromiseList.length > 0) {
        dispatch(setIsLoading(true));
        await Promise.all(linkPromiseList);
        dispatch(setIsLoading(false));
      }
      setIsEdit(false);
      if (updateLinkList) {
        updateLinkList();
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
    }
  };

  const removeTaskLinkOnUpdate = async () => {
    //enters this code block only on update
    try {
      if (type === LinkType.UPDATE) {
        if (status === "OPEN" || status === "OVERDUE") {
          setConfirmOpen({ value: false, type: "" });
          dispatch(setIsLoading(true));
          const item = linkValues.formToTaskLinks.find(
            (item: any) => item.taskId === deleteTask.taskId
          );
          const deleteLink = {
            linkType: item.relation,
            sourceId: item.sourceId,
            sourceType: item.sourceType,
            targetId: item.taskId,
            targetType: item.targetType,
          };
          await client.mutate({
            mutation: DELETE_LINK,
            variables: {
              objects: [deleteLink],
            },
            context: {
              role: featureFormRoles.updateForm,
              token: state.selectedProjectToken,
            },
          });
          if (updateLinkList) updateLinkList();
          dispatch(setIsLoading(false));
        } else if (status === "DRAFT") {
          setConfirmOpen({ value: false, type: "" });
          const existingLinksModified = linkValues.formToTaskLinks.map(
            (task: any) => {
              if (task.taskId === deleteTask.taskId) {
                task.isDeleted = true;
              }
              return task;
            }
          );
          setValue({
            formToFormLinks: linkValues.formToFormLinks,
            formToTaskLinks: existingLinksModified,
          });
        }
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
    }
  };

  const removeLink = async () => {
    if (confirmOpen.type === TabType.Tasks) {
      removeTaskLinkOnUpdate();
      return;
    }
    try {
      if (type === LinkType.UPDATE) {
        if (status === "OPEN" || status === "OVERDUE") {
          setConfirmOpen({ value: false, type: "" });
          dispatch(setIsLoading(true));
          const item = formToFormLinks.selectedFormLinks[deleteFormIndex];
          let relation: any = item.relation;
          if (item.reverse) {
            if (item.relation !== LinkRelationship.RELATES_TO) {
              relation =
                item.relation === LinkRelationship.BLOCKS
                  ? LinkRelationship.BLOCKED_BY
                  : LinkRelationship.BLOCKS;
            }
          }
          const deleteLink = {
            linkType: relation,
            sourceId: item.reverse
              ? item.targetId.toString()
              : item.id.toString(),
            sourceType: item.reverse ? item.targetType : item.sourceType,
            targetId: item.reverse
              ? item.id.toString()
              : item.targetId.toString(),
            targetType: item.reverse ? item.sourceType : item.targetType,
          };
          await client.mutate({
            mutation: DELETE_LINK,
            variables: {
              objects: [deleteLink],
            },
            context: {
              role: featureFormRoles.updateForm,
              token: state.selectedProjectToken,
            },
          });
          if (updateLinkList) updateLinkList();
          dispatch(setIsLoading(false));
        } else {
          //will not enter this block since form to form links in draft mode do not exist
        }
      }
    } catch (error: any) {
      console.log("in error block");
      dispatch(setIsLoading(false));
    }
  };

  const handleFormLinkClick = (item: any) => {
    let canViewIds = decodeProjectFormExchangeToken().viewFormIds;
    canViewIds = canViewIds.replace("{", "[");
    canViewIds = canViewIds.replace("}", "]");

    try {
      const canViewIdsArray = JSON.parse(canViewIds);
      const canClickFormLink = canViewIdsArray.includes(item.targetType);
      if (canClickFormLink) navigateToLink(item);
      else history.push("/noPermission");
    } catch {
      console.error("Could not convert form ids into array");
    }
  };

  const navigateToLink = (argItem: any) => {
    const protocol = location.protocol;
    const host = location.host;
    const url = `${protocol}//${host}`;
    const targetPath = userPermittedPermissionView();
    if (targetPath) {
      const targetUrl = `${url}/base/projects/${Number(
        pathMatch.params.id
      )}/form/${argItem.targetType}/${targetPath}/${argItem.targetId}`;
      window.open(targetUrl, "_blank");
    }
  };

  const handleTaskLinkClick = (taskId: string) => {
    const allowedRoles = decodeProjectExchangeToken().allowedRoles;
    const canViewTask = allowedRoles.includes(
      projectFeatureAllowedRoles.viewMasterPlan
    );
    if (canViewTask) navigateToTask(taskId);
    else history.push("/noPermission");
  };

  const navigateToTask = (taskId: string) => {
    const protocol = location.protocol;
    const host = location.host;
    const url = `${protocol}//${host}/scheduling/project-plan/${Number(
      pathMatch.params.id
    )}?task-id=${taskId}`;
    window.open(url, "_blank");
  };

  const userPermittedPermissionView = (): string => {
    if (
      projectState?.allowedFeaturePermissions?.updateForm.includes(
        Number(pathMatch.params.featureId)
      )
    ) {
      return "edit";
    } else if (
      projectState?.allowedFeaturePermissions?.viewForm.includes(
        Number(pathMatch.params.featureId)
      )
    ) {
      return "view";
    } else {
      return "";
    }
  };

  const showLinkOptions = () => {
    setIsLinkOptionsOpen(true);
  };

  const updateConstraint = async (event: any, item: any) => {
    if (
      (status === "OPEN" || status === "OVERDUE") &&
      type === LinkType.UPDATE &&
      !item.isNew
    ) {
      try {
        dispatch(setIsLoading(true));
        await client.mutate({
          mutation: UPDATE_LINK_RELATIONSHIP,
          variables: {
            sourceId: item.sourceId,
            sourceType: item.sourceType,
            targetId: item.taskId,
            targetType: taskLinkTargetType,
            existingRelationship: item.relation,
            newRelationship:
              item.relation === LinkRelationship.RELATES_TO
                ? LinkRelationship.BLOCKS
                : LinkRelationship.RELATES_TO,
            constraint: event.target.checked ? true : false,
            constraintName: item.constraintName,
          },
          context: {
            role: featureFormRoles.updateForm,
            token: state.selectedProjectToken,
          },
        });
        if (updateLinkList) {
          updateLinkList();
        }
      } catch (e) {
        console.error("Error occurred while updating constraint", e);
      } finally {
        dispatch(setIsLoading(false));
      }
    } else {
      const existingLinks = linkValues.formToTaskLinks;
      const taskLinks = formToTaskLinks.selectedLinks;
      const selectedLinks = taskLinks
        .filter((link: any) => link.isNew)
        .map((task: any) => {
          if (task.taskId === item.taskId) {
            if (event.target.checked) {
              task.constraint = true;
              task.relation = LinkRelationship.BLOCKS;
            } else {
              task.constraint = false;
              task.relation = LinkRelationship.RELATES_TO;
            }
          }
          return task;
        });
      const existingLinksModified = existingLinks
        .filter((link: any) => !link.isNew)
        .map((task: any) => {
          if (task.taskId === item.taskId) {
            if (event.target.checked) {
              const modified = {
                constraint: true,
                relation: LinkRelationship.BLOCKS,
              };
              task.modified = modified;
            } else {
              const modified = {
                constraint: false,
                relation: LinkRelationship.RELATES_TO,
              };
              task.modified = modified;
            }
            if (
              task.constraint === task?.modified?.constraint ||
              !task?.modified
            ) {
              task.isTouched = false;
            } else {
              task.isTouched = true;
            }
          }
          return task;
        });
      linkDispatch(setSelectedFormToTaskLinks(selectedLinks));
      setValue({
        formToTaskLinks: [...existingLinksModified, ...selectedLinks],
        formToFormLinks: formToFormLinks.selectedFormLinks,
      });
    }
  };

  return (
    <LinkContext.Provider value={{ linkState, linkDispatch }}>
      <div className="LinkInput">
        <div className="LinkInput__header">
          <div className="LinkInput__header__left">Links</div>
          {type === LinkType.VIEW &&
          projectState?.featurePermissions?.canUpdateForm ? (
            status !== "CLOSED" && isEdit ? (
              <div className="LinkInput__header__right">
                <Button
                  className="btn-text LinkInput__header__right__btn"
                  onClick={showLinkOptions}
                >
                  + Add Link
                </Button>
                {linkValues.formToFormLinks.filter(
                  (item: any) =>
                    item.new || item.deleted || item.relationShipModifield
                ).length > 0 && (
                  <Button
                    className="btn-text LinkInput__header__right__btn"
                    onClick={updateLinks}
                  >
                    Save
                  </Button>
                )}
              </div>
            ) : (
              status !== "CLOSED" && (
                <div className="LinkInput__header__right">
                  <Button
                    className="btn-text LinkInput__header__right__btn"
                    onClick={() => setIsEdit(true)}
                  >
                    Edit
                  </Button>
                </div>
              )
            )
          ) : projectState?.featurePermissions?.canUpdateForm ? (
            status !== "CLOSED" && (
              <div className="LinkInput__header__right">
                <Button
                  className="btn-text LinkInput__header__right__btn"
                  onClick={showLinkOptions}
                >
                  + Add Link
                </Button>
              </div>
            )
          ) : (
            ""
          )}
        </div>
        <div className="LinkInput__body">
          <FormToFormLinkTable
            formToFormLinks={formToFormLinks.selectedFormLinks}
            linkType={type}
            onClickLink={(item: any) => handleFormLinkClick(item)}
            onDeleteLink={(index: any) => removeFormLink(index)}
            onChangeRelationShip={(e: any, index: any) =>
              setRelationship(e, index)
            }
            isEdit={isEdit}
            classes={classes}
          />
          <FormToTaskLinkTable
            formToTaskLinks={linkValues.formToTaskLinks}
            linkType={type}
            onClickLink={(item: any) => handleTaskLinkClick(item.taskId)}
            onDeleteLink={(task: any) => removeTaskLink(task)}
            onChangeConstraint={updateConstraint}
            subjectValue={subjectValue}
          />
        </div>
      </div>

      {isLinkOptionsOpen && (
        <LinkOptions
          isOpen={isLinkOptionsOpen}
          setValues={setLinkValues}
          linkValues={linkValues}
          close={() => setIsLinkOptionsOpen(false)}
        />
      )}
      {
        <ConfirmDialog
          open={confirmOpen.value}
          message={confirmMessage}
          close={() => setConfirmOpen({ value: false, type: "" })}
          proceed={removeLink}
        />
      }
    </LinkContext.Provider>
  );
}

export default LinkInput;
