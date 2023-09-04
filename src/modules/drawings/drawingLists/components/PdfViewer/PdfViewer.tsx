import WebViewer from '@pdftron/webviewer';
import React, { ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { postApi } from '../../../../../services/api';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import './PdfViewer.scss';
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import { setDrawingViewerUrl } from '../../context/DrawingLibDetailsAction';
import { decodeExchangeToken } from 'src/services/authservice';
import { client } from 'src/services/graphql';
import { CREATE_ANNOTATION, DELETE_ANNOTATION, UPDATE_ANNOTATION } from '../../graphql/queries/annotations';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import { match, useRouteMatch } from 'react-router-dom';
import { UPDATE_PDF_ROTATION } from '../../graphql/queries/drawingSheets';

interface annotatePayload {
  drawingId: string,
  xfdfString: string
}

interface annotateUpdatePayload {
  id: string,
  xfdfString: string
}
export interface Params {
  projectId: string;
  drawingId: string;
}

export default function PdfViewer(props: any): ReactElement {

    const pathMatch: match<Params>= useRouteMatch();
    const viewer = useRef<HTMLDivElement>(null);
    const [newInstance, setNewInstance] = useState<any>(null);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const { dispatch, state }: any = useContext(stateContext);
    const serializer = new XMLSerializer();
    
    useEffect(() => {
      WebViewer(
        {
          path: '/webviewer/lib',
          licenseKey: process.env["REACT_APP_PDFTRON_LICENSE_KEY"],
          initialDoc: '',
          filename: 'drawings',
          extension: "pdf",
          fullAPI: false,
          isReadOnly: state?.projectFeaturePermissons?.cancreateDrawings ? false : true,
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

    useEffect(() => {
        if(DrawingLibDetailsState?.drawingViewerFileUrl?.url && newInstance ){

          const s3Key = DrawingLibDetailsState?.drawingViewerFileUrl?.s3Key;
          const pageNum = s3Key.split('/')[s3Key.split('/').length-1].split('.')[0];
          const fileName = DrawingLibDetailsState?.drawingLibDetails[0]?.fileName?.replace(".pdf", "");
          const downloadingFileName = `page${pageNum}_${fileName}`;

           //load a new document whenever fileUrl changes
          newInstance.UI.loadDocument(DrawingLibDetailsState?.drawingViewerFileUrl?.url, {extension: "pdf", 
          filename: downloadingFileName ? downloadingFileName : 'drawing'})

          const { documentViewer, annotationManager } = newInstance.Core;
    

          // trigger an event after the document loaded
          documentViewer.addEventListener('documentLoaded', async() => {
            
            // newInstance.UI.openElements(['notesPanel']);

            documentViewer.setRotation(props?.drawingSheetsDetails.rotation)

            const data: any  = [...DrawingLibDetailsState?.drawingAnnotationLists];
            const pathArray  = window.location.pathname.split('/');
            const drawingUrlId = pathArray[pathArray.length -1];

            if(data?.length > 0 && drawingUrlId === pathMatch.params.drawingId){
              data?.forEach(async (annotate: any) => {
                const annotations = await  annotationManager.importAnnotCommand(annotate?.xfdf);
                await annotationManager.drawAnnotationsFromList(annotations);
              })
            }
            const annotationLists: any = await annotationManager.getAnnotationsList();
            if(annotationLists?.length > 0 && data.length > 0){
              annotationLists.forEach((item: any, index: number) => {
                item.annotId= data[index]?.id;
              });
            }
          })

        //get page rotation from the PDF
        documentViewer.addEventListener('rotationUpdated', (rotation: number) => {
          if(state.projectFeaturePermissons?.createDrawings){
            updatePdfRotation(rotation)
          }
        })

          // const userInfo = [{
          //   id: decodeExchangeToken().userId,
          //   value: decodeExchangeToken().userName,
          //   email: decodeExchangeToken().userEmail,
          // }]

          annotationManager.setCurrentUser(`${decodeExchangeToken().userEmail}`);

          annotationManager.addEventListener('annotationChanged', async (annotations: any, action: any, imported: any) => {
            const pathArray  = window.location.pathname.split('/');
            const drawingUrlId = pathArray[pathArray.length -1];
            if(!imported.imported && drawingUrlId === pathMatch.params.drawingId){
              if (action === 'add') {
                await annotationManager.exportAnnotCommand().then( async (xfdfData: any) => {
                  
                  const parser = new DOMParser();
                  const commandData = parser.parseFromString(xfdfData, 'text/xml');
                  const addedAnnots = commandData.getElementsByTagName('add')[0];
                  addedAnnots.childNodes.forEach(async (child: any) => {

                    if (child.nodeType !== child.TEXT_NODE) {
                      const annotationString = await serializer.serializeToString(child);
                      const xfdfString = await convertToXfdf(annotationString, 'add');

                      const payload: annotatePayload = {
                        drawingId: drawingUrlId,
                        xfdfString: xfdfString
                      }
                      const annotationId = await createAnnotation(payload);
                      annotations[0]['annotId'] = await annotationId;
                      // console.log('add',payload )
                    }
                  });

                });
    

              } else if (action === 'modify') {
       
                if(annotations?.length > 0){
                  modifyAnnotation(annotations, annotationManager);
                }

              } else if (action === 'delete') {
                if(annotations?.length > 0){
                  deleteAnnotations(annotations);
                }
              }

            } 
          });  

        }
    }, [DrawingLibDetailsState?.drawingViewerFileUrl?.url, newInstance]);


    useEffect(() => {
      if(DrawingLibDetailsState?.drawingAnnotationLists.length>0){
        reRenderAnnotations();
      }
    }, [DrawingLibDetailsState?.drawingAnnotationLists]);    

    useEffect(() => {
      if(props?.drawingSheetsDetails?.createdAt){
          fetchSheetUrl(props?.drawingSheetsDetails)
      }
    }, [props?.drawingSheetsDetails]);

    const reRenderAnnotations= async ()=>{
      if(newInstance){
        const { annotationManager } = newInstance.Core;
        const data: any  = [...DrawingLibDetailsState?.drawingAnnotationLists];
        const pathArray  = window.location.pathname.split('/');
        const drawingUrlId = pathArray[pathArray.length -1];
        //before this clear the annotationManger
        annotationManager.getAnnotationsList().length = 0;
        
        if(data.length > 0){
          if(data?.length > 0 && drawingUrlId === pathMatch.params.drawingId){
            data?.forEach(async (annotate: any) => {
              const annotations = await  annotationManager.importAnnotCommand(annotate?.xfdf);
              await annotationManager.drawAnnotationsFromList(annotations);
            })
          }
          const annotationLists: any = await annotationManager.getAnnotationsList();
          if(annotationLists?.length > 0 && data.length > 0){
            annotationLists.forEach((item: any, index: number) => {
              item.annotId= data[index]?.id;
            });
          }
        }

      }
    }


    const modifyAnnotation = (annotations: any, annotationManager: any) => {

        annotationManager.exportAnnotCommand().then(async (xfdfData: any) => {

            const parser = await new DOMParser();
            const commandData = await parser.parseFromString(xfdfData, 'text/xml');
            const modifiedAnnots = await commandData.getElementsByTagName('modify')[0];

            modifiedAnnots.childNodes.forEach(async (child: any) => {
              annotations.forEach(async (annot: any) => {
                if (child.nodeType !== child.TEXT_NODE && child.getAttribute('name') === annot.Bx && annot?.annotId) {
                  const annotationString: any =  await serializer.serializeToString(child);
                  const xfdfString = await convertToXfdf(annotationString, 'modify');
                  const payload: annotateUpdatePayload = await {
                    id: annot?.annotId,
                    xfdfString: xfdfString
                  }
                  await updateAnnotation(payload);
                  // console.log('modify payload', payload, annot)
                }
              });
            });

          })
    }

    const deleteAnnotations = (annotations: any) => {
      annotations.forEach((annot: any) => {
        if(annot?.annotId){
          deleteAnnotation(annot?.annotId);
        }
      });
    }

    // wrapper function to convert xfdf fragments to full xfdf strings
    const convertToXfdf = (changedAnnotation:any, action: string) => {
      let xfdfString = `<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><fields />`;
      if (action === 'add') {
        xfdfString += `<add>${changedAnnotation}</add><modify /><delete />`;
      } else if (action === 'modify') {
        xfdfString += `<add /><modify>${changedAnnotation}</modify><delete />`;
      } else if (action === 'delete') {
        xfdfString += `<add /><modify /><delete>${changedAnnotation}</delete>`;
      }
      xfdfString += `</xfdf>`;
      return xfdfString;
    }
    

  const fetchSheetUrl = (drawing: any) => {
    const payload = [
      {
        fileName: `${drawing.drawingSequence}.pdf`,
        key: drawing.filePath,
        expiresIn: 100000,
        processed: true,
      },
    ];

    getSheetUrl(payload);
  };

  const getSheetUrl = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      if (fileUploadResponse.success) {
        const fileData = {
          s3Key: payload[0].key,
          url: fileUploadResponse.success[0].url,
        };
        DrawingLibDetailsDispatch(setDrawingViewerUrl(fileData));
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const createAnnotation = async (payload: annotatePayload) => {

      try{
          const createAnnotateResponse: any = await client.mutate({
              mutation: CREATE_ANNOTATION,
              variables: {
                  drawingId: payload.drawingId,
                  xfdf: payload.xfdfString,
              },
              context:{role: projectFeatureAllowedRoles.createDrawings, token: state.selectedProjectToken}
          })
          if(createAnnotateResponse?.data?.insert_annotations_one){
            const newAnnotation= {
              drawingId : payload.drawingId,
              xfdf : payload.xfdfString,
              id : createAnnotateResponse?.data?.insert_annotations_one.id
            };
            if(props.changeInAnnotation){
              props.changeInAnnotation(newAnnotation);
            }
            return createAnnotateResponse?.data?.insert_annotations_one.id
          }
      }
      catch(err: any){
          Notification.sendNotification(err, AlertTypes.warn);
          console.log(err)
      }
  }

  const updateAnnotation = async (payload: annotateUpdatePayload) => {
      try{
          const updateAnnotateResponse: any = await client.mutate({
              mutation: UPDATE_ANNOTATION,
              variables: {
                  id: payload.id,
                  xfdf: payload.xfdfString,
              },
              context:{role: projectFeatureAllowedRoles.createDrawings, token: state.selectedProjectToken}
          })
          if(updateAnnotateResponse?.data?.update_annotations_by_pk){
            // console.log(updateAnnotateResponse?.data?.update_annotations_by_pk)
          }
      }
      catch(err: any){
          Notification.sendNotification(err, AlertTypes.warn);
          console.log(err)
      }
  }

  const deleteAnnotation = async (annotId: string) => {
    try{
        const updateAnnotateResponse: any = await client.mutate({
            mutation: DELETE_ANNOTATION,
            variables: {
                id: annotId
            },
            context:{role: projectFeatureAllowedRoles.createDrawings, token: state.selectedProjectToken}
        })
        if(updateAnnotateResponse?.data?.delete_annotations_by_pk){
          // console.log(updateAnnotateResponse?.data?.delete_annotations_by_pk.id)
        }
    }
    catch(err: any){
        Notification.sendNotification(err, AlertTypes.warn);
        console.log(err)
    }
  }
    
  const updatePdfRotation = async (pdfRotation: number)=>{
    try{
      await client.mutate({
            mutation: UPDATE_PDF_ROTATION,
            variables:{
                id: pathMatch.params.drawingId,
                rotation: pdfRotation
            },
            context:{role: projectFeatureAllowedRoles.createDrawings, token: state.selectedProjectToken}
        })
    }catch(err: any){
        console.log(err)
    }
}
    
    return (
        <div className="pdfView">
           <div className="pdfView__webviewer" ref={viewer}></div>
        </div>
    )
}
