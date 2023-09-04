import { Avatar, Button, Chip, IconButton } from "@material-ui/core";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import "./ReviewForm.scss";
// import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import FileAttachment from "../FileAttachment/FileAttachment";
import DescriptionIcon from "@material-ui/icons/Description";
import ConfirmDialog from "src/modules/shared/components/ConfirmDialog/ConfirmDialog";
import { convertToRaw, EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { client } from "src/services/graphql";
import { featureFormRoles, myProjectRole } from "src/utils/role";
import { match, useRouteMatch } from "react-router-dom";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { projectContext } from "src/modules/baseService/formConsumption/Context/projectContext";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { UPDATE_WORK_FLOW_REVIEW, UPDATE_WORK_FLOW_REVIEW_END_STEP } from "src/modules/baseService/formConsumption/graphql/queries/rfi";
import { FETCH__PROJECT_ROLE_ABOVE_VIEW } from "src/modules/baseService/graphql/queries/users";
import { Select } from "@material-ui/core";
import { decodeToken } from "../../../../../services/authservice";
import { FETCH_PROJECT_ASSOCIATION } from "../../../../../graphhql/queries/projects";
import { allowedFileFormats, FIXED_FIELDS } from "src/utils/constants";
import CloseIcon from '@material-ui/icons/Close';
import AddAssigneeDialog from "../AddAssigneeDialog/AddAssigneeDialog";

export const fileAttachment: any = {
  bgColor: "#FFFFFF",
  type: "file",
  accept: allowedFileFormats.join(","),
};

export const signAttachment: any = {
  bgColor: "#FFFFFF",
  type: "image",
  accept: "image/jpeg, image/png",
  maxFiles: 1,
  placeholder: "Drag and drop a file here, or click to select a file",
};

interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const confirmMessage: message = {
  header: "Are you sure",
  text: `Are you sure you want to reject this review?`,
  cancel: "Cancel",
  proceed: "Proceed",
};

export interface Params {
  id: string;
  featureId: string;
  formId: string;
}

export default function ReviewForm(props: any): ReactElement {
  const pathMatch: match<Params> = useRouteMatch();
  const { dispatch, state }: any = useContext(stateContext);
  const { projectState, projectDispatch }: any = useContext(projectContext);
  const [confirmBox, setConfirmBox] = useState(false);
  const [statusType, setStatusType] = useState("");
  const [stepName, setStepName] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [attachedFilesLists, setAttachedFilesLists] = useState<Array<any>>([]);
  const [attachedImageLists, setAttachedImageLists] = useState<Array<any>>([]);
  const [commentVaue, setCommentVaue] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [tenantUserLists, setTenantUserLists] = useState<Array<any>>([]);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Array<any>>([]);
  const modalRef = useRef<any>(null);
  const [reviewFormData, setReviewFormData] = useState<Array<any>>([]);
  const [stepType, setStepType] = useState<any>("");
  const [isCommentRequired, setIsCommentRequired] = useState(false);
  const [showSignature, setShowSignature] = useState<any>(false);
  const [signStr, setSignStr] = useState<any>("");
  const [userName, setUserName] = useState<any>("");
  const [isEmpty, setIsEmpty] = useState(true);
  const [reviewStepFormData, setReviewStepFormData] = useState<any>(null);
  const [addAssigneOpen, setAddAssigneOpen] = useState(false);

  useEffect(() => {
    if (Number(pathMatch.params.id) && state?.selectedProjectToken) {
      fetchTenantUsersLists();
    }
  }, [Number(pathMatch.params.id), state?.selectedProjectToken]);

  useEffect(() => {
    if (props?.activeWorkFlowStepData?.length > 0) {
      setReviewFormData(props?.activeWorkFlowStepData);
    }
  }, [props?.activeWorkFlowStepData]);

  useEffect(() => {
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handler = (event: any) => {
    if (!modalRef.current?.contains(event.target)) {
      setIsAssigneeOpen(false);
    }
  };

  const handleConfirmBox = (val: boolean, outComes: any) => {
    if(outComes.stepType==='end' && props.isBlockedBy){
      const msg=`You cannot move this ${projectState?.currentFeature?.feature} to ${outComes.outcome.toLowerCase()} as there are blocking items`;
      Notification.sendNotification(msg, AlertTypes.warn);
      return;
    }
    if (selectedUsers?.length < 1) {
      setSelectedUsers([]);
      const targetUserList: Array<any> = [];
      outComes?.stepAssignees?.forEach((user: any) => {
        const assignee = {
          id: user.assignee,
          firstName: user.user.firstName,
          lastName: user.user.lastName,
          email: user.user.email,
        };
        targetUserList.push(assignee);
      });
      setSelectedUsers(targetUserList);
    }
    setStepType(outComes.stepType);
    setStatusType(outComes.outcome);
    setStepName(outComes.stepName);
    setNextStep(outComes.stepDescription);
    getCommentValue();
    if (commentVaue) {
      setConfirmBox(val);
    } else {
      setIsCommentRequired(true);
    }
  };

  const handleAttachedFiles = (value: any, type: string) => {
    type === "file"
      ? setAttachedFilesLists(value)
      : setAttachedImageLists(value);
  };

  const handleConfirmBoxClose = () => {
    setConfirmOpen(false);
  };

  const confirmRejectReview = () => {
    props?.submitReview();
    setConfirmOpen(true);
  };

  const onEditorStateChange = (argEditorState: any) => {
    setEditorState(argEditorState);
    const blocks = convertToRaw(argEditorState.getCurrentContent()).blocks;
    if (blocks.length > 0) {
      blocks[0].type === "unstyled" ? setIsEmpty(true) : setIsEmpty(false);
    }
    getCommentValue();
  };

  const getCommentValue = () => {
    const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
    const value = blocks
      .map((block) => (!block.text.trim() && "\n") || block.text)
      .join("\n");
    if (value.trim()) {
      setCommentVaue(
        draftToHtml(convertToRaw(editorState.getCurrentContent()))
      );
      setIsCommentRequired(false);
    } else {
      setCommentVaue("");
    }
  };

  const addSignature = () => {
    const currentUserName: string = decodeToken()?.userName;
    if (currentUserName) {
      setUserName(currentUserName);
      setSignStr(`<svg>
      <text textAnchor="middle" x="0%" y="10%" font-size="24" style = "font-family:'Monotype Corsiva';font-style: italic">${currentUserName}</text>
      </svg>`);
      setShowSignature(true);
    }
  };

  const fetchTenantUsersLists = async () => {
    try {
      let allowedRoles: Array<any> = [];
      const permittedRolesResponse: any = await client.query({
        query: FETCH__PROJECT_ROLE_ABOVE_VIEW,
        variables: {
          featureId: [Number(pathMatch.params.featureId)],
        },
        fetchPolicy: "network-only",
        context: { role: myProjectRole.viewMyProjects },
      });
      if (permittedRolesResponse.data.projectPermission.length > 0) {
        allowedRoles = permittedRolesResponse.data.projectPermission.map(
          (item: any) => item.roleId
        );
      }
      const projectAssociationResponse = await client.query({
        query: FETCH_PROJECT_ASSOCIATION,
        variables: {
          fName: "%%",
          limit: 1000,
          offset: 0,
          projectId: Number(pathMatch.params.id),
        },
        fetchPolicy: "network-only",
        context: { role: myProjectRole.viewMyProjects },
      });
      const targetUsers: Array<any> = [];
      if (projectAssociationResponse.data.projectAssociation.length > 0) {
        projectAssociationResponse.data.projectAssociation.forEach(
          (item: any) => {
            if (allowedRoles.indexOf(item.role) > -1) {
              const name = item.user.firstName
                ? `${item.user.firstName || ""} ${item.user.lastName || ""}`
                : item.user.email.split("@")[0];
              const user = {
                name,
                firstName:item.user?.firstName,
                lastName:item.user?.lastName,
                email: item.user.email,
                id: item.user.id,
                status: item.status,
              };
              targetUsers.push(user);
            }
          }
        );
      }
      setTenantUserLists(targetUsers);
    } catch (err) {
      console.log(err);
    }
  };

  const addAssignee = () => {
    setIsAssigneeOpen(true);
  };

  const handleAsignee = (e: any, user: any) => {
    const targetUserList: Array<any> = [...selectedUsers];
    if (e?.target?.checked) {
      targetUserList.push(user);
    } else {
      const index = targetUserList.findIndex(
        (item: any) => item.id === user.id
      );
      if (index !== -1) {
        targetUserList.splice(index, 1);
      }
    }
    setSelectedUsers(targetUserList);
  };

  const handleDeleteUser = (user: any) => {
    setIsAssigneeOpen(false);
    const targetUserList: Array<any> = [...selectedUsers];
    const index = targetUserList.findIndex((item: any) => item.id === user.id);
    if (index !== -1) {
      targetUserList.splice(index, 1);
    }
    setSelectedUsers(targetUserList);
  };

  const handleback = (val: boolean) => {
    setConfirmBox(val);
    setSelectedUsers([]);
  };

  const handleSubmit = () => {
    const nextStepUsers = selectedUsers.map((item: any) => item.id);
    if(stepType==='end' && props.isBlockedBy){
      const msg=`You cannot move this ${projectState?.currentFeature?.feature} to ${statusType.toLowerCase()} as there are blocking items`;
      Notification.sendNotification(msg, AlertTypes.warn);
      return;
    }
    if (nextStepUsers.length === 0 && stepType !== "end") {
      setReviewStepFormData({
        stepName: props.activeWorkFlowStepData[0].stepName, //or stepName
        outcome: statusType,
        nextStepAssignees: nextStepUsers,
        comment: commentVaue,
        attachments: attachedFilesLists,
        signature: userName ? userName : undefined,
      });
      setAddAssigneOpen(true);
      return;
    }
    if (commentVaue) {
      const payloadValue = {
        stepName: props.activeWorkFlowStepData[0].stepName, //or stepName
        outcome: statusType,
        nextStepAssignees: nextStepUsers,
        comment: commentVaue,
        attachments: attachedFilesLists,
        signature: userName ? userName : undefined,
      };
      reviewWorkFlow(payloadValue);
    } else {
      setIsCommentRequired(true);
    }
  };

  const saveAfterAddingAssignee= (argAssignees: Array<string>) =>{
    setAddAssigneOpen(false)
    const payloadValue= JSON.parse(JSON.stringify(reviewStepFormData));
    payloadValue.nextStepAssignees= argAssignees;
    reviewWorkFlow(payloadValue);
  }

  const reviewWorkFlow = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      if(stepType !== 'end'){
        const formsData={
          elementId: FIXED_FIELDS.ASSIGNEE,
          value:payload.nextStepAssignees
        }
          await client.mutate({
          mutation: UPDATE_WORK_FLOW_REVIEW,
          variables: {
            formId: Number(pathMatch.params.formId),
            workflowData: payload,
            formsData
          },
          context: {
            role: featureFormRoles.updateForm,
            token: state?.selectedProjectToken,
          },
        });
        handleSuccess();
      } else{
          await client.mutate({
          mutation: UPDATE_WORK_FLOW_REVIEW_END_STEP,
          variables: {
            formId: Number(pathMatch.params.formId),
            workflowData: payload,
          },
          context: {
            role: featureFormRoles.updateForm,
            token: state?.selectedProjectToken,
          },
        });
        handleSuccess();
      }
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
      // props.refresh();
    }
  };

  const handleSuccess=()=>{
    setConfirmBox(false);
    setCommentVaue('');
    setEditorState(EditorState.createEmpty());
    setIsCommentRequired(false);
    setAttachedImageLists([]);
    setShowSignature(false);
    setSignStr('');
    setAttachedFilesLists([]);
    setSelectedUsers([]);
    setUserName('');
      Notification.sendNotification(
        "Updated successfully",
        AlertTypes.success
      );
      props.refresh();
    dispatch(setIsLoading(false));
  }

  const handleCommentBlur = () => {
    const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
    const value = blocks
      .map((block) => (!block.text.trim() && "\n") || block.text)
      .join("\n");
    if (value.replace("\n", "").trim()) {
      setIsCommentRequired(false);
    } else {
      setIsCommentRequired(true);
    }
  };

  const clearSignature=()=>{
    setShowSignature(false);
    setSignStr("");
    setUserName("");
  }


  return (
    <>
      {!confirmBox ? (
        <div className="review-rfi">
          <div className="review-rfi__subject">
            {props?.activeWorkFlowStepData[0]?.stepDescription}
          </div>

          <div className="review-rfi__comments">
            <div className="review-rfi__comments__label">
              Comments<sup>*</sup>
            </div>
            <div className="review-rfi__comments__editor">
              <Editor
                editorState={editorState}
                editorClassName="editor-input"
                placeholder={isEmpty ? "Write your comments...." : ""}
                onEditorStateChange={onEditorStateChange}
                onBlur={handleCommentBlur}
                toolbar={{
                  inline: { inDropdown: true },
                  list: { inDropdown: true },
                  textAlign: { inDropdown: true },
                  colorPicker: {
                    className: "demo-option-hidden",
                  },
                  link: {
                    className: "demo-option-hidden",
                  },
                  emoji: {
                    className: "demo-option-hidden",
                  },
                  embedded: {
                    className: "demo-option-hidden",
                  },
                  image: {
                    className: "demo-option-hidden",
                  },
                  remove: { className: "demo-option-hidden" },
                  history: {
                    className: "demo-option-hidden",
                    undo: { className: "demo-option-hidden" },
                    redo: { className: "demo-option-custom" },
                  },
                }}
                toolbarStyle={{
                  fontSize: "12px",
                }}
              />
              {isCommentRequired && (
                <label className="review-rfi__comments__editor__error">
                  Comment is required
                </label>
              )}
            </div>
          </div>
          <div className="review-rfi__attachments">
            <div className="review-rfi__attachments__label">Attachments</div>
            <div className="review-rfi__attachments__editor">
              <FileAttachment
                attachment={fileAttachment}
                uploadedFiles={attachedFilesLists}
                handleAttachedFiles={handleAttachedFiles}
              />
            </div>
          </div>
          <div className="review-rfi__signature">
            <div className="review-rfi__signature__label">Signature</div>
            <div className="review-rfi__signature__editor">
              {showSignature ? (
                <div  className="review-rfi__signature__editor__sign">
                  <div dangerouslySetInnerHTML={{ __html: signStr }}></div>
                    <IconButton onClick={clearSignature}  className="review-rfi__signature__editor__sign__clear"><CloseIcon/></IconButton>
                </div>
              ) : (
                <Button
                  data-testid={"reject-rfi"}
                  variant="outlined"
                  className="btn-secondary"
                  onClick={addSignature}
                  disabled={false}
                  //  onClick={() => rejectReview()}
                >
                  Add your signature
                </Button>
              )}
            </div>
          </div>

          <div className="review-rfi__action">
            {reviewFormData[0]?.outgoingOutcomes.length > 3 ? (
              <div className="review-rfi__action__outcomes">
                <div className="review-rfi__action__outcomes__label">
                  Outcome
                </div>
                <div className="review-rfi__action__outcomes__select">
                  <Select
                    id="custom-dropdown"
                    fullWidth
                    autoComplete='off'
                    placeholder="select a value"
                    variant="outlined"
                    value={"Action"}
                    onChange={(e) => handleConfirmBox(true, e.target.value)}
                  >
                    <MenuItem value={"Action"}>Please select...</MenuItem>
                    {reviewFormData[0]?.outgoingOutcomes.map(
                      (outComes: any) => (
                        <MenuItem key={outComes.outcome} value={outComes} className="mat-menu-item-sm">
                          {outComes.outcome}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </div>
              </div>
            ) : (
              <div>
                <div className="review-rfi__action__label">Select an Action </div>
                {reviewFormData[0]?.outgoingOutcomes.map((outComes: any) => (
                  <Button
                    key={outComes.outcome}
                    data-testid={outComes.outcome}
                    variant="outlined"
                    className="btn-primary"
                    onClick={() => handleConfirmBox(true, outComes)}
                    //  onClick={() => rejectReview()}
                  >
                    {outComes.outcome}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="confirm-rfi">
          <div className="confirm-rfi__header">Please Confirm</div>
          <div className="confirm-rfi__outcome">
            <div className="confirm-rfi__outcome__label">Outcome: </div>
            <div>{statusType}</div>
          </div>
          <div className="confirm-rfi__outcome">
            <div className="confirm-rfi__outcome__label">Next Step: </div>
            <div>{nextStep}</div>
          </div>
          {stepType === "task" && (
            <div className="confirm-rfi__assignee">
              <div className="confirm-rfi__assignee__label">
                Next Assignee :
              </div>
              <div className="confirm-rfi__assignee__lists">
                <div className="confirm-rfi__assignee__lists__chips">
                  {selectedUsers.map((user: any) => (
                    <Chip
                      key={user.id}
                      className="chips"
                      avatar={
                        <Avatar
                          alt={user?.firstName}
                          src="/static/images/avatar/1.jpg"
                        />
                      }
                      label={
                        user?.firstName
                          ? `${user?.firstName} ${user?.lastName || ""}`
                          : user?.email
                      }
                      onDelete={() => handleDeleteUser(user)}
                    />
                  ))}
                </div>
                <div
                  className="confirm-rfi__assignee__lists__add"
                  onClick={addAssignee}
                  ref={modalRef}
                >
                  + Add Assignee
                  {isAssigneeOpen ? (
                    <div className="confirm-rfi__assignee__lists__add__user-lists">
                      {tenantUserLists.map((user: any) => (
                        <MenuItem key={user.id} >
                          <Checkbox
                            checked={selectedUsers.find(
                              (item: any) => item.id === user.id
                            )}
                            onChange={(e) => handleAsignee(e, user)}
                            color="default"
                          />
                          <ListItemText primary={user.name} className="mat-menu-item-sm" />
                        </MenuItem>
                      ))}
                      {/* <div onClick={(e) => closeAssignee(e)}>
                                                        Close
                                                    </div> */}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="confirm-rfi__comments">
            <div className="confirm-rfi__comments__label">Comments</div>
          </div>
          <div className="confirm-rfi__comment-box">
            <div className="confirm-rfi__comment-box__editor">
              {/* <div dangerouslySetInnerHTML={{ __html: commentVaue }}>
                
              </div> */}
              <Editor
                editorState={editorState}
                editorClassName="editor-input"
                placeholder={isEmpty ? "Write your comments...." : ""}
                onEditorStateChange={onEditorStateChange}
                onBlur={handleCommentBlur}
                toolbar={{
                  inline: { inDropdown: true },
                  list: { inDropdown: true },
                  textAlign: { inDropdown: true },
                  colorPicker: {
                    className: "demo-option-hidden",
                  },
                  link: {
                    className: "demo-option-hidden",
                  },
                  emoji: {
                    className: "demo-option-hidden",
                  },
                  embedded: {
                    className: "demo-option-hidden",
                  },
                  image: {
                    className: "demo-option-hidden",
                  },
                  remove: { className: "demo-option-hidden" },
                  history: {
                    className: "demo-option-hidden",
                    undo: { className: "demo-option-hidden" },
                    redo: { className: "demo-option-custom" },
                  },
                }}
                toolbarStyle={{
                  fontSize: "12px",
                }}
              />
               {isCommentRequired && (
                <label className="review-rfi__comments__editor__error">
                  Comment is required
                </label>
              )}
            </div>
          </div>
          <div className="confirm-rfi__attachments">
            <div className="confirm-rfi__attachments__label">Attachments</div>
            <div className="confirm-rfi__attachments__files">
              {attachedFilesLists.length > 0
                ? attachedFilesLists.map((file: any, index: number) => (
                    <div
                      key={`${file.blobKey}-${index}`}
                      className="confirm-rfi__attachments__files__file"
                    >
                      <div className="confirm-rfi__attachments__files__file__thumbnail">
                        <DescriptionIcon />
                      </div>
                      <div className="confirm-rfi__attachments__files__file__fileName">
                        {file.fileName}
                        <div className="confirm-rfi__attachments__files__file__fileSize">
                          {(file.fileSize / (1024 * 1024)).toFixed(3)} MB
                        </div>
                      </div>
                    </div>
                  ))
                : "No files attached"}
            </div>
          </div>
          <div className="confirm-rfi__attachments">
            <div className="confirm-rfi__attachments__label">Signature</div>
            <div
              className={
                signStr
                  ? "confirm-rfi__attachments__signFiles"
                  : "confirm-rfi__attachments__files"
              }
            >
              {signStr ? (
                <div dangerouslySetInnerHTML={{ __html: signStr }}></div>
              ) : (
                "No signature added"
              )}
            </div>
          </div>
          <div className="confirm-rfi__action">
            <Button
              data-testid={"back-review"}
              variant="outlined"
              className="btn-secondary"
              onClick={() => handleback(false)}
            >
              Back
            </Button>
            <Button
              data-testid={"approve-rfi"}
              variant="outlined"
              className="btn-primary"
              disabled={isCommentRequired}
              onClick={() => handleSubmit()}
            >
              Confirm
            </Button>
          </div>
        </div>
      )}

      {confirmOpen ? (
        <ConfirmDialog
          open={confirmOpen}
          message={confirmMessage}
          close={handleConfirmBoxClose}
          proceed={confirmRejectReview}
        />
      ) : (
        ""
      )}
      {addAssigneOpen && <AddAssigneeDialog 
                  isOpen={addAssigneOpen}
                  save={saveAfterAddingAssignee}
                  cancel={()=>setAddAssigneOpen(false)} />}
    </>
  );
}
