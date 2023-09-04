import React, { ReactElement, useReducer } from 'react'
import Viewer from '../../component/Viewer/Viewer';
import { bimContext } from '../../../contextAPI/bimContext';
import { bimReducer, initialState } from '../../../contextAPI/bimReducer';

export default function Main(): ReactElement {

    const [state, dispatch] = useReducer(bimReducer, initialState);
    return (
        <bimContext.Provider value={{ state, dispatch }}>
            <Viewer/>
        </bimContext.Provider>
    )
}
