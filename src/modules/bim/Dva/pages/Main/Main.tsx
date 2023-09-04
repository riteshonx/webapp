import React, {ReactElement, useReducer, useContext, useState, useEffect } from 'react';
import { bimContext } from '../../../contextAPI/bimContext';
import { bimReducer, initialState } from '../../../contextAPI/bimReducer';
// import BimUploadLanding from "../../../component/BimUploadLanding/BimUploadLanding';
import   DvaScriptUploadLanding   from "src/modules/bim/Dva/component/DvaScriptUploadLanding/DvaScriptUploadLanding";




export default function Main(): ReactElement {

    const [state, dispatch] = useReducer(bimReducer, initialState);
    return (
        <bimContext.Provider value={{ state, dispatch }}>
            <DvaScriptUploadLanding />
        </bimContext.Provider>
    )
}