import { Tab as MuiTab, Tabs as MuiTabs } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { Theme } from 'src/modules/visualize/theme';

import { Tab } from './Tab';
import { TabPanel } from './TabPanel';

const useStyles = makeStyles((theme: Theme) => ({
    tabs: {
        '& .MuiButtonBase-root': {
            color: 'black',
            fontSize: '14px',
            'letter-spacing': '0px',
            textTransform: 'initial',
            fontFamily: '"Poppins", sans-serif',
            paddingLeft: '13px',
            paddingRight: '13px',

            '&.Mui-selected': {
                color: 'black',
                fontWeight: '600 !important',
            }
        },

        '& .MuiTabs-indicator': {
            backgroundColor: 'black',
        },

        borderBottom: `solid 1px ${theme.colors.lightGrey}`,
    }
}));

interface TabsProps {
    tabs: Tab[];
}

export function Tabs({tabs}: TabsProps) {
    const classes = useStyles();

    const [value, setValue] = useState<number>(0);

    function handleChange(event: React.SyntheticEvent, newValue: number) {
        setValue(newValue);
    }

    return (
        <>
            <MuiTabs value={value} onChange={handleChange} className={classes.tabs}>
                {
                    tabs.map((tab, index) => <MuiTab key={`tab-${index}`} label={tab.label} />)
                }
            </MuiTabs>

            {
                tabs.map((tab, index) =>
                    <TabPanel key={`tab-panel-${index}`} value={value} index={index}>
                        {tab.panel}
                    </TabPanel>
                )
            }
        </>
    );
}