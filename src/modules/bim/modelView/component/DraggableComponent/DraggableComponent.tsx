import React, { useRef, useEffect } from 'react'
import DragIndicator from '@material-ui/icons/DragIndicator';
import './DraggableComponent.scss'

export default function DraggableComponent(props: any) {
  let currPosLft = 0, currPosTop = 0, oldPosLft = 0, oldPosTop = 0;
  const dragEl = useRef<HTMLInputElement>(null)
  let bimDragDiv: any;
  const randId = Math.floor(Math.random() * 101);

  useEffect(() => {
    bimDragDiv = document.getElementById("bimDragDiv" + randId);
    startEventListner();
    return () => {removeEventListner(); };
  }, [])

  function startEventListner() {
    bimDragDiv.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
  }

  function removeEventListner() {
    document.removeEventListener('mouseup', onMouseUp)
    bimDragDiv.removeEventListener('mousedown', onMouseDown);
  }

  function onMouseDown(event: any) {
    oldPosLft = event.clientX;
    oldPosTop = event.clientY;
    document.addEventListener('mousemove', onMouseMove);
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove)
  }

  function  onMouseMove (event: any) {
    if(dragEl.current) {
      event.preventDefault();
      currPosLft = oldPosLft - event.clientX;
      currPosTop = oldPosTop - event.clientY;
      oldPosLft = event.clientX;
      oldPosTop = event.clientY;
      dragEl.current.style.top = (dragEl.current.offsetTop - currPosTop) + "px";
      dragEl.current.style.left = (dragEl.current.offsetLeft - currPosLft) + "px";
    }
  }

  return (
    <div
      id={"bimDragDiv" + randId}
      className={"bimDragDiv"}
      ref={dragEl}
      style={props.styles || {}}
    >
      <DragIndicator 
        id={"bimDragButton"}
        className="dargButton"
      />
      <>{props.children}</>
    </div>
  )
}
