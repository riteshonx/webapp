import React ,{ ReactElement } from 'react';
import { TemplateData } from '../../models/template';
import './Attachment.scss';

interface IAttachment{
    index: number,
    field: TemplateData
}

export default function Attachement({index, field}: IAttachment): ReactElement {
    return (
        <div data-testid={`attachment-${index}`}  className={`attachment ${field.fixed?' attachment__fixed':''}`} id={`Attachment-${index}`}>
             File Attachment
        </div>
    )
}
