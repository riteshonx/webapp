import { ImageList, ImageListItem } from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react'
import ImageDetailsPopup from '../../../Shared/ImageDetailsPopup/ImageDetailsPopup';
import './ProductivityPhotoGridWidget.scss';

export default function ProductivityPhotoGridWidget(props: any): ReactElement {

    const [imageList, setImageList] = useState<any>([]);
    const [openCarousel, setOpenCarousel] = useState(false);
    const [selectedFile, setSelectedFile]: any = useState(null);

    useEffect(() => {
        props.photoList ? setImageList(props.photoList) : setImageList([]);
    }, [props.photoList])

    const openImage = (item: any) => {
        console.log(item)
        setSelectedFile({...item, ...{
            documentType: {name: "image"},
            name: item.fileName,
            updatedAt: item.createdAt,
            createdByUser: {
                firstName: item.tenantAssociation?.user?.firstName || '',
                lastName: item.tenantAssociation?.user?.lastName || '',
            },
            updatedByUser: {
                firstName: item.tenantAssociation?.user?.firstName || '',
                lastName: item.tenantAssociation?.user?.lastName || '',
            }
        }});
        setOpenCarousel(true);  
    }

    return (
        <div className="productivity-photo-grid-widget">
            <div className='photo-grid-header'>Photos</div>
            <div className='photo-grid-content'>
                <ImageList rowHeight={58} cols={4}>
                    {imageList.map((item: any) => (
                        <ImageListItem key={item.key} cols={1}>
                            <img src={item.url} alt={item.title} onClick={() => openImage(item)} />
                        </ImageListItem>
                    ))}
                </ImageList>
            </div>
            <ImageDetailsPopup
                open={openCarousel}
                close={() => {
                    setOpenCarousel(false);
                    setSelectedFile(null);
                }}
                selectedFile={selectedFile}
            />
        </div>
    )
}
