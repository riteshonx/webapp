import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './popover.scss';
interface PopoverProps {
  children: React.ReactNode; // POPOVER view component
  trigger: React.ReactNode; // On click/hover of that component popover will come
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'; // Direction of popover
  notch?: boolean; // make true if you need a pointer arrow to trigger element
  gap?: number; // space between trigger element and popover view
  hover?: boolean; // make true if using as a tooltip
  open?: boolean; // control popover from parent/trigger element
  foreignTrigger?: boolean; // make true if your trigger element is not a part of popover
  foreignTarget?: React.RefObject<HTMLDivElement>; // target element ref in case of foreignTarget
  foreignTargetBox?: DOMRect;
  closeOnClickOutside?: boolean;
  reRender?: number
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  trigger,
  position = 'left',
  notch = true,
  gap = 12,
  open = false,
  foreignTrigger = false,
  hover = false,
  foreignTarget = null,
  foreignTargetBox = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  } as DOMRect,
  closeOnClickOutside = false,
  reRender = 0
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const [popoverDirection, setPopoverDirection] = useState('left');
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [notchPosition, setNotchPosition] = useState('auto auto auto auto')

  useEffect(() => {
    if (isOpen !== open) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    renderPopover()
  }, [
    children,
    trigger,
    position,
    notch,
    isOpen
  ]);

  useEffect(() => {
    renderPopover()
  }, [reRender])

  const renderPopover = () => {
    if (isOpen) {
      const parentRef = foreignTrigger ? foreignTarget : triggerRef;
      const triggerRect = foreignTrigger
        ? foreignTarget?.current?.getBoundingClientRect() || foreignTargetBox
        : triggerRef.current!.getBoundingClientRect();
      const childrenRect = childrenRef.current!.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      setPopoverDirection(position);

      let top, left, notchPositionInset;


      switch (position) {
        case 'top':
          top = triggerRect.top - childrenRect.height - gap;
          left =
            triggerRect.left - childrenRect.width / 2 + triggerRect.width / 2;
          notchPositionInset = 'auto auto -7px 50%'
          break;
        case 'bottom':
          top = triggerRect.top + triggerRect.height + gap;
          left =
            triggerRect.left - childrenRect.width / 2 + triggerRect.width / 2;
          notchPositionInset = '-10px auto auto 50%'
          break;
        case 'left':
          top = triggerRect.top + gap;
          left = triggerRect.left - childrenRect.width - gap;
          notchPositionInset = '7px -14px auto auto'
          break;
        case 'right':
          top = triggerRect.top + gap;
          left = triggerRect.left + triggerRect.width + gap;
          notchPositionInset = '7px auto auto -14px'
          break;
        case 'top-right':
          top = triggerRect.top - childrenRect.height - gap;
          left = triggerRect.left + triggerRect.width / 2 - gap;
          notchPositionInset = 'auto auto -7px 7px'

          break;
        case 'top-left':
            top = triggerRect.top - childrenRect.height - gap;
            left = triggerRect.left - childrenRect.width / 2 - triggerRect.width + gap;
            notchPositionInset = 'auto 7px -7px auto'
            break;
        case 'bottom-right':
          top = triggerRect.top + triggerRect.height + gap;
          left = triggerRect.left + triggerRect.width / 2 - gap;
          notchPositionInset = '-10px auto auto 7px'
          break;
        case 'bottom-left':
            top = triggerRect.top + triggerRect.height + gap;
            left = triggerRect.left - childrenRect.width / 2 - triggerRect.width + gap;
            notchPositionInset = '7px -14px auto auto'
            break;
        default:
          top = triggerRect.top + gap;
          left = triggerRect.left - childrenRect.width - gap;
          notchPositionInset = '-10px 7px auto auto'
          break;
      }

      // Position Intelligence
      switch (position) {
        case 'top':
          if (top < 60) {
            top = triggerRect.top + triggerRect.height + gap;
            left =
              triggerRect.left - childrenRect.width / 2 + triggerRect.width / 2;
            setPopoverDirection('bottom');
            notchPositionInset = '-10px auto auto 50%'
          }
          break;

        case 'bottom':
          if (top + childrenRect.height > windowHeight - 20) {
            top = triggerRect.top - childrenRect.height - gap;
            left =
              triggerRect.left - childrenRect.width / 2 + triggerRect.width / 2;
            setPopoverDirection('top');
            notchPositionInset = 'auto auto -7px 50%'
          }
          break;
        case 'left':
          if (left < 20) {
            top = triggerRect.top + gap;
            left = triggerRect.left + triggerRect.width + gap;
            setPopoverDirection('right');
            notchPositionInset = '7px auto auto -14px'
          }
          break;
        case 'right':
          if (left + childrenRect.width > windowWidth - 20) {
            top = triggerRect.top + gap;
            left = triggerRect.left - childrenRect.width - gap;
            setPopoverDirection('left');
            notchPositionInset = '7px -14px auto auto'
          }
          break
        case 'top-right':
          let topRightShift = 0
          let topRightDirection = 'top-right'
          if (left + childrenRect.width > windowWidth - 30) {
            const newLeft = windowWidth - 30 - childrenRect.width
            topRightShift = left - newLeft
            left = newLeft
          }
          if (top < 20) {
            top = triggerRect.top + triggerRect.height + gap;
            topRightDirection = 'bottom-right';
          }
          if (topRightDirection === 'top-right') {
            notchPositionInset = `auto auto -7px ${topRightShift + 7}px`
          } else if (topRightDirection === 'bottom-right') {
            notchPositionInset = `-10px auto auto ${topRightShift + 7}px`
          }
          setPopoverDirection(topRightDirection)
          break;
        case 'top-left':
          let topLeftShift = 0
          let topLeftDirection = 'top-left'
          if (left < 30) {
            const newLeft = 30
            topLeftShift = newLeft - left
            left = newLeft
          }
          if (top < 20) {
            top = triggerRect.top + triggerRect.height + gap;
            topLeftDirection = 'bottom-left';
          }
          if (topLeftDirection === 'top-left') {
            notchPositionInset = `auto ${topLeftShift + 7} -7px auto`
          } else if (topLeftDirection === 'bottom-left') {
            notchPositionInset = `-10px ${topLeftShift + 7} 0px auto`
          }
          setPopoverDirection(topLeftDirection)
          break;
      }

      setPopoverPosition({ top, left });
      setNotchPosition(notchPositionInset)

      const handleClickOutside = (event: any) => {
        if (
          !childrenRef?.current?.contains(event.target) &&
          !parentRef?.current?.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      if (closeOnClickOutside) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }
  }
  const togglePopover = () => {
    setIsOpen(!isOpen);
  };
  const getTriggerElement = () => {
    return hover ? (
      <div
        className="v2-popover-container"
        ref={triggerRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {trigger}
      </div>
    ) : (
      <div
        className="v2-popover-container"
        ref={triggerRef}
        onClick={togglePopover}
      >
        {trigger}
      </div>
    );
  };
  return (
    <>
      {!foreignTrigger && getTriggerElement()}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            className="v2-popover"
            ref={childrenRef}
            style={{
              top: popoverPosition.top,
              left: popoverPosition.left,
            }}
          >
            {notch && (
              <div className={'v2-popover-notch ' + popoverDirection} style={{
                inset: notchPosition
              }}></div>
            )}

            {children}
          </div>,
          document.body
        )}
    </>
  );
};
