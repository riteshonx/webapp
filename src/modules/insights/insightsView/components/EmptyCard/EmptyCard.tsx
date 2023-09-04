import React, { ReactElement } from 'react'
import './EmptyCard.scss'

function EmptyCard({msg}:{msg:string}): ReactElement {
    return <div className="emptyCard">
        <p className="emptyCard__message">
            {msg}
        </p>
    </div>
    
}

export default EmptyCard