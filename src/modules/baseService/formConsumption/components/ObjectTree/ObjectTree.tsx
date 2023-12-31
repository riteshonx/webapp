import React from 'react';
import './ObjectTree.scss';
import { ToolTip } from '../ToolTip/ToolTip';


interface ObjectTreeProps{
  formData:FormData;
  data:Data[];
}

export interface Data{
  caption:string;
  elementId:string;
  typeId:string;
  value:any
}

interface FormData{
autoGenerated:boolean 
caption:string; 
configListId:any; 
elementId:string;
fieldTypeId:number;
filterable:any;
fixed: boolean;
metaData:any;
required:boolean;
sequence:number;
tableId:null;
width: number;
}


export const ObjectTree = (props: ObjectTreeProps): React.ReactElement => {
	return (
		<React.Fragment>
			{props?.data.length > 0 &&
				props?.data.map(
					(item: Data,index:number) =>
						item?.caption == props?.formData?.caption && (
							<ToolTip
                key={index}
								objectTypeData={item}
							/>
						)
				)}
		</React.Fragment>
	);
};
