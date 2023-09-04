import { ReactElement, useEffect, useState } from 'react';
import ModularSubstationCard from '../../components/modularSubstationCard/modularSubstationCard';
import './CdpLanding.scss';
import { getGeneratorList } from '../../constant/api';
import { ICDP } from '../../models';

function CdpLanding(): ReactElement {
  const [loadingList, setLoadingList] = useState(false);
  const [substationList, setSubstationList] = useState([]);
  useEffect(() => {
    loadSubstationList();
  }, []);
  const loadSubstationList = async () => {
    setLoadingList(true);
    setSubstationList(await getGeneratorList());
    setLoadingList(false);
  };
  return (
    <div className="cdp-landing">
      <div className="cdp-landing--header">Generator</div>
      {!loadingList ? (
        <div className="cdp-landing--container">
          {' '}
          {substationList.map((e: ICDP) => (
            <ModularSubstationCard cdpObj={e} />
          ))}
        </div>
      ) : (
        <>loading</>
      )}
    </div>
  );
}

export default CdpLanding;
