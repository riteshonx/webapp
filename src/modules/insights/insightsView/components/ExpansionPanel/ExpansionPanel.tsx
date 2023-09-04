import React, { ReactElement, useState } from 'react'
import Add from '@material-ui/icons/Add'

import './ExpansionPanel.scss'

function ExpansionPanel(props: any): ReactElement {
    const [open, setOpen] = useState(false)
    return <div className="expansion-panel">
        <div className='expansion-panel__header' onClick={() => setOpen(!open)}>
            <h5>{props.title}</h5>
            <Add fontSize="small" />
        </div>
        {open && <div className='expansion-panel__content'>
            {props.slot}
        </div>}
    </div>
}

export default ExpansionPanel