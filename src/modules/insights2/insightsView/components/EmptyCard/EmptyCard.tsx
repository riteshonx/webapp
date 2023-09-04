import React, { ReactElement } from 'react'
import './EmptyCard.scss'

function EmptyCard({msg}:{msg:string}): ReactElement {
    return <div className="v2-emptyCard">
        <p className="v2-emptyCard__message">
            {msg}
        </p>
    </div>
    
}

export default EmptyCard