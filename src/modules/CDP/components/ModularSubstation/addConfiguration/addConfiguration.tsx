import { ReactElement, useContext, useState } from 'react';
import { useParams } from 'react-router';

import './addConfiguration.scss';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import {
  createCDPInstance,
  getCdpInstenceList,
} from 'src/modules/CDP/constant/api';
import { CDPContext } from '../../../context/context';
import { ICdpContext } from '../../../models';
import { setCdpInstencesList } from '../../../context/action';
import { CircularProgress } from '@material-ui/core';
function AddConfiguration(props: any): ReactElement {
  const [configName, setConfigName] = useState('');
  const { state }: any = useContext(stateContext);
  const { cdpDispatch } = useContext(CDPContext) as ICdpContext;
  const [loading, setLoading] = useState(false);

  const params = useParams() as {
    substationId: string;
  };
  const createSubstation = async () => {
    setLoading(true);
    await createCDPInstance({
      projectId: state.currentProject.projectId,
      cdpInstanceName: configName,
      cdpTypeId: params.substationId,
    });
    const cdpInstenceList = await getCdpInstenceList(params.substationId);
    cdpDispatch(setCdpInstencesList(cdpInstenceList));
    setLoading(false);
    props.close && props.close();
  };
  return (
    <div className="add-new-cdp">
      <input
        type="text"
        placeholder="Configuration name"
        value={configName}
        onChange={(e) => setConfigName(e.target.value)}
      />
      <div className="add-new-cdp__msg">30 characters maximum</div>
      <div className="add-new-cdp__duplicate">
        <input type="checkbox" id="duplicateCdp" />
        <label htmlFor="duplicateCdp">Duplicate existing configuration</label>
      </div>
      <div className="add-new-cdp__action">
        <button
          className="cdp-btn"
          disabled={configName.length < 1 && loading}
          onClick={createSubstation}
        >
          {loading ? (
            <CircularProgress size={14} style={{ marginRight: '6px' }} />
          ) : (
            ''
          )}
          Create
        </button>
      </div>
    </div>
  );
}

export default AddConfiguration;
