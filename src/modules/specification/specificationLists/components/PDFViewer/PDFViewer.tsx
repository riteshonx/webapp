import WebViewer from "@pdftron/webviewer";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import { postApi } from "../../../../../services/api";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import "./PDFViewer.scss";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { display } from "@mui/system";

export default function PdfViewer({
  specificationSheetsDetails,
}: any): ReactElement {
  const viewer = useRef<HTMLDivElement>(null);
  const [newInstance, setNewInstance] = useState<any>(null);
  const [specificationS3Data, setSpecificationS3Data] = useState({
    s3Key: "",
    url: "",
  });
  const { dispatch }: any = useContext(stateContext);

  useEffect(() => {
    WebViewer(
      {
        path: "/webviewer/lib",
        licenseKey: process.env["REACT_APP_PDFTRON_LICENSE_KEY"],
        initialDoc: "",
        filename: "specifications",
        extension: "pdf",
        isReadOnly: true,
        fullAPI: true,
        disabledElements: [
          "leftPanelButton",
          "selectToolButton",
          "stickyToolButton",
          "toggleNotesButton",
        ],
      },
      viewer.current as HTMLDivElement
    ).then((instance: any) => {
      setNewInstance(instance);
    });
  }, []);

  useEffect(() => {
    if (specificationS3Data.url && newInstance) {
      const { fileName, sectionName } = specificationSheetsDetails;
      const displayFileName = fileName.replace(".pdf", "");
      const downloadingFileName = `${displayFileName} - ${sectionName}`;
      newInstance.loadDocument(specificationS3Data.url, {
        extension: "pdf",
        filename: downloadingFileName ? downloadingFileName : "Specification",
      });
    }
  }, [specificationS3Data.url, newInstance]);

  useEffect(() => {
    if (specificationSheetsDetails.id) {
      fetchSheetUrl(specificationSheetsDetails);
    }
  }, [specificationSheetsDetails]);

  const fetchSheetUrl = (specification: any) => {
    const s3Key = specification.sourceKey.replace(
      ".pdf",
      `/pdfsections/${specification.id}.pdf`
    );
    const payload = [
      {
        fileName: `${specification.fileName}-${specification.sectionName}.pdf`,
        key: s3Key,
        expiresIn: 100000,
        processed: true,
      },
    ];

    getSheetUrl(payload);
  };

  // get download link URL
  const getSheetUrl = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      if (fileUploadResponse.success) {
        const fileData = {
          s3Key: payload[0].key,
          url: fileUploadResponse.success[0].url,
        };
        setSpecificationS3Data(fileData);
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="pdfViewSpecification">
      <div className="pdfViewSpecification__webviewer" ref={viewer}></div>
    </div>
  );
}
