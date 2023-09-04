import WebViewer from '@pdftron/webviewer';
import React, { ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { postApi } from '../../../../../services/api';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { SpecificationLibDetailsContext } from '../../context/SpecificationLibDetailsContext';
import './SectionViewer.scss';
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import { setSpecificationViewerUrl } from '../../context/SpecificationLibDetailsAction';

// let processedUrl: any = [];
export default function SectionViewer(props: any): ReactElement {
  const viewer = useRef<HTMLDivElement>(null);
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any = useContext(SpecificationLibDetailsContext);
  const [displayPdf, setDisplayPdf] = useState<Array<any>>([]);
  const { dispatch, state }: any = useContext(stateContext);
  const [processedUrl, setProcessedUrl] = useState<Array<any>>([]);

  //  useEffect(() => {
  //     return () => {
  //       processedUrl = [];
  //     };
  //   }, []);

  useEffect(() => {
    if (processedUrl.length > 0) {
      sectionDisplay();
    }
  }, [processedUrl]);
  useEffect(() => {
    if (props?.specificationSheetsDetails?.createdAt) {
      //    sectionDisplay();
      setTimeout(() => {
        fetchSheetUrl(props?.specificationSheetsDetails)
      }, 1500)
    }
  }, [props?.specificationSheetsDetails])

  const fetchSheetUrl = (specification: any) => {
    const s3Key = specification.sourceKey.replace('.pdf', '/thumbnails')
    const startPage = props?.specificationSheetsDetails.startPage
    const endPage = props?.specificationSheetsDetails.endPage
    const payload: any = [];
    for (let i = startPage; i <= endPage; i++) {

      const payloadObj = {
        fileName: `${i}.png`,
        key: `${s3Key}/${i}.png`,
        expiresIn: 10000,
        processed: true,
      };
      payload.push(payloadObj);
    }
    getSheetUrl(payload);
  };

  // get download link URL
  const getSheetUrl = async (payload: any) => {
    const data: any = [];
    const pageNumber = payload[0]?.key.split('/')[payload[0]?.key.split('/').length - 1].split('.')[0];
    try {
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      if (fileUploadResponse.success) {


        for (let i = 0; i < fileUploadResponse.success.length; i++) {
          const fileData = {
            s3Key: payload[i]?.key,
            url: fileUploadResponse.success[i]?.url,
            pageNumber: Number(pageNumber) + i
          };
          data.push(fileData);
        }
        const result = [...processedUrl, ...data];
        setProcessedUrl([...result])
        // console.log(processedUrl,'processedUrl')
        // const uniquiePage= Array.from(new Set([processedUrl]))
        //        const newarr = [processedUrl[0]];
        // for (let i=1; i<processedUrl.length; i++) {
        //    if (processedUrl[i]!=processedUrl[i-1]) {
        //    newarr.push(processedUrl[i]);
        //    }
        // }
        //         console.log(newarr,'unique')

      }
    } catch (error) {
      for (let i = 0; i < payload.length; i++) {
        const fileData = {
          pageNumber: Number(pageNumber + i),
          s3Key: payload[i]?.key,
          url: "",
        };
        data.push(fileData);
      }
      const result = [...processedUrl, ...data];
      setProcessedUrl([...result])
      Notification.sendNotification(error, AlertTypes.warn);
    }
  };
  const sectionDisplay = () => {
    let pageList: any = []
    const sortedPageUrl = processedUrl?.sort((a: any, b: any) =>
      a.pageNumber > b.pageNumber
        ? 1
        : b.pageNumber > a.pageNumber
          ? -1
          : 0
    );
    sortedPageUrl.map((item: any) => item.isDraggableDisabled = true)
    pageList = [...sortedPageUrl]
    setDisplayPdf(pageList)
  };

  return (
    <div className='sectionViewer-grid'>
      {
        displayPdf.map((item: any, index: number) => (

          <div className='sectionViewer-grid__item'>
            <div className='sectionViewer-grid__item__thumbnail' key={index}>
              <img className="img-responsive" src={item.url} ></img>
              <div className="sectionViewer-grid__info">
                {/* <div className="sectionViewer-grid__info__text">
                  {`Page number:  ${item.pageNumber}`}
                </div> */}
              </div>
            </div>
           </div>
        )
        )

      }
    </div>

  )

}
