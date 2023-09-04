import React, { ReactElement, Children, useRef, useEffect, FC, useLayoutEffect, useState } from 'react';
import './ResizeWindow.scss'

const Slot: FC<{
    name: 'leftActions' | 'rightActions';
}> = () => null;

function ResizeWindow(props: any): ReactElement {
    const childrenArray = Children.toArray(props.children) as unknown as React.ReactElement[];
    const leftActionsSlot = childrenArray.find(child => child.props.name === 'leftActions');
    const rightActionsSlot = childrenArray.find(child => child.props.name === 'rightActions');
    const parentRef = useRef<HTMLDivElement>(null);
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);
    let drag = false;
    let parentBox: DOMRect = {} as DOMRect
    let minWidth = props.minWidth

    useEffect(() => {
        /*
        1. We’re getting the parent element’s bounding box.
        2. We’re checking if the parent element’s width is less than the sum of the left and right widths.
        3. If it is, we’re setting the minWidth to half the parent element’s width.
        4. We’re setting the left and right widths to be equal to the parent element’s width divided by 2.
        */
        if (parentRef.current) {
            parentBox = parentRef.current.getBoundingClientRect()
            if (minWidth * 2 > parentBox.width) {
                minWidth = parentBox.width / 2
            }
        }
        if (leftRef.current) {
            leftRef.current.style.width = (((parentBox.width * props.leftWidth) / 100) - 5) + 'px'
        }
        if (rightRef.current) {
            rightRef.current.style.width = (((parentBox.width * props.rightWidth) / 100) - 5) + 'px'
        }
    }, []);

    /*
    * It creates a drag event that will resize the left and right boxes.
    */
    const dragEvent = (event: any) => {
        event.preventDefault()
        if (parentRef.current) {
            parentBox = parentRef.current.getBoundingClientRect()
        }
        let leftWidth = (event.x - parentBox.x) - 5 < minWidth ? minWidth : (event.x - parentBox.x) - 5
        let rightWidth = parentBox.width - leftWidth - 5
        if (rightWidth < minWidth) {
            rightWidth = minWidth
            leftWidth = parentBox.width - rightWidth - 10
        }
        if (leftRef.current) {
            leftRef.current.style.width = leftWidth + 'px'
        }
        if (rightRef.current) {
            rightRef.current.style.width = rightWidth + 'px'
        }
    }

    /*
    1. This function will be called when the mouseup event is triggered.
    2. Remove window event listener
    */
    const stopDragEvent = () => {
        drag = false
        window.removeEventListener('mousemove', dragEvent)
        window.removeEventListener('mouseup', stopDragEvent)
    }

    const startDragEvent = () => {
        drag = true
        window.addEventListener('mousemove', dragEvent, false)
        window.addEventListener('mouseup', stopDragEvent, false)
    }

    return (
        <div className="resizeWindow" ref={parentRef}>
            <div className="resizeWindow__left" ref={leftRef}>
                {leftActionsSlot?.props?.children}
            </div>
            <div
                className="resizeWindow__slider"
                onMouseDown={startDragEvent}
            />
            <div className="resizeWindow__right" ref={rightRef}>
                {rightActionsSlot?.props?.children}
            </div>
        </div>
    )
}

ResizeWindow.Slot = Slot

export default ResizeWindow