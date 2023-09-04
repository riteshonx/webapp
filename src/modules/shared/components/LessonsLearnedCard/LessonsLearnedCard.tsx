import React, { ReactElement } from "react";

// Constant
import {
    LESSONS_LEARNED_STATUS_ACTED,
    LESSONS_LEARNED_STATUS_IGNORED,
    LESSONS_LEARNED_STATUS_SHARED
} from '../../../insights/constant/index';

// Model
import { LessonsLearned } from '../../../insights/models/insights';

//Style
import './LessonsLearnedCard.scss';
function LessonsLearnedCard(
    { data, open, onClick }:
        { data: LessonsLearned; open: any, onClick: any }): ReactElement {
    return (
        <article className={`lessonsLearnedCard ${open && 'open'}`} onClick={onClick}>
            <div className="lessonsLearnedCard__header">
                <h3 className="lessonsLearnedCard__header__title">{data.lessonslearnedInsight.subject}</h3>
                <div className="lessonsLearnedCard__header__tags">
                    {
                        !data.status.length &&
                        <div className="lessonsLearnedCard__header__tags__tag new">
                            New
                        </div>
                    }
                    {
                        data.status.find((state: string) => state === LESSONS_LEARNED_STATUS_ACTED) &&
                        <div className="lessonsLearnedCard__header__tags__tag acted">
                            Acted
                        </div>
                    }
                    {
                        data.status.find((state: string) => state === LESSONS_LEARNED_STATUS_SHARED) &&
                        <div className="lessonsLearnedCard__header__tags__tag shared">
                            Shared
                        </div>
                    }
                    {
                        data.status.find((state: string) => state === LESSONS_LEARNED_STATUS_IGNORED,
                        ) &&
                        <div className="lessonsLearnedCard__header__tags__tag shared">
                            Ignored
                        </div>
                    }
                </div>
            </div>
            <p className="lessonsLearnedCard__description">
                {data.lessonslearnedInsight.description}
            </p>
            {/* TODO: Bind with required field */}
            <div className="lessonsLearnedCard__detail">
                <div>
                    <p className="lessonsLearnedCard__detail__header">Project Area</p>
                    <p className="lessonsLearnedCard__detail__value">
                        {data.lessonslearnedInsight.projectPrimarySystem}
                    </p>
                </div>
                <div>
                    <p className="lessonsLearnedCard__detail__header">Project Stage</p>
                    <p className="lessonsLearnedCard__detail__value">
                        {data.lessonslearnedInsight.stage}
                    </p>
                </div>
                <div>
                    <p className="lessonsLearnedCard__detail__header">Precedent Outcome</p>
                    <p className="lessonsLearnedCard__detail__value">
                        {data.lessonslearnedInsight.outcomeType}
                    </p>
                </div>
            </div>

        </article>
    )
}

export default LessonsLearnedCard;