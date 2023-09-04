import React, { ReactElement, useContext, useEffect, useState } from "react";
import Comment from "../Comment/Comment";
import { client } from "../../../../../services/graphql";
import "./CommentSection.scss";
import {
  INSERT_ROOT_COMMENT,
  LOAD_FORM_COMMENTS,
} from "../../graphql/queries/comments";
import { stateContext } from "../../../../root/context/authentication/authContext";
import CommentBox from "../CommentBox/CommentBox";
import { match, useRouteMatch } from "react-router-dom";
import { FormComment } from "../../models/comment";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { Avatar } from "@material-ui/core";
import { projectContext } from "../../Context/projectContext";
import { featureFormRoles } from "src/utils/role";

export interface Params {
  id: string;
  formId: string;
}

export interface ICommentProps {
  active: boolean;
}

function CommentSection({ active }: ICommentProps): ReactElement {
  const [addNewComment, setAddNewComment] = useState(false);
  const { state, dispatch }: any = useContext(stateContext);
  const pathMatch: match<Params> = useRouteMatch();
  const [existingComment, setExistingComment] = useState<Array<FormComment>>(
    []
  );
  const [showMore, setShowMore] = useState(false);
  const { projectState, projectDispatch }: any = useContext(projectContext);

  useEffect(() => {
    if (state?.selectedProjectToken) {
      fetchComments();
    }
  }, [state?.selectedProjectToken]);

  const fetchComments = async () => {
    try {
      dispatch(setIsLoading(true));
      const commentsResponse = await client.query({
        query: LOAD_FORM_COMMENTS,
        variables: {
          formId: Number(pathMatch.params.formId),
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      if (commentsResponse.data.comments.length > 0) {
        const listOfComments = getFormComments(commentsResponse.data.comments);
        setExistingComment(listOfComments);
      } else {
        setExistingComment([]);
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
      setAddNewComment(false);
      console.log(error);
    }
  };

  const getFormComments = (comments: any): Array<FormComment> => {
    const listOfComments = [...comments];
    listOfComments.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const returnValue: Array<FormComment> = [];
    listOfComments.forEach((item) => {
      let childComments: Array<FormComment> = [];
      if (item.childComments) {
        childComments = getFormComments(item.childComments);
      }
      const newComment: FormComment = new FormComment(
        item.id,
        item.comment,
        childComments,
        item.createdByUser,
        item.createdAt,
        item?.parentId
      );
      returnValue.push(newComment);
    });
    return returnValue;
  };

  const postNewComment = async (argData: string) => {
    try {
      dispatch(setIsLoading(true));
      await client.mutate({
        mutation: INSERT_ROOT_COMMENT,
        variables: {
          formId: Number(pathMatch.params.formId),
          comment: argData,
        },
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      fetchComments();
      setAddNewComment(false);
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const updateCommentValue = () => {
    fetchComments();
  };

  const removeComment = () => {
    fetchComments();
  };

  return (
    <div className="commentsection">
      <div className="commentsection__header" data-testid="comments-count">
        {existingComment.length > 0 ? (
          <>{existingComment.length} Comments</>
        ) : (
          "No Comments"
        )}
      </div>
      <div className="commentsection__list">
        {projectState?.featurePermissions?.canUpdateForm && active ? (
          <div
            className="commentsection__list__new"
            data-testid="comments-add-new"
          >
            {addNewComment ? (
              <CommentBox
                close={() => setAddNewComment(false)}
                data={""}
                postComment={postNewComment}
                updateComment={postNewComment}
                data-testid="comments-count-new"
              />
            ) : (
              <>
                <Avatar
                  src="/"
                  className="commentsection__list__new__icon"
                  data-testid="comments-count-new-avator"
                />
                <div
                  onClick={() => setAddNewComment(true)}
                  data-testid="comments-count-new-div"
                  className="commentsection__list__new__comment"
                >
                  {" "}
                  Write your comments....
                </div>
              </>
            )}
          </div>
        ) : (
          ""
        )}

        {projectState?.featurePermissions?.canViewForm
          ? showMore
            ? existingComment.map((item: any) => (
                <Comment
                  messageData={item}
                  index={"ROOT"}
                  active={active}
                  key={`Root-${item.id}`}
                  data-testid={`comments-existing-${item.id}`}
                  update={updateCommentValue}
                  deleteSelectedComment={removeComment}
                />
              ))
            : existingComment
                .slice(0, 2)
                .map((item: any) => (
                  <Comment
                    messageData={item}
                    active={active}
                    index={"ROOT"}
                    key={`Root-${item.id}`}
                    data-testid={`comments-existing-${item.id}`}
                    update={updateCommentValue}
                    deleteSelectedComment={removeComment}
                  />
                ))
          : ""}
        {projectState?.featurePermissions?.canViewForm ? (
          existingComment.length <= 2 ? (
            ""
          ) : showMore && existingComment.length > 2 ? (
            <div
              onClick={() => setShowMore(false)}
              data-testid={`comments-existing-viewless`}
              className="commentsection__list__more"
            >
              Show Less
            </div>
          ) : (
            <div
              onClick={() => setShowMore(true)}
              data-testid={`comments-existing-viewmore`}
              className="commentsection__list__more"
            >
              VIEW MORE COMMENTS (
              {existingComment.length > 0 ? existingComment.length - 2 : ""})
            </div>
          )
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default CommentSection;
