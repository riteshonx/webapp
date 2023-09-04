import { MenuItem, Select } from '@material-ui/core';
import { gantt } from 'dhtmlx-gantt';
import React, { ReactElement, useEffect, useState } from 'react';
import { CustomPopOver } from 'src/modules/shared/utils/CustomPopOver';
import {
  weekScaleTemplate,
  weekScaleTemplateWithoutMonth,
} from '../../utils/ganttConfig';
import './GanttView.scss';

function GanttView(props: any): ReactElement {
  const { lookAheadStatus, setLookAheadView } = props;
  const [activeView, setActiveView] = useState<string>('week');
  const classes = CustomPopOver();

  useEffect(() => {
    if (lookAheadStatus) {
      setActiveView('default');
      setLookAheadView('default');
    } else {
      setActiveView('week');
    }
  }, [lookAheadStatus]);

  useEffect(() => {
    gantt.config.work_time = true;

    gantt.templates.timeline_cell_class = (task: any, date: Date) => {
      if (
        !gantt.isWorkTime({ task: task, date: date }) &&
        (activeView == 'week' ||
          activeView == 'default' ||
          activeView == 'lAWeekly')
      ) {
        return 'weekend';
      }
      return '';
    };
  }, [activeView]);

  const onViewChange = (viewType: string) => {
    setActiveView(viewType);
    switch (viewType) {
      case 'week':
        gantt.config.min_column_width = 40;
        gantt.config.scales = [
          {
            unit: 'week',
            step: 1,
            format: weekScaleTemplate,
            css: function (date: Date) {
              return 'gantt_scale_cell_style';
            },
          },
          {
            unit: 'day',
            step: 1,
            date: '%d',
            css: function (date: Date) {
              if (!gantt.isWorkTime(date)) {
                return 'weekend';
              }
              return '';
            },
          },
        ];
        break;
      case 'month':
        gantt.config.min_column_width = 60;
        gantt.config.scales = [
          {
            unit: 'month',
            step: 1,
            date: '%M - %Y',
            css: function (date: Date) {
              return 'gantt_scale_cell_style';
            },
          },
          { unit: 'week', format: weekScaleTemplateWithoutMonth },
        ];
        break;
      case 'year':
        gantt.config.min_column_width = 40;
        gantt.config.scales = [
          {
            unit: 'year',
            step: 1,
            date: '%Y',
            css: function (date: Date) {
              return 'gantt_scale_cell_style';
            },
          },
          {
            unit: 'month',
            step: 1,
            date: '%M',
            css: function (date: Date) {
              return 'gantt_secondary_scale';
            },
          },
        ];
        break;
      default:
        gantt.config.min_column_width = 40;
        gantt.config.scales = [
          {
            unit: 'week',
            step: 1,
            format: weekScaleTemplate,
            css: function (date: Date) {
              return 'gantt_scale_cell_style';
            },
          },
          {
            unit: 'day',
            step: 1,
            date: '%d',
            css: function (date: Date) {
              if (!gantt.isWorkTime(date)) {
                return 'weekend';
              }
              return '';
            },
          },
        ];
    }
    gantt.render();
  };

  const onViewLookAheadChange = (viewType: string) => {
    setActiveView(viewType);
    switch (viewType) {
      case 'default':
        setLookAheadView(viewType);
        break;
      case 'lAWeekly':
        setLookAheadView(viewType);
    }
  };

  return (
    <div className="view">
      <label className="view__label">Views </label>
      {!lookAheadStatus ? (
        <>
          <Select
            id="custom-dropdown-ganttview"
            autoComplete="search"
            variant="outlined"
            value={activeView}
            className="view__select"
            onChange={(e: any) => onViewChange(e.target.value)}
            MenuProps={{
              classes: { paper: classes.root },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              getContentAnchorEl: null,
            }}
          >
            <MenuItem key="gv-weely" value="week" className="mat-menu-item-sm">
              Weekly
            </MenuItem>
            <MenuItem
              key="gv-monthly"
              value="month"
              className="mat-menu-item-sm"
            >
              Monthly
            </MenuItem>
            <MenuItem key="gv-yearly" value="year" className="mat-menu-item-sm">
              Yearly
            </MenuItem>
          </Select>
        </>
      ) : (
        <>
          <Select
            id="custom-dropdown-ganttview"
            autoComplete="search"
            variant="outlined"
            value={activeView}
            onChange={(e: any) => onViewLookAheadChange(e.target.value)}
            MenuProps={{
              classes: { paper: classes.root },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              getContentAnchorEl: null,
            }}
          >
            <MenuItem
              key="gv-default"
              value="default"
              className="mat-menu-item-sm"
            >
              Default
            </MenuItem>
            <MenuItem
              key="gv-weely"
              value="lAWeekly"
              className="mat-menu-item-sm"
            >
              Weekly
            </MenuItem>
          </Select>
        </>
      )}
    </div>
  );
}

export default GanttView;
