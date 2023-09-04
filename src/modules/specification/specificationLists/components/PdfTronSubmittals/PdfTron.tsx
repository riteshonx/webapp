import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { postApi } from '../../../../../services/api';
import { setParsedFileUrl } from '../../context/SpecificationLibDetailsAction';
import WebViewer from "@pdftron/webviewer";
import "./PdfTron.scss";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";

export default function PdfTronSubmittals(props: any): ReactElement {
  const viewer = useRef<HTMLDivElement>(null);
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
  const [newInstance, setNewInstance] = useState<any>(null);
  const {dispatch, state }:any = useContext(stateContext);

  useEffect(() => {
    // console.log("SpecificationLibDetailsState",SpecificationLibDetailsState)

    WebViewer(
      {
        path: "/webviewer/lib",
        licenseKey: process.env["REACT_APP_PDFTRON_LICENSE_KEY"],
        initialDoc:"",
        // initialDoc: SpecificationLibDetailsState?.parsedFileUrl?.url,
        // filename: SpecificationLibDetailsState?.specificationLibDetails[0]
        //   ?.fileName
        //   ? SpecificationLibDetailsState?.specificationLibDetails[0]?.fileName
        //   : "Specification",
        filename:"Specification",
        extension: "pdf",
        isReadOnly: true,
        fullAPI: true,
        disabledElements: [
          'leftPanelButton',
          "selectToolButton",
          "stickyToolButton",
          "toggleNotesButton",
        ],
      },
      viewer.current as HTMLDivElement
    ).then((instance: any) => {
      setNewInstance(instance);
      const { documentViewer, PDFNet } = instance.Core;
    });
  }, []);

  React.useEffect(() => {
    return () => {
      setNewInstance(null)
    };
  }, []);

  useEffect(() => {
    if (SpecificationLibDetailsState?.parsedFileUrl?.url && newInstance) {
      const s3Key = SpecificationLibDetailsState?.parsedFileUrl?.s3Key;
      const pageNum = s3Key
        .split("/")
        [s3Key.split("/").length - 1].split(".")[0];
      const fileName =
        SpecificationLibDetailsState?.specificationLibDetails[0]?.fileName?.replace(
          ".pdf",
          ""
        );
      const downloadingFileName = `page${pageNum}_${fileName}`;
      // console.log("newInstance",newInstance)
      newInstance.loadDocument(
        SpecificationLibDetailsState?.parsedFileUrl?.url,
        {
          extension: "pdf",
          filename: downloadingFileName ? downloadingFileName : "Specification",
        }
      );
     
    }
  }, [SpecificationLibDetailsState?.parsedFileUrl?.url]);
  useEffect(() => {
        if(SpecificationLibDetailsState?.sectionPageNum && newInstance ){
          const { documentViewer, PDFNet } = newInstance.Core;
            PDFNet.initialize()
            documentViewer.setCurrentPage(SpecificationLibDetailsState?.sectionPageNum);
        }
      }, [SpecificationLibDetailsState?.sectionPageNum])

      useEffect(() => {
        if(props?.specSectionDetails?.fileSize){
          // console.log("reaching here")
          setTimeout(() => {
            fetchSheetUrl(props?.specSectionDetails)
          }, 1500)
        }
      }, [props?.specSectionDetails]);

      const fetchSheetUrl = (file: any) => {
        const payload = [{
            fileName: file.fileName,
            key: file.sourceKey,
            expiresIn: 100000000,
            // processed: true
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
                SpecificationLibDetailsDispatch(setParsedFileUrl(fileData));
            }
            dispatch(setIsLoading(false));
        } catch (error) {   
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    // console.log("props", props)

  return (
    <>
      <div className="webviewer" ref={viewer}></div>
    </>
  );
}
