import React, { useContext, useEffect, useState } from 'react';

import {
  AutoLinkCard,
  AutoLinkDetailCard,
} from 'src/version2.0_temp/components/autoLink';
import './AutoLink.scss';
import { stateContext } from '../root/context/authentication/authContext';
import { getSuggestedLinks } from './actions/actions';
import ShowComponent from '../shared/utils/ShowComponent';
import LoadingCard from '../insights2/insightsView/components/LoadingCard/LoadingCard';
import { Grid, Typography } from '@mui/material';
import SearchIcon from '@material-ui/icons/Search';
import { Close } from '@material-ui/icons';

export default function Navigator() {
  const {
    state: { selectedProjectToken },
  } = useContext(stateContext);
  if (selectedProjectToken) return <AutoLink />;
  else return null;
}
const autoLinkDropdownOptions = [
  {
    label: 'QC Checklist',
    value: 'QC_CHECKLIST',
  },
  {
    label: 'Issues',
    value: 'ISSUES',
  },
  {
    label: 'RFI',
    value: '%RFI%',
  },
];
function AutoLink(): React.ReactElement {
  const [suggestedLinksLoader, setSuggestedLinksLoader] = useState<{
    loading: boolean;
    data: any[] | null;
  }>({ loading: false, data: null });
  const [selected, setSelected] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [closePopover, setClosePopover] = useState(false)
  const {
    state: { selectedProjectToken },
  } = useContext(stateContext);
  useEffect(() => {
    async function apiCall() {
      setSuggestedLinksLoader((prevState) => ({ ...prevState, loading: true }));
      const data = await getSuggestedLinks(selectedProjectToken as string);
      if (Array.isArray(data))
        setSuggestedLinksLoader((prevState) => ({
          ...prevState,
          loading: false,
          data,
        }));
    }
    apiCall();
  }, []);
  const getFilteredLinks = () => {
    return data?.filter((e: any) =>
      e?.projectTask?.taskName
        ?.toLocaleLowerCase()
        .includes(searchKeyword?.toLocaleLowerCase())
    );
  };
  const { loading, data } = suggestedLinksLoader;
  const handleScroll = () => {
    if (isPopoverOpen) {
      setClosePopover(true)
      setIsPopoverOpen(false)
    }
  }
  const handlePopover = (isOpen: boolean) => {
    if (isOpen) {
      setIsPopoverOpen(true)
    }
    else{
      setClosePopover(false)
    } 
  }
  return (
    <Grid container className="auto-link-grid">
      <ShowComponent showState={loading}>
        <LoadingCard />
      </ShowComponent>
      <ShowComponent showState={!loading && Array.isArray(data)}>
        <ShowComponent showState={!data?.length}>
          <Grid container alignItems={'center'} justifyContent={'center'}>
            <Typography
              sx={{ fontSize: '3.6rem', color: '#fff', opacity: 0.8 }}
            >
              No data available for the project
            </Typography>
          </Grid>
        </ShowComponent>
        <ShowComponent showState={!!data?.length}>
          <div className="v2-auto-link">
            <div className="v2-auto-link-recommendation">
              <h2>Project Tasks</h2>
              <SearchIcon className="v2-auto-link--icon--search" />
              {searchKeyword.length ? (
                <Close className="v2-auto-link--icon--close" onClick={() => {
                  setSearchKeyword('')
                }} />
              ) : (
                ''
              )}
              <input
                type="text"
                className="v2-auto-link--search"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                }}
              />

              {getFilteredLinks()?.length
                ? getFilteredLinks()?.map(({ id, ...rest }) => (
                  <AutoLinkCard
                    {...rest}
                    key={id}
                    isSelected={id === selected}
                    handleSelect={() => {
                      setSelected(id)
                    }}
                  />
                ))
                : !loading && <h4 className="no-task-found">No Task Found</h4>}
            </div>
            <div className="v2-auto-link-suggested-link" onScroll={handleScroll}>
              <h2>Suggested Form Links</h2>
              <AutoLinkDetailCard
                selectedTask={data?.find(e => e.id === selected) || null}
                autoLinkDropdownOptions={autoLinkDropdownOptions}
                handlePopover={handlePopover}
                closePopover={closePopover }
              />
            </div>
          </div>
        </ShowComponent>
      </ShowComponent>
    </Grid>
  );
}
