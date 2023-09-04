import { Button, Grid } from '@mui/material';
import React from 'react';
import ShowComponent from '../shared/utils/ShowComponent';
import ThirdPartyProjects from './components/ThirdPartyProjects';
import { stateContext } from '../root/context/authentication/authContext';
import {
  fetchConnectorToken,
  fetchDataFromURL,
  getConnectorsToken,
  getSyncedProjectFromConnectors,
} from './actions/actions';
import {
  setIsLoading,
  setSourceSystem,
} from '../root/context/authentication/action';
import { AGAVE_PROJECTS } from './utils/constant';
import { decodeToken } from 'src/services/authservice';
import { Redirect } from 'react-router-dom';
import AgaveLink from './components/AgaveLink';
import { AgaveLinkType } from './utils/types';

const buttons = [
  { text: 'Import 3rd party projects', url: AGAVE_PROJECTS, id: 'projects' },
];

export default function Navigator(): React.ReactElement {
  const { adminUser } = decodeToken();
  if (adminUser) return <Connectors />;
  return <Redirect to="/" />;
}
function Connectors(): React.ReactElement {
  const [isRefetchProject, setRefetchProject] = React.useState(false);
  const { dispatch, state: { sourceSystem } } = React.useContext(stateContext);


  React.useEffect(() => {
    fetchSourceSystemData();
    return () => {
      localStorage.removeItem('connectorToken');
    };
  }, []);

  React.useEffect(() => {
    if (sourceSystem) {
      setRefetchProject(true)
      loadSourceProject()
    }
  }, [sourceSystem]);

  const fetchSourceSystemData = async () => {
    try {
      dispatch(setIsLoading(true));
      await fetchConnectorToken();
      const agaveInfo = localStorage.getItem('agaveInfo');
      if (agaveInfo) {
        dispatch(setSourceSystem(JSON.parse(agaveInfo)));
      }
    } catch (err) {
    } finally {
      dispatch(setIsLoading(false));
    }
  }
  const loadSourceProject = () => {
    handleClick(
      fetchDataFromURL,
      AGAVE_PROJECTS,
      { sourceSystem: sourceSystem?.name },
      setRefetchProject
    );
  }
  const handleClick = async (
    cb1: (url: string, payload: any) => Promise<any>,
    url: string,
    payload: any,
    cb2?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    try {
      dispatch(setIsLoading(true));
      await cb1(url, payload);
    } finally {
      dispatch(setIsLoading(false));
      if (cb2) cb2(true);
    }
  };
  return (
    <ShowComponent showState={!!getConnectorsToken()}>
      <Grid
        padding={'20px'}
        container
        direction="column"
        className="connectors-grid"
      >
        <Grid
          item
          container
          direction="row"
          justifyContent={'flex-start'}
          padding={'20px 0'}
          wrap="nowrap"
        >
          <AgaveLink />
          {/* {buttons.map((ele) => (
            <Grid item key={ele.id}>
              <Button
                className="btn-primary"
                variant="outlined"
                disabled={!sourceSystem}
                data-testid={`connectors-${ele.id}`}
                onClick={() => {
                  handleClick(
                    fetchDataFromURL,
                    ele.url,
                    { sourceSystem: sourceSystem?.name },
                    setRefetchProject
                  );
                }}
              >
                {ele.text}
              </Button>
            </Grid>
          ))} */}
        </Grid>
        <ThirdPartyProjects
          fetchProjectState={[isRefetchProject, setRefetchProject]}
        />
      </Grid>
    </ShowComponent>
  );
}
