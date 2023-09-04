import { ReactElement } from 'react';

export const ProductivityOption = ({
  onClick,
}: {
  onClick: any;
}): ReactElement => (
  <div
    onClick={onClick}
    className="v2-project-item v2-project-circle v2-project-cost s-center s-flex-column"
  >
    <div className="v2-project-item-title">Productivity</div>
  </div>
);
export const ScheduleOption = ({ onClick }: { onClick: any }): ReactElement => (
  <div
    onClick={onClick}
    className="v2-project-item v2-project-circle v2-project-cost s-center s-flex-column "
  >
    <div className="v2-project-item-title">Schedule</div>
  </div>
);
export const BudgetOption = ({ onClick }: { onClick: any }): ReactElement => (
  <div
    onClick={onClick}
    className="v2-project-item v2-project-circle v2-project-cost s-center s-flex-column "
  >
    <div className="v2-project-item-title">Budget</div>
  </div>
);
