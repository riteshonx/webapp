import React, { useState } from "react";
import { ArrowIcon } from "../arrowIcon/arrowIcon";
import { Popover } from "../popover/popover"
import './projectMetric.scss'
const DUMMY_METRICS_DATA = [
  {
    name: 'Productivity',
    value: '+15%',
    up: true
  },
  {
    name: 'Metric 01',
    value: '40',
    up: true
  },
  {
    name: 'Metric 02',
    value: '20',
    up: false
  },
  {
    name: 'Metric 03',
    value: '100',
    up: true
  },
]
export const ProjectMetrics = (): React.ReactElement => {
  const getProjectMetricsCard = (obj: any) => {
    return <div key={obj.name} className="v2-project-metrics-card">
    <div className="v2-project-metrics-card-title">{obj.name}</div>
    <div className="v2-project-metrics-card-value s-flex">
      <span>{obj.value}</span>
      <ArrowIcon size={24} fill={obj.up ? '#16874A' : '#863839'} />
    </div>
  </div>
  } 
  return (
    <div className="v2-project-metrics">
      {DUMMY_METRICS_DATA.map((obj) => (
        <Popover trigger={getProjectMetricsCard(obj)}>
          <div className="v2-project-metrics-popover">ef wer fw erf wer</div>
        </Popover>
      ))}
    </div>
  );
}
