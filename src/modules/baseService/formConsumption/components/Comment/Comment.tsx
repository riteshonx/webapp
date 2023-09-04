import React, { ReactElement, useContext, useEffect, useState } from "react";
// import ThumbUpAltOutlinedIcon from '@material-ui/icons/ThumbUpAltOutlined';
import "./Comment.scss";
import CommentBox from "../CommentBox/CommentBox";
import { client } from "../../../../../services/graphql";
import {
  DELETE_COMMENT,
  INSERT_CHILD_COMMENT,
  LOAD_FORM_COMMENT_DETAILS,
  UPDATE_COMMENT,
  UPDATE_COMMENT_AS_DELETED,
} from "../../graphql/queries/comments";
import { match, useRouteMatch } from "react-router-dom";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { FormComment } from "../../models/comment";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { setIsLoading } from "../../../../root/context/authentication/action";
import moment from "moment";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import { Avatar } from "@material-ui/core";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import { projectContext } from "../../Context/projectContext";
import { featureFormRoles } from "../../../../../utils/role";
import { decodeExchangeToken } from "../../../../../services/authservice";
import Autolinker from "autolinker";

interface IProps {
  index: string;
  messageData: FormComment;
  active: boolean;
  update: () => void;
  deleteSelectedComment: () => void;
}
export interface Params {
  id: string;
  formId: string;
}

const dialogMessage = {
  header: "Delete Comment",
  text: "Are you sure you want to delete this comment? ",
  cancel: "Cancel",
  proceed: "Delete",
};

function Comment({
  index,
  messageData,
  update,
  deleteSelectedComment,
  active,
}: IProps): ReactElement {
  const [showChild, setshowChild] = useState(false);
  const [updateCommentVisible, setUpdateCommentVisible] = useState(false);
  const [replyCommentVisble, setReplyCommentVisble] = useState(false);
  const pathMatch: match<Params> = useRouteMatch();
  const { state, dispatch }: any = useContext(stateContext);
  const [currentCommentDetails, setCurrentCommentDetails] = useState<any>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { projectState, projectDispatch }: any = useContext(projectContext);

  useEffect(() => {
    fetchComments();
  }, []);

  const renderDate = (argDate: Date): string => {
    const hour = 3600 * 1000;
    const min = 60 * 1000;
    const day = 24 * hour;
    const givenTime = new Date(argDate).getTime();
    const now = new Date().getTime();
    const yesterDay = 2 * day;
    const dateDiff = now - givenTime;
    if (dateDiff > day && dateDiff < yesterDay) {
      return `Yesterday ${moment(argDate).utc().format("h:mm:ss a")}`;
    } else if (dateDiff < day && dateDiff > hour) {
      return `${Math.floor(dateDiff / (3600 * 1000))} hours ago`;
    } else if (dateDiff < hour && dateDiff > min) {
      return `${Math.ceil(dateDiff / (60 * 1000))} min ago`;
    } else if (dateDiff < min) {
      return `now`;
    } else {
      return moment(argDate).utc().format("DD MMM YYYY h:mm:ss a");
    }
  };

  const updateComment = async (argData: string) => {
    try {
      await client.mutate({
        mutation: UPDATE_COMMENT,
        variables: {
          id: messageData.id,
          comment: argData,
        },
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      update();
    } catch (error) {}
  };

  const replyComment = async (argData: string) => {
    try {
      dispatch(setIsLoading(true));
      await client.mutate({
        mutation: INSERT_CHILD_COMMENT,
        variables: {
          formId: Number(pathMatch.params.formId),
          comment: argData,
          parentId: messageData.id,
        },
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      fetchComments();
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  const fetchComments = async () => {
    try {
      dispatch(setIsLoading(true));
      const commentsResponse = await client.query({
        query: LOAD_FORM_COMMENT_DETAILS,
        variables: {
          formId: Number(pathMatch.params.formId),
          id: messageData.id,
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      if (commentsResponse.data.comments.length > 0) {
        const details = { ...commentsResponse.data.comments[0] };
        if (details?.childComments && details?.childComments.length > 0) {
          const sortItem = [...details.childComments];
          sortItem.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          details.childComments = sortItem;
        }
        setCurrentCommentDetails(details);
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const deleteCommentConfirmation = () => {
    setConfirmOpen(true);
  };

  const deleteComment = async () => {
    try {
      dispatch(setIsLoading(true));
      setConfirmOpen(false);
      let role = featureFormRoles.deleteForm;
      let mutation = DELETE_COMMENT;
      if (messageData.createdByUser.id === decodeExchangeToken().userId) {
        role = featureFormRoles.updateForm;
        mutation = UPDATE_COMMENT_AS_DELETED;
      }
      await client.mutate({
        mutation,
        variables: {
          id: messageData.id,
        },
        context: {
          role,
          token: state?.selectedProjectToken,
        },
      });
      deleteSelectedComment();
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const showMore = () => {
    if (!showChild) {
      fetchComments();
    }
    setshowChild(!showChild);
  };

  const updateCommentValue = () => {
    fetchComments();
  };

  const removeComment = () => {
    fetchComments();
  };

  return (
    <div className="comment">
      <div className="comment__user">
        <Avatar
          data-testid={`Avatar-${messageData.id}`}
          src="/"
          alt={`${messageData.createdByUser?.firstName || ""} 
                ${messageData.createdByUser?.lastName || ""}`}
          className="comment__user__icon"
        />
        <div className="comment__user__name">{`${
          messageData.createdByUser?.firstName || ""
        } 
                ${messageData.createdByUser?.lastName || ""}`}</div>
      </div>
      {/* Update and View Comment */}
      {updateCommentVisible ? (
        <div
          className="comment__message"
          data-testid={`commentbox-${messageData.id}`}
        >
          <CommentBox
            close={() => setUpdateCommentVisible(false)}
            data={messageData.comment}
            updateComment={updateComment}
            postComment={updateComment}
          />
        </div>
      ) : (
        <>
          <div
            data-testid={`message-${messageData.id}`}
            className="comment__message"
            dangerouslySetInnerHTML={{
              __html: Autolinker.link(messageData.comment),
            }}
          ></div>
          <div
            className="comment__info"
            data-testid={`action-container-${messageData.id}`}
          >
            <div className="comment__info__time">
              {renderDate(messageData.createdAt)}
            </div>
            {(projectState?.featurePermissions?.canUpdateForm ||
              messageData.createdByUser.id === decodeExchangeToken().userId) &&
            active ? (
              <div
                className="comment__info__reply"
                onClick={() => setUpdateCommentVisible(true)}
                data-testid={`action-edit-${messageData.id}`}
              >
                Edit
              </div>
            ) : (
              ""
            )}
            {index === "ROOT" &&
            projectState?.featurePermissions?.canCreateForm &&
            active ? (
              <div
                className="comment__info__reply"
                onClick={() => setReplyCommentVisble(true)}
                data-testid={`action-reply-${messageData.id}`}
              >
                Reply
              </div>
            ) : (
              ""
            )}
            {(projectState?.featurePermissions?.canDeleteForm ||
              messageData.createdByUser.id === decodeExchangeToken().userId) &&
            active ? (
              <div
                className="comment__info__like"
                onClick={deleteCommentConfirmation}
              >
                <DeleteOutlineOutlinedIcon
                  data-testid={`action-delete-${messageData.id}`}
                  className="comment__info__like__icon"
                />
              </div>
            ) : (
              ""
            )}
            {/* <div className="comment__info__like">
                                <ThumbUpAltOutlinedIcon className="comment__info__like__icon"/>
                             </div> */}
          </div>
        </>
      )}
      {/* Reply Comment */}
      {replyCommentVisble ? (
        <div
          className="comment__message"
          data-testid={`reply-comment-${messageData.id}`}
        >
          <CommentBox
            close={() => setReplyCommentVisble(false)}
            data={""}
            postComment={replyComment}
            updateComment={replyComment}
          />
        </div>
      ) : (
        ""
      )}
      {/* Current Comment Replies */}
      {currentCommentDetails?.childComments.length > 0 && index === "ROOT" && (
        <div className="comment__replies">
          {!showChild ? (
            <div className="comment__replies__header">
              <AvatarGroup max={3}>
                {currentCommentDetails?.childComments.map(
                  (currentComment: any) => (
                    <Avatar
                      src="/"
                      alt={`${currentComment.createdByUser?.firstName || ""} 
                                ${
                                  currentComment.createdByUser?.lastName || ""
                                }`}
                      key={`icons-${currentComment.id}`}
                      data-testid={`replied-users-${messageData.id}`}
                    />
                  )
                )}
              </AvatarGroup>
              {projectState?.featurePermissions?.canViewForm ? (
                <div
                  className="comment__replies__header__action"
                  onClick={showMore}
                  data-testid={`replied-actionbtn-${messageData.id}`}
                >
                  Replied
                </div>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
          {showChild && currentCommentDetails
            ? currentCommentDetails.childComments.map((currentComment: any) => (
                <Comment
                  data-testid={`comment-child-${currentComment.id}`}
                  active={active}
                  messageData={currentComment}
                  update={updateCommentValue}
                  deleteSelectedComment={removeComment}
                  index={`child`}
                  key={`nested-comment-${currentComment.id}`}
                />
              ))
            : ""}
        </div>
      )}
      {confirmOpen ? (
        <ConfirmDialog
          open={confirmOpen}
          message={dialogMessage}
          close={() => setConfirmOpen(false)}
          proceed={deleteComment}
        />
      ) : (
        ""
      )}
    </div>
  );
}

export default Comment;
