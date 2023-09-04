import React from 'react'
import './RecepiePopover.scss'
const RecepiePopover = (props: any) => {
  return <div className="recepie-popover">
    <span>{props.text}</span>
    <button
      className="recepie-popover__more-details"
      onClick={props.onClick}
    >
      More Details
    </button>
  </div>
}

export default RecepiePopover
