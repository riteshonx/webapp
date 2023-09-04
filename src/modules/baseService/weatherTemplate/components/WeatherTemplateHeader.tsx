import React from 'react'
import { Button, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import './weatherTemplate.scss';

const WeatherTemplateHeader = (props:any) => {
  const {searchName,setSearchName,handleUpdateButtonClick,disabled} = props;
  return (
   <div className="weather-template-action">
					<div className="weather-template-search">
						<TextField
							value={searchName}
							id="weather-search-text"
							data-testid="weatherTemplateSearch"
							type="text"
							fullWidth
							placeholder="Search"
							variant="outlined"
							onChange={(e) => setSearchName(e.target.value)}
						/>
						<SearchIcon className="weather-template-searchicon" />
					</div>
          <div className='weather-template-actionbtn'>
					<Button
						variant="outlined"
						size="small"
						className="btn-primary"
            onClick={()=>handleUpdateButtonClick()}
						disabled={disabled}
					>
						Update Template
					</Button>
					{/* <Button
						variant="outlined"
						size="small"
						className="btn-primary"
					>
						Add Template
					</Button> */}
          </div>
				</div>
  )
}

export default WeatherTemplateHeader
