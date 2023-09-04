import React, { ReactElement, useContext, useEffect, useRef, useState } from 'react'
import WebViewer from '@pdftron/webviewer';
import './PdfTron.scss'
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { postApi } from '../../../../../services/api';
import { setDrawingPageNumber, setParsedFileUrl } from '../../context/DrawingLibDetailsAction';
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";

export default function PdfTron(props: any): ReactElement {

    const viewer = useRef<HTMLDivElement>(null);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [newInstance, setNewInstance] = useState<any>(null);
    const {dispatch, state }:any = useContext(stateContext);

    useEffect(() => {
      WebViewer(
        {
          path: '/webviewer/lib',
          licenseKey: process.env["REACT_APP_PDFTRON_LICENSE_KEY"],
          initialDoc: '',
          filename: 'drawings',
          extension: "pdf",
          isReadOnly: true,
          fullAPI: true,
          disabledElements: [
            // 'leftPanelButton',
          // //   'selectToolButton',
          //   'stickyToolButton',
          //   'toggleNotesButton',
          ]
        },
        viewer.current as HTMLDivElement,
      ).then((instance: any) => {
        setNewInstance(instance)
          // you can now call WebViewer APIs here...
      });
    }, []);

    useEffect(() => {
      if(DrawingLibDetailsState?.parsedFileUrl?.url && newInstance ){
        const s3Key = DrawingLibDetailsState?.parsedFileUrl?.s3Key;
        const pageNum = s3Key.split('/')[s3Key.split('/').length-1].split('.')[0];
        const fileName = DrawingLibDetailsState?.drawingLibDetails[0]?.fileName?.replace(".pdf", "");
        const downloadingFileName = `page${pageNum}_${fileName}`;

        newInstance.loadDocument(DrawingLibDetailsState?.parsedFileUrl?.url, {extension: "pdf", 
        filename: downloadingFileName ? downloadingFileName : 'drawing',})

        const { documentViewer } = newInstance.Core;

        //get page rotation from the PDF
        documentViewer.addEventListener('rotationUpdated', (rotation: number) => {
          updateRotation(rotation)
        })
        

        // trigger an event after the document loaded
        documentViewer.addEventListener('documentLoaded', async() => {
          const rotation = DrawingLibDetailsState?.drawingLibDetails[0]?.sheetsReviewed?.pdfRotation ? 
                            DrawingLibDetailsState?.drawingLibDetails[0]?.sheetsReviewed?.pdfRotation : 0
          documentViewer.setRotation(rotation)
        })

        documentViewer.on('pageNumberUpdated', () => {
          DrawingLibDetailsDispatch(setDrawingPageNumber(0));
        })

      }
    }, [DrawingLibDetailsState?.parsedFileUrl?.url, newInstance]);

    useEffect(() => {
      if(DrawingLibDetailsState?.drawingPageNum && newInstance ){
        const { documentViewer, PDFNet } = newInstance.Core;
          PDFNet.initialize()
          // const displayMode = documentViewer.getDisplayModeManager().getDisplayMode();
          // console.log(displayMode)
          documentViewer.addEventListener('documentLoaded',async () => {
            await PDFNet.initialize()
            // const pdfDoc = documentViewer.getDocument();
            // const doc = await pdfDoc.getPDFDoc();
            // const page = pdfDoc.setCurrentPage(4);
            documentViewer.setCurrentPage(DrawingLibDetailsState?.drawingPageNum, true);
          });
          // documentViewer.zoomTo(documentViewer.getZoom(), scrollElement.scrollLeft, 0)
          documentViewer.setCurrentPage(DrawingLibDetailsState?.drawingPageNum, true);
      }
    }, [DrawingLibDetailsState?.drawingPageNum]);

    useEffect(() => {
      if(props?.drawingSheetsDetails?.fileSize){
          fetchSheetUrl(props?.drawingSheetsDetails)
      }
    }, [props?.drawingSheetsDetails]);

    const fetchSheetUrl = (file: any) => {
    //making changes in sourcekey for processed bucket
      const sourceKey = file.sourceKey.replace(".pdf","")
      let pdfFile = file.sourceKey.split("/");
      pdfFile=pdfFile[pdfFile.length-1]
      const s3Key = sourceKey + "/" + pdfFile;

        const payload = [{
            fileName: file.fileName,
            key: s3Key,
            expiresIn: 100000000,
            processed: true      //maintaining boolean to differentiate b/w normal bucket and processed bucket
        }]; 

        getSheetUrl(payload);
    }

    const getSheetUrl = async (payload: any) => {
        try {
            dispatch(setIsLoading(true));
            const fileUploadResponse = await postApi('V1/S3/downloadLink', payload);
            if(fileUploadResponse.success){
                const fileData = {
                    s3Key: payload[0].key,
                    url: fileUploadResponse.success[0].url
                }
                DrawingLibDetailsDispatch(setParsedFileUrl(fileData));
            }
            dispatch(setIsLoading(false));
        } catch (error) {   
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const updateRotation = (rotation: number) => {
      props.updateRotation(rotation)
    }

    return (
        <>
            <div className="webviewer" ref={viewer}></div>
        </>
    )
}
