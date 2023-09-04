import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import "./popover.scss";
interface PopoverProps {
	children: React.ReactNode; // POPOVER view component
	trigger: React.ReactNode; // On click/hover of that component popover will come
	position?: "top" | "bottom" | "left" | "right"; // Direction of popover
	notch?: boolean; // make true if you need a pointer arrow to trigger element
	gap?: number; // space between trigger element and popover view
	hover?: boolean; // make true if using as a tooltip
	open?: boolean; // control popover from parent/trigger element
	foreignTrigger?: boolean; // make true if your trigger element is not a part of popover
	foreignTarget?: React.RefObject<HTMLDivElement>; // target element ref in case of foreignTarget
	closeOnClickOutside?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({
	children,
	trigger,
	position = "left",
	notch = true,
	gap = 12,
	open = false,
	foreignTrigger = false,
	hover = false,
	foreignTarget = null,
	closeOnClickOutside = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const triggerRef = useRef<HTMLDivElement>(null);
	const childrenRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsOpen(open);
	}, [open]);
	useEffect(() => {
		if (isOpen) {
			const parentRef = foreignTrigger ? foreignTarget : triggerRef;
			const triggerRect = foreignTrigger
				? foreignTarget?.current?.getBoundingClientRect() || {
						top: 0,
						left: 0,
						width: 0,
						height: 0,
				  }
				: triggerRef.current!.getBoundingClientRect();
			const childrenRect = childrenRef.current!.getBoundingClientRect();
			const windowHeight = window.innerHeight;
			const windowWidth = window.innerWidth;

			let top, left;

			switch (position) {
				case "top":
					top = triggerRect.top - childrenRect.height - gap;
					left = triggerRect.left + gap;
					break;
				case "bottom":
					top = triggerRect.top + triggerRect.height + gap;
					left = triggerRect.left + gap;
					break;
				case "left":
					top = triggerRect.top + gap;
					left = triggerRect.left - childrenRect.width - gap;
					break;
				case "right":
					top = triggerRect.top + gap;
					left = triggerRect.left + triggerRect.width + gap;
					break;
				default:
					top = triggerRect.top + gap;
					left = triggerRect.left - childrenRect.width - gap;
					break;
			}

			if (top + childrenRect.height > windowHeight) {
				top = windowHeight - childrenRect.height - gap;
			}

			if (left + childrenRect.width > windowWidth) {
				left = windowWidth - childrenRect.width - gap;
			}

			setPopoverPosition({ top, left });

			const handleClickOutside = (event: any) => {
				if (
					!childrenRef?.current?.contains(event.target) &&
					!parentRef?.current?.contains(event.target)
				) {
					setIsOpen(false);
				}
			};

			if (closeOnClickOutside) {
				document.addEventListener("mousedown", handleClickOutside);
				return () => {
					document.removeEventListener("mousedown", handleClickOutside);
				};
			}
		}
	}, [children, trigger, position, notch, isOpen]);

	const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

	const togglePopover = () => {
		setIsOpen(!isOpen);
	};
	const getTriggerElement = () => {
		return hover ? (
			<div
				ref={triggerRef}
				onMouseEnter={() => setIsOpen(true)}
				onMouseLeave={() => setIsOpen(false)}
			>
				{trigger}
			</div>
		) : (
			<div
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
						className='v2-popover'
						ref={childrenRef}
						style={{
							top: popoverPosition.top,
							left: popoverPosition.left,
						}}
					>
						{notch && <div className={"v2-popover-notch " + position}></div>}

						{children}
					</div>,
					document.body
				)}
		</>
	);
};
