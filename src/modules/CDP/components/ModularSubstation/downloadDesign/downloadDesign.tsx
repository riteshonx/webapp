/* eslint-disable max-len */
import { ReactElement } from 'react';
import './downloadDesign.scss';
function DownloadDesign(): ReactElement {
  const DownloadZip = () => {
    const base64 =
      'UEsDBBQAAAAAAFoiFVcAAAAAAAAAAAAAAAATACAAbW9kdWxlci1zdWJzdGF0aW9uL1VUDQAHVJjiZFSY4mRmmOJkdXgLAAEE9gEAAAQUAAAAUEsBAhQDFAAAAAAAWiIVVwAAAAAAAAAAAAAAABMAIAAAAAAAAAAAAO1BAAAAAG1vZHVsZXItc3Vic3RhdGlvbi9VVA0AB1SY4mRUmOJkZpjiZHV4CwABBPYBAAAEFAAAAFBLBQYAAAAAAQABAGEAAABRAAAAAAA=';
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + base64
    );
    element.setAttribute('download', 'download.zip');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };
  return (
    <div className="download-design">
      <div className="download-design--option">
        <input type="checkbox" id="estimate-csv" />
        <label htmlFor="estimate-csv">Estimate (.CSV)</label>
      </div>
      <div className="download-design--option">
        <input type="checkbox" id="estimate-pdf" />
        <label htmlFor="estimate-pdf">Estimate (.PDF)</label>
      </div>
      <div className="download-design--option">
        <input type="checkbox" id="drawings-pdf" />
        <label htmlFor="drawings-pdf">Drawings (.PDF)</label>
      </div>
      <div className="download-design--option">
        <input type="checkbox" id="drawings-dxf" />
        <label htmlFor="drawings-dxf">Drawings (.DXF)</label>
      </div>
      <div className="download-design--option">
        <input type="checkbox" id="proposal-doc" />
        <label htmlFor="proposal-doc">Proposal (.DOC)</label>
      </div>
      <div className="download-design--option">
        <input type="checkbox" id="proposal-pdf" />
        <label htmlFor="proposal-pdf">Proposal (.PDF)</label>
      </div>
      <div className="download-design--option">
        <input type="checkbox" id="arial-view" />
        <label htmlFor="arial-view">Aerial View (.JPEG)</label>
      </div>
      <div className="download-design--action">
        <button className="cdp-btn" onClick={() => DownloadZip()}>
          Download
        </button>
      </div>
    </div>
  );
}

export default DownloadDesign;
