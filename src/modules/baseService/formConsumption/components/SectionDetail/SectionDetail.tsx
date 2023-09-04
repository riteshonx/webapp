import React from 'react';
import { ProjectCheckList } from './ProjectCheckList';
import './SectionDetail';

export const SectionDetail = (props: any): React.ReactElement => {
	const renderSectionDetail = () => {
		return (
			props?.projectSectionInfo.length > 0 &&
			props?.projectSectionInfo.map((sectionItemItem: any) => (
				<ProjectCheckList
					key={sectionItemItem.elementId}
					checkListItem={sectionItemItem}
				/>
			))
		);
	};
	return <React.Fragment>{renderSectionDetail()}</React.Fragment>;
};
