import React, { useEffect, useRef, useState } from 'react';
import './timelineBar.scss';

interface TimelineProps {
  start: number;
  end: number;
  value: number;
  deadline: number;
}

export const TimelineBar = (props: TimelineProps): React.ReactElement => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [completeBarLength, setCompleteBarLength] = useState(300);
  const [deadlineBarLength, setDeadlineBarLength] = useState(100);

  useEffect(() => {
    setBarLength();
    window.addEventListener('resize', setBarLength);
  }, [props]);

  const setBarLength = () => {
    const { width } = timelineRef?.current?.getBoundingClientRect() || {
      width: 0,
    };
    setCompleteBarLength(
      (width / (props.end - props.start)) * (props.value - props.start)
    );
    setDeadlineBarLength(
      (width / (props.end - props.start)) * (props.end - props.deadline)
    );
  };

  return (
    <div className="v2-timeline">
      <div className="v2-timeline-bar" ref={timelineRef}>
        <div
          className="v2-timeline-bar-point"
          data-label="Start Date"
          style={{ left: 0 }}
          title={props.start.toString()}
        />
        <div
          className="v2-timeline-bar-point"
          data-label="End Date"
          style={{ right: 0 }}
          title={props.end.toString()}
        />
        <div
          className="v2-timeline-bar-point blink"
          data-label="PPC"
          style={{ left: `${completeBarLength}px` }}
          title={props.value.toString()}
        />
        <div
          className="v2-timeline-bar-line"
          data-label="87 Checklists open"
          style={{
            width: `${completeBarLength}px`,
            left: '0px',
            borderColor: 'white',
          }}
        />
        <div
          className="v2-timeline-bar-line"
          style={{
            width: `${deadlineBarLength}px`,
            borderColor: 'red',
            right: '0px',
          }}
        />
      </div>
    </div>
  );
};
