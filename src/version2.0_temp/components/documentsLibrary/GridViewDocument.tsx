import React, { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import DescriptionIcon from '@material-ui/icons/Description';
import VideoIcon from '@material-ui/icons/Videocam';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import DownloadIcon from '@material-ui/icons/GetApp';
import AudioIcon from '@material-ui/icons/Audiotrack';
import { Tooltip } from '@material-ui/core';
import './gridviewdocument.scss';

export default function GridViewDocument(props: any) {
	const { documentResponse, fetchData, displayData, getImageCarouselFile } = props;
	const count = documentResponse?.data?.documents_aggregate.aggregate.count;
	const loader = useMemo(() => {
  if (displayData?.length === count) {
    return '';
  } else {
    return <h4>Loading...</h4>;
  }
}, [displayData?.length, count]);
	return (
		<>
			<InfiniteScroll
				dataLength={displayData?.length ? displayData?.length : 0}
				next={fetchData}
				hasMore={true}
				loader={loader}
			>
				<div className="v2-gridview">
					<div className="v2-gridview-doclist">
						{displayData?.length > 0 &&
							displayData.map((file: any , i:number ) => (
								<div key={file.id}
								onClick={()=> getImageCarouselFile(file)}
								 className="v2-gridview-doclist-container">
									<div className="v2-gridview-doclist-filecontainer">
										{file.documentType.name === 'image' && (
											<img
												className="v2-gridview-doclist-filecontainer-img"
												src={file.url}
												alt={'...'}
											/>
										)}
										{file.documentType.name === 'docs' && (
											<DescriptionIcon className="v2-gridview-doclist-filecontainer-docsandvideo"></DescriptionIcon>
										)}
										{file.documentType.name === 'video' && (
											<VideoIcon
												className={
													'v2-gridview-docList-filecontainer-docsandvideo'
												}
											/>
										)}
										{file.documentType.name === 'audio' && (
											<AudioIcon
												className={
													'v2-gridview-doclist-filecontainer-docsandvideo'
												}
											/>
										)}

										<div className="v2-gridview-doclist-textcontainer">
											<Tooltip
												title={file?.name}
												placement="top"
											>
												<span className="v2-gridview-doclist-textcontainer-filename">
													{/* {file?.name} */}
													{file?.name && file?.name?.length > 20
														? `${file?.name.slice(0, 20)}...`
														: file?.name}
												</span>
											</Tooltip>
											<span className="v2-gridview-doclist-iconcontainer">
												<Tooltip
													title={'Download'}
													placement="top"
												>
													<DownloadIcon
														className="v2-gridview-doclist-iconcontainer-icon"
														onClick={(e: any) => {
															e.stopPropagation();
															window.open(file.url, '_blank');
														}}
													/>
												</Tooltip>
											</span>
										</div>
									</div>
								</div>
							))}
					</div>
				</div>
			</InfiniteScroll>
			{displayData?.length === 0 && (
				<div className="v2-gridview-nocontent">No data available</div>
			)}
		</>
	);
}
