import React, { ReactElement } from 'react'
import Drawer from "@material-ui/core/Drawer";
import classNames from "classnames";

interface SectionDrawerProps{
    handleSectionDrawerClose: () => void
    openSectionPanel: boolean
    classes: {
        section: any
    }
}

const SectionDrawer = (props: SectionDrawerProps) : ReactElement =>{
    const { classes, handleSectionDrawerClose, openSectionPanel } = props;
    return(
        <Drawer
         classes={{
                    paper: classNames({
                        [classes.section]: openSectionPanel,
                        [classes.section]: !openSectionPanel
                    })
                }}
                anchor="left"
                open={openSectionPanel}
                ModalProps={{ onBackdropClick: handleSectionDrawerClose }}
        >

        </Drawer>
    )
}
export default SectionDrawer