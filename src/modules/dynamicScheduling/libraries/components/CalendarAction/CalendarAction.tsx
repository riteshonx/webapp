import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import AppsIcon from '@material-ui/icons/Apps';
import SearchIcon from '@material-ui/icons/Search';
import ViewListIcon from '@material-ui/icons/ViewList';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { createTenantCalendar } from '../../../permission/scheduling';
import CalendarContext from '../../../context/calendar/calendarContext';
import CreateCalendarTemplate from '../CreateCalendarTemplate/CreateCalendarTemplate';
import './CalendarAction.scss';

export default function CalendarAction(props: any): ReactElement {
  const changeView = (type: string) => {
    props.toggleView(type);
  };
  const [createDialogOpen, setcreateDialogOpen] = useState(false);
  const calendarContext = useContext(CalendarContext);
  const { getCalendars } = calendarContext;
  const [searchText, setSearchText] = useState('');
  const debounceName = useDebounce(searchText, 1000);

  useEffect(() => {
    getCalendars(debounceName);
  }, [debounceName]);

  const handlecreateDialogOpen = () => {
    setcreateDialogOpen(true);
  };
  const handlecreateDialogClose = () => {
    setcreateDialogOpen(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  return (
    <div className="calendar-action">
      <div className="calendar-action__tab">
        <div
          className={
            props.view === 'gallery'
              ? 'calendar-action__tab__gallery--active'
              : 'calendar-action__tab__gallery'
          }
          onClick={() => changeView('gallery')}
        >
          <AppsIcon
            className="calendar-action__tab__icon"
            fontSize="small" 
          ></AppsIcon>
          Gallery View
        </div>
        <div
          className={
            props.view === 'list'
              ? 'calendar-action__tab__list--active'
              : 'calendar-action__tab__list'
          }
          onClick={() => changeView('list')}
        >
          <ViewListIcon
            className="calendar-action__tab__icon"
            fontSize="small"
          ></ViewListIcon>
          List View
        </div>
      </div>

      <div className="calendar-action__events">
        <div className="calendar-action__events__search-bar">
          <TextField
            id="list-search-text"
            type="text"
            fullWidth
            placeholder="Search by Template Name"
            autoComplete="search"
            variant="outlined"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <SearchIcon className="calendar-action__events__search-bar__icon" />
        </div>
        {createTenantCalendar ? (
          <Button
            variant="outlined"
            className="btn-primary"
            onClick={handlecreateDialogOpen}
          >
            Create Template
          </Button>
        ) : (
          ''
        )}
        <CreateCalendarTemplate
          open={createDialogOpen}
          close={handlecreateDialogClose}
        ></CreateCalendarTemplate>
      </div>
    </div>
  );
}
