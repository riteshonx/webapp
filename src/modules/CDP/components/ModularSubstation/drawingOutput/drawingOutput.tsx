import { ReactElement, useEffect, useRef, useState } from "react";
import './drawingOutput.scss'
import WebViewer from "@pdftron/webviewer";
function DrawingOutput ():ReactElement {
  const viewer = useRef<HTMLDivElement>(null);
  const [newInstance, setNewInstance] = useState<any>(null);
  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey: process.env["REACT_APP_PDFTRON_LICENSE_KEY"],
        initialDoc: '',
        filename: 'drawings',
        extension: "pdf",
        fullAPI: false,
        isReadOnly: true,
        enableMeasurement: true,
        disabledElements: [
          'leftPanelButton',
        ]
      },
      viewer.current as HTMLDivElement,
    ).then((instance: any) => {
      setNewInstance(instance)
        // you can now call WebViewer APIs here...
    });
  }, []);
  return <div ref={viewer} ></div>
}

export default DrawingOutput