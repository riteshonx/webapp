import { ReactElement, useContext, useEffect, useState } from 'react';
import ModularSubstationSidebar from '../../components/ModularSubstation/sidebar/sidebar';
import './modularSubstation.scss';
import EmptyWorkSpace from '../../components/ModularSubstation/emptyWorkSpace/EmptyWorkSpace';
import CdpModal from '../../components/common/modal/modal';
import AddConfiguration from '../../components/ModularSubstation/addConfiguration/addConfiguration';
import DownloadDesign from '../../components/ModularSubstation/downloadDesign/downloadDesign';
import BOQTable from '../../components/ModularSubstation/boqTable/boqTable';
import DrawingOutput from '../../components/ModularSubstation/drawingOutput/drawingOutput';
import { useParams } from 'react-router';
import { CDPContext } from '../../context/context';
import { ICdpContext } from '../../models';
import {
  setSelectedgenerator,
  setCdpInstencesList,
  setCdpFormAnswereList,
  setSelectedInstance,
} from '../../context/action';
import { getCdpInstenceList } from '../../constant/api';
import OutputViewer from '../../components/ModularSubstation/3dModel/3dModel';

function ModularSubstation(): ReactElement {
  const [addConfigModal, setAddConfigModal] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [outputScreen, setOutputScreen] = useState('');
  const { cdpState, cdpDispatch } = useContext(CDPContext) as ICdpContext;
  const params = useParams() as {
    substationId: string;
  };
  useEffect(() => {
    onLoad();
  }, [params.substationId]);

  const onLoad = async () => {
    cdpDispatch(setSelectedgenerator(params.substationId));
    const cdpInstenceList = await getCdpInstenceList(params.substationId);
    cdpDispatch(setCdpInstencesList(cdpInstenceList));
    if (cdpInstenceList.length > 0) {
      cdpDispatch(setSelectedInstance(cdpInstenceList[0]))
    }
  };

  const onDownload = () => {
    setDownloadModal(true);
  };
  const onClickOutput = (button: string) => {
    setShowOutput(true);
    setOutputScreen(button);
  };

  const getOutputComponent = () => {
    switch (outputScreen) {
      case 'boq':
        return <BOQTable />;
      case 'drawing':
        return <DrawingOutput />;
      case 'proposal':
        return <OutputViewer />;
    }
  };

  return (
    <div className="modular-substation">
      <ModularSubstationSidebar
        onDownload={onDownload}
        outputClick={onClickOutput}
        createNewConfiguration={() => setAddConfigModal(true)}
      />
      <div className="modular-substation--container">
        {cdpState.cdpInstncesList.length ? (
          showOutput ? (
            getOutputComponent()
          ) : (
            ''
          )
        ) : (
          <EmptyWorkSpace onAddConfig={() => setAddConfigModal(true)} />
        )}
      </div>
      {addConfigModal ? (
        <CdpModal
          title="New Configuration"
          onClose={() => setAddConfigModal(false)}
        >
          <AddConfiguration close={() => setAddConfigModal(false)} />
        </CdpModal>
      ) : (
        ''
      )}
      {downloadModal ? (
        <CdpModal
          title="Select file type"
          onClose={() => setDownloadModal(false)}
        >
          <DownloadDesign />
        </CdpModal>
      ) : (
        ''
      )}
    </div>
  );
}

export default ModularSubstation;
