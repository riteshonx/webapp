import React, { ReactElement, useState } from 'react';
import './DrawingViewerLeftBar.scss';
import DescriptionIcon from '@material-ui/icons/Description';
import LayersIcon from '@material-ui/icons/Layers';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import DrawingViewerSheetMain from '../DrawingViewerSheetMain/DrawingViewerSheetMain';
import DrawingViewerLayerMain from '../DrawingViewerLayerMain/DrawingViewerLayerMain';


export default function DrawingViewerLeftBar(props: any): ReactElement {

    const [tabValue, setTabValue] = useState('SHEETS');
    const [searchText, setSearchText] = useState('')

    const handleFetchSheetUrl = (drawing: any) => {
        props.fetchSheetUrl(drawing);
    }

    const handleSheetSearch = (e:any) => {
        setSearchText(e.target.value)
        props.searchSheets(e.target.value);
    }

    const handleLayerSearchChange = (e:any) => {
        setSearchText(e.target.value)
        props.searchLayers(e.target.value);
    }

    return (
        <div className="list-wrapper">
            <div className="list-wrapper__tab">
                {/* ************************ The below commented codes are  required for the 1.1 ******************* */}

                {/* <div className={`list-wrapper__tab__sheets ${tabValue === 'LAYERS' ? 'list-wrapper__tab__active' : ''}`} 
                onClick={() => setTabValue('SHEETS')}>
                    <div className="list-wrapper__tab__sheets__icon">
                        <DescriptionIcon />
                    </div>
                    <div>Sheets</div>
                </div> */}
                {/* <div className={`list-wrapper__tab__layers ${tabValue === 'SHEETS' ? 'list-wrapper__tab__active' : ''}`}
                    //  onClick={() => setTabValue('LAYERS')}
                >
                    <div className="list-wrapper__tab__layers__icon">
                        <LayersIcon />
                    </div>
                    <div>Layers</div>
                </div> */}
                
            </div>
            {
                tabValue === 'SHEETS' ? (
                    <div className="list-wrapper__tab__search">
                        <TextField
                            id="drawings-lists-search-text"
                            type="text"
                            fullWidth
                            placeholder="Search drawings"
                            autoComplete="search"
                            variant="outlined"
                            value={searchText}
                            onChange={(e) => handleSheetSearch(e)}
                        />
                        <SearchIcon className="list-wrapper__tab__search__icon"/>
                        {/* <div className="drawings-action__middle__count">Showing 0 entries</div> */}
                    </div>
                ) : (
                    <div className="list-wrapper__tab__search">
                        <TextField
                            id="laers-lists-search-text"
                            type="text"
                            fullWidth
                            placeholder="Search layers"
                            autoComplete="search"
                            variant="outlined"
                            value={searchText}
                            onChange={(e) => handleLayerSearchChange(e)}
                        />
                        <SearchIcon className="list-wrapper__tab__search__icon"/>
                        {/* <div className="drawings-action__middle__count">Showing 0 entries</div> */}
                    </div>
                )
            }
            {
                tabValue === 'SHEETS' ? (
                    <DrawingViewerSheetMain handleFetchSheetUrl ={handleFetchSheetUrl}/>
                ): (
                    <DrawingViewerLayerMain />
                )
            }
        </div>
    )
}
