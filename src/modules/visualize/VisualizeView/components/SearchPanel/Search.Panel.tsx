import { FormControlLabel, Radio, RadioGroup, TextField } from '@material-ui/core';
import IconButton from '@mui/material/IconButton';
import { makeStyles } from '@mui/styles';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material';
import { SmartBuilding, SmartProjectSite } from 'location-intelligence-viewer';

const useStyles = makeStyles(() => ({
    textfield: {
        fontSize: '14px',
        width: '60%',
    },

    radioLabel: {
        '& .MuiFormControlLabel-label': {
            fontSize: '14px',
        },
    }
}));

const SearchFormContainer = styled('div')(({ theme }) => ({
    width: '100%',
    padding: '14px 10px 10px',
    fontSize: '14px',
}));

interface SearchBoxProps {
    buildings: SmartBuilding[] | undefined;
    onChange: (value: string) => void;
    smartProjectSite: SmartProjectSite | undefined;
    reset: () => void;
}

export function SearchPanel({ buildings, onChange, smartProjectSite, reset }: SearchBoxProps) {
    const classes = useStyles();
    const [searchType, setSearchType] = useState("location");
    const [searchKey, setSearchkey] = useState('');

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (searchType === 'location') {
            onLocationSearch(e.target.elements.searchKey.value);
        } else {
            onChange(e.target.elements.searchKey.value);
        }
    }

    const handleSerachTypeChange = (event: any, value: any) => {
        searchType === 'location' ? onLocationSearch('') : onChange(''); 
        setSearchkey('');
        setSearchType(value) 
    }

    function onLocationSearch(matchString: string) {
        const isNameMatch = (node: any) => {
            if (matchString == "" || node.name.match(new RegExp(`${matchString}`, "i"))) {
                node.setIsVisibleOnTree(true)
            } else {
                node.setIsVisibleOnTree(false)
            }
        }

        if (buildings) {
            buildings.map((building: SmartBuilding) => {
                isNameMatch(building);
                building.traverse(isNameMatch)
            })
            reset();
        }
    }

    return (
        <SearchFormContainer>
            <form onSubmit={handleSubmit}>
                <TextField
                    id="searchKey"
                    onChange={(e) => { setSearchkey(e.target.value)}}
                    value={searchKey}
                    className={classes.textfield}
                    placeholder={searchType === 'location' ? 'Search Level, Zone, Room' : 'Search CheckList Type, Status, Assigned to'}
                />
                <IconButton type="submit" aria-label="search" >
                    <SearchIcon fontSize="large" />
                </IconButton>
            </form>
            <RadioGroup row value={searchType} onChange={handleSerachTypeChange} >
                <FormControlLabel className={classes.radioLabel} value="location" control={<Radio size={"small"} color="default" />} label="By Location" />
                <FormControlLabel className={classes.radioLabel} value="checklist" control={<Radio size={"small"} color="default" />} label="By CheckList" />
            </RadioGroup>
        </SearchFormContainer>
    );
}