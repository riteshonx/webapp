import {
    Button,
} from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { attributeList, operatorsList } from "src/modules/bim/constants/query";
import { FETCH_SPATIAL_RESULT } from "src/modules/bim/graphql/bimQuery";
import { client } from "../../../../../services/graphql";
import { bimContext } from "../../../contextAPI/bimContext";
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { stateContext } from "../../../../root/context/authentication/authContext";
import { setIsLoading } from "../../../../root/context/authentication/action";
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import DrawSpatialCube from './DrawSpatialCube/DrawSpatialCube';
import SpatialCubeOperation from './SpatialCubeOperation/SpatialCubeOperation';

let cubeEntityString: any = null;

const SpatialQuery: React.FC<any> = ({ onSubmit, queryOption, onClose }) => {
    const context: any = useContext(bimContext);
    const { dispatch, state }: any = useContext(stateContext);
    const [cubeDrawn, setCubeDrawn] = useState(false);
    const visualizeJS = context.state.visualizeJS;

    const fetchSpatialData = async (query: any, variables: any) => {
        let responseData;
        try {
            responseData = await client.query({
                query: query,
                variables: variables,
                fetchPolicy: 'network-only',
                context: { role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken }
            });

        } catch (error: any) {
            console.log(error)
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const saveSpatialQuery = async () => {
        if (!cubeEntityString) {
            return;
        }
        const viewer = context.state.viewer;
        const model = viewer.getActiveModel();
        const entityId = model.findEntity(cubeEntityString);
        const entity = entityId?.openObject();

        const spatialVisualStyleId = entity.getVisualStyle();
        const visualStyle = spatialVisualStyleId.openObject();
        visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeModel, 0, visualizeJS.VisualStyleOperations.kSet);
        visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeStyles, 0, visualizeJS.VisualStyleOperations.kSet);
        visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeModifiers, 0, visualizeJS.VisualStyleOperations.kSet);
        visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kFaceLightingModel, 0, visualizeJS.VisualStyleOperations.kSet)

        const resFtchExtents = entity.getExtents();
        const resFtchMinBondngBox = resFtchExtents.min();
        const resFtchMaxBondngBox = resFtchExtents.max();
        const gmtryData = entity?.getGeometryDataIterator()?.getGeometryData().openObject();
        const trnMatrx = gmtryData.getModelingMatrix()
        const trnMatrxAry = getMatrixArray(trnMatrx, 4, 4);
        const invMatrx = trnMatrx.invert();
        gmtryData.appendModelingMatrix(invMatrx)

        dispatch(setIsLoading(true));
        setTimeout(async() => {
            const extents = entity.getExtents();
            const minBoundingBox = extents.min();
            const maxBoundingBox = extents.max();
            const centerBoundingBox = extents.center();

            entity.delete();

            const spatialAttr = attributeList.find((attribute) => attribute.value === "sourceId");
            if (!spatialAttr) {
                return;
            }
            const spatialOperator = operatorsList[spatialAttr.type].find(operator => operator.value === "_in");
            const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
            const filterResult: any = await fetchSpatialData(FETCH_SPATIAL_RESULT, {
                max: resFtchMinBondngBox,
                min: resFtchMaxBondngBox,
                modelIds: modelIds
            });
            if (!filterResult) {
                Notification.sendNotification('Some error occured while executing the spatial query', AlertTypes.warn);
                dispatch(setIsLoading(false));
                return
            }
            const result = filterResult?.bimSpatialElement_query?.handleIds;
            onSubmit({
                minBoundingBox: minBoundingBox,
                maxBoundingBox: maxBoundingBox,
                center: centerBoundingBox,
                handleIds: result,
                attribute: spatialAttr,
                attributeOperator: spatialOperator,
                tranformationnMatrxAry: trnMatrxAry
            });
        }, 1000);
    };

    const setCubeInfo = (isDrawn: boolean, entityId: string | null) => {
        cubeEntityString = entityId;
        setCubeDrawn(isDrawn)
    }

    const getMatrixArray = (matrix3d: any, row: number, col: number) => {
        const array: any = new Array(row);
        for (let i = 0; i < row; i++) {
            if(!Array.isArray(array[i])) {
                array[i] = new Array(col)
            }
            for (let j = 0; j < col; j++) {
                array[i][j] = matrix3d.get(i,j)                
            }
        }
        return array;
    }

    return (
        <div className="spatial-header bimQueryForm">
            <DrawSpatialCube queryOption={queryOption} setCubeInfo={setCubeInfo}/>
            {cubeDrawn && <SpatialCubeOperation cubeEntityString={cubeEntityString} />}
            <div className="submit-section">
                <Button className="btn-secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button disabled={!cubeDrawn} className="btn-primary" onClick={saveSpatialQuery}>
                    Save
                </Button>
            </div>
        </div>
    );
};

export default SpatialQuery;
