import React, { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Toolbar, Button, Menu, MenuItem } from '@material-ui/core';

interface HorizontalNavbarProps {
    handleListItem: (ev: any) => void,
    handleClose: () => void,
    handleLayouts: (ev: any) => void,
    anchorEl2: null,
    classes: {
        accountIcon: string
        appBar: string
        appBarShift: string
        appBarShiftClose: string
        backButton: string
        bottomBar: string
        colorWhite: string
        colorYellow: string
        content: string
        drawer: string
        drawerClose: string
        drawerOpen: string
        forwardButton: string
        fullWidth: string
        grow: string
        hide: string
        imgWidth: string
        menuButton: string
        menuButtonIconClosed: string
        menuButtonIconOpen: string
        microDrawer: string
        paddingLeft: string
        paddingTop: string
        paper: string
        rightDrawerClose: string
        rightDrawerOpen: string
        rightPannel: string
        root: string
        secondState: string
        toolbar: string
        topBar: string
        weatherIcon: string
    }
}

const HorizontalNavbar = (props: HorizontalNavbarProps): ReactElement => {

    const { classes, handleClose, handleListItem, handleLayouts, anchorEl2 } = props;

    return (
        <>
            <Toolbar>
                <Button aria-controls="dash-board" aria-haspopup="true" className={classes.colorYellow}>
                    Dashboards
                </Button>
                <Button className={classes.colorYellow} aria-controls="ui-elements" aria-haspopup="true" 
                  onMouseOver={e => handleLayouts(e)}>
                    Layouts
                </Button>
                <Menu
                    id="ui-elements"
                    anchorEl={anchorEl2}
                    keepMounted
                    open={Boolean(anchorEl2)}
                    MenuListProps={{ onMouseLeave: handleClose }}
                    onClose={handleClose}
                    classes={{
                        paper: classes.paper,
                    }}
                >
                    <MenuItem component={Link} to="/vertical" onClick={() => handleListItem('vertical')} 
                      className={classes.colorYellow}>Vertical</MenuItem>
                    <MenuItem component={Link} to="/horizontal 1" onClick={() => handleListItem('horizontal 1')} 
                      className={classes.colorYellow}>Horizontal 1</MenuItem>
                    <MenuItem component={Link} to="/horizontal 2" onClick={() => handleListItem('horizontal 2')} 
                      className={classes.colorYellow}>Horizontal 2</MenuItem>
                </Menu>
                <Button aria-controls="simple-menu" aria-haspopup="true" className={classes.colorYellow}>
                    Apps
                </Button>
                <Button aria-haspopup="true" component={Link} to="/vertical" onClick={() => handleListItem('vertical')} 
                  className={classes.colorYellow}>
                    Vertical
                </Button>
                <Button aria-haspopup="true" component={Link} to="/horizontal 1" onClick={() => handleListItem('horizontal 1')} 
                  className={classes.colorYellow}>
                    Horizontal 1
                </Button>
                <Button aria-haspopup="true" component={Link} to="/horizontal 2" onClick={() => handleListItem('horizontal 2')} 
                  className={classes.colorYellow}>
                    Horizontal 2
                </Button>
            </Toolbar>
        </>
    )
}

export default HorizontalNavbar
