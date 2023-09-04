
import React, { ReactElement, useContext } from "react";
import { SpecificationLibDetailsContext } from '../../../context/SpecificationLibDetailsContext';
import "./SubmittalRestoreTable.scss";
import { setSubmittalList} from "../../../context/SpecificationLibDetailsAction";
import Notification, { AlertTypes } from '../../../../../shared/components/Toaster/Toaster';

export default function SubmittalRestoreTable(props: any): ReactElement {

    const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
        useContext(SpecificationLibDetailsContext);
    
    const restoreSubmittal = (selectedIndex: number) => {
        updateSubmittal({
            ...SpecificationLibDetailsState.submittalList[selectedIndex], 
            notASubmittal: false,
        }, selectedIndex)
        Notification.sendNotification(`Item ‘${SpecificationLibDetailsState.submittalList[selectedIndex].section_number}-${SpecificationLibDetailsState.submittalList[selectedIndex].submittal_type}’ has been restored`, AlertTypes.success);
    };

    function updateSubmittal(submittal: any,selectedIndex: number) {
        SpecificationLibDetailsDispatch(setSubmittalList([...SpecificationLibDetailsState.submittalList.slice(0, selectedIndex), submittal, ...SpecificationLibDetailsState.submittalList.slice(selectedIndex + 1)]));
    }

    return (
        <div className="submittal-restore-table">
            <table className="submittalTable">
                <tbody>
                    {Object.keys(props.dataInfo).map((key: any, index: number) => {
                        return (
                            props.dataInfo[key].map((submittal: any, index: number) => {
                                return (
                                    <tr className="type2" key={key + index}>
                                        <td className="idDetails">{submittal.section_number + ' - ' + submittal.section_name}</td>
                                        <td colSpan={2}><b>Type: </b>{submittal.submittal_type}</td>
                                        <td onClick={(e) => restoreSubmittal(submittal.uniqueIndex)} className="restore">Restore</td>
                                    </tr>
                                )
                            })
                        )
                    })}
                    {(Object.keys(props.dataInfo).length === 0) ? <tr><td colSpan={3}>No deleted submittal found.</td></tr>: null}
                </tbody>
            </table>
        </div>
    );
}
