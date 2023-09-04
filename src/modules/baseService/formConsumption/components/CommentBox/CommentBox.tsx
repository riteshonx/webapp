import React, { ReactElement, useState, useEffect, useRef } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import { Button } from '@material-ui/core';
import './CommentBox.scss';
import htmlToDraft from 'html-to-draftjs';

interface ICommentBoxInterface{
  data: string,
  close:()=> void,
  updateComment: (argValue: string)=> void,
  postComment:(argValue: string)=>void
}

export default function CommentBox(props: ICommentBoxInterface): ReactElement {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [error, setError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const ref: any = useRef();

  useEffect(() => {
    if(props.data){
      const contentBlock = htmlToDraft(props.data);
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [props.data])

  useEffect(()=>{
    if(ref?.current){
      ref.current?.focusEditor()
    }
  },[ref])

  const onEditorStateChange = (argEditorState: any) => {
    setEditorState(argEditorState)
    const blocks = convertToRaw(argEditorState.getCurrentContent()).blocks;
    if(blocks.length>0){
      blocks[0].type==='unstyled'?setIsEmpty(true):setIsEmpty(false);
    }
    const value = blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
    if(value.trim()){
      setError(false)
    }
  };

  const handleCancel=()=>{
    props.close();
  }

  const saveComment=()=>{
    const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
    const value = blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
    if(value.trim()){
      props.updateComment(draftToHtml(convertToRaw(editorState.getCurrentContent())));
      props.close();
    } else{
      setError(true);
    }
  }

  const createComment=()=>{
    const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
    const value = blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
    if(value.trim()){
      props.postComment(draftToHtml(convertToRaw(editorState.getCurrentContent())));
      props.close();
    } else{
      setError(true);
    }
  }
    return (
      <div className="commentBox">
        <Editor
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={onEditorStateChange}
          placeholder={isEmpty? 'Write your comments....':''}
          ref={ref}
          toolbar={{
            inline: { inDropdown: true },
            list: { inDropdown: true },
            textAlign: { inDropdown: true },
            colorPicker: {
              className: "demo-option-hidden"
            },
            link: {
              className: "demo-option-hidden"
            },
            emoji: {
              className: "demo-option-hidden"
            },
            embedded: {
              className: "demo-option-hidden"
            },
            image: {
              className: "demo-option-hidden"
            },
            remove: { className: "demo-option-hidden" },
            history: {
              className: "demo-option-hidden",
              undo: { className: "demo-option-hidden" },
              redo: { className: "demo-option-custom" }
            }
          }}
          toolbarStyle={{
            fontSize: "12px"
          }}
        />
        {error?(<label className="commentBox__error">Please enter comment</label>):("")}
        <div className="commentBox__action">
          {props?.data?(<Button variant="outlined" onClick={saveComment} className="btn-primary commentBox__action__post">Save</Button>):
          (<Button variant="outlined" onClick={createComment} className="btn-primary commentBox__action__post">Post</Button>)}
          <Button variant="outlined" onClick={handleCancel} className="btn-secondary commentBox__action__cancel">Cancel</Button>
        </div>
      </div>
    );
}