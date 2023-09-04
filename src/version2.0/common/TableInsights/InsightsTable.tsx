import React from 'react';
import './insightstable.scss';
type TableData = {
	checklist: string;
	location: string;
	failure: string;
	date: string;
};

const tableData: TableData[] = [
	{
		checklist: 'Checklist 1',
		location: 'Location A',
		failure: 'Failure 1',
		date: '2022-01-01',
	},
	{
		checklist: 'Checklist 2',
		location: 'Location B',
		failure: 'Failure 2',
		date: '2022-01-02',
	},
	{
		checklist: 'Checklist 3',
		location: 'Location C',
		failure: 'Failure 3',
		date: '2022-01-03',
	},
];


export default function InsightsTable() {
const columns: string[] = Object.keys(tableData[0]);
	return (
    <div>
      <table className='v2-insights-table'>
        <thead className='v2-insights-table-head'>
          <tr>
          {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((data) => (
            <tr key={data.checklist}>
              <td>{data.checklist}</td>
              <td>{data.location}</td>
              <td>{data.failure}</td>
              <td>{data.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
