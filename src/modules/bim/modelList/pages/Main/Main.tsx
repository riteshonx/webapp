import React, { ReactElement, useReducer } from 'react'
import { bimContext } from '../../../contextAPI/bimContext';
import { bimReducer, initialState } from '../../../contextAPI/bimReducer';
import BimUploadLanding from '../../component/BimUploadLanding/BimUploadLanding';

export default function Main(): ReactElement {

    const [state, dispatch] = useReducer(bimReducer, initialState);
    return (
        <bimContext.Provider value={{ state, dispatch }}>
            <BimUploadLanding />
        </bimContext.Provider>
    )
}
