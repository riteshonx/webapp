
import React, { ReactElement, useEffect, useState } from "react";
import "./SubmittalReviewToast.scss";

export default function SubmittalReviewToast(props: any): ReactElement {

    const [show, setShow] = useState(false);

    useEffect(() => {
        if(props.message && props.message !== '') {
            setShow(true)
            setTimeout(() =>{setShow(false)}, 10000)
        } else {
            setShow(false)
        }
    }, [props.message])

    return (
        show ? <div className="submittal-review-toast">
           <div className="toast-container">
               {props.message}
               {props.linkText && <span className="linkText" onClick={() => props.linkFunction(props.parameter)}>{props.linkText}</span>}
            </div>
        </div> : <></>
    );
}
