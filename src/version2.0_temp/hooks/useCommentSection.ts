import { useState } from "react";

export const useCommentSection = () => {
  const [state, setState] = useState(false);

  function handleToggleState(){
    setState(prevState=> !prevState)
  }

  return {
    commentState: state,
    toggleCommentState:handleToggleState
  };
};
