import React, { ReactElement } from 'react'
import Drawer from "@material-ui/core/Drawer";
import classNames from "classnames";

interface RightDrawerProps {
    handleRightDrawerClose: () => void,
    openRightPanel: boolean,
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

const RightDrawer = (props: RightDrawerProps): ReactElement => {

    const { classes, handleRightDrawerClose, openRightPanel } = props;

    return (
        <>
            <Drawer
                classes={{
                    paper: classNames({
                        [classes.rightDrawerOpen]: openRightPanel,
                        [classes.rightDrawerClose]: !openRightPanel
                    })
                }}
                anchor="right"
                open={openRightPanel}
                ModalProps={{ onBackdropClick: handleRightDrawerClose }}
            >
                <p style={{ padding: '0 10px' }}>Contrary to popular belief, Lorem Ipsum is not simply random text. 
                It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 
                years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, 
                looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going 
                through the cites of the word in classical literature, discovered the undoubtable source. 
                Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" 
                (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the 
                theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 
                "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p>
            </Drawer>
        </>
    )
}

export default RightDrawer
