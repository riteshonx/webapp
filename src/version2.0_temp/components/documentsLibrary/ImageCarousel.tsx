import React, { useEffect, useState } from 'react';
import './imagecarousel.scss';
import CloseIcon from '../../assets/images/icons/closeIcon.svg';
import DescriptionIcon from '@material-ui/icons/Description';
import AudioIcon from '@material-ui/icons/Audiotrack';

export default function ImageCarousel(props: any) {
	const { closeImageCarousel, carouselFile } = props;


	return (
		<div className="v2-image-carousel">
			<div className="v2-image-carousel-closeicon">
				<img
					src={CloseIcon}
					alt="close icon"
					className="v2-image-carousel-icon"
					onClick={closeImageCarousel}
				/>
			</div>
			<div className="v2-image-carousel-container">

				{carouselFile?.documentType.name === 'image' && (
					<div
						className="v2-image-carousel-container-image"
						style={{
							backgroundImage: `url(${carouselFile?.url})`,
						}}
					></div>
				)}
				{carouselFile?.documentType.name === 'video' && (
					<video
						width="100%"
						height="100%"
						controls={false}
						autoPlay={true}
						muted
						loop
					>
						<source
							src={carouselFile?.url}
							type="video/mp4"
						/>
					</video>
				)}
				{carouselFile?.documentType.name === 'docs' && (
					<DescriptionIcon className="v2-image-carousel-container-docs"></DescriptionIcon>
				)}
				{carouselFile?.documentType.name === 'audio' && (
					<AudioIcon className="v2-image-carousel-container-audio "></AudioIcon>
				)}
			</div>
		</div>
	);
}
