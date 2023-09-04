import React, { useState, useCallback } from 'react';
import DescriptionIcon from '@material-ui/icons/Description';
import { Tooltip } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import { postApi } from 'src/services/api';
import Notification, {
	AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import './FileAttachment.scss';

interface PayloadData {
	key: string;
	fileName: string;
	expiresIn: number;
}

interface AttachmentItem {
	blobKey: string;
	fileName: string;
	fileSize: number;
	fileType: string;
	// __typename: string;
}

const attachmentSize = (fileSize:number)=>{
	return (fileSize / (1024 * 1024)).toFixed(3) 
}

export const FileAttachment = (props: any): React.ReactElement => {
	const { attachmentList } = props;
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const handleDownloadAttachment = useCallback((attachment: AttachmentItem) => {
		const payload:PayloadData[] = [
			{
				fileName: attachment?.fileName,
				key: attachment?.blobKey,
				expiresIn: 1000,
			},
		];
		downloadAttachment(payload);
	},[attachmentList]);

	const downloadAttachment = async (payload: PayloadData[]) => {
		try {
			const attachmentUploadResponse = await postApi(
				'V1/S3/downloadLink',
				payload
			);
			window.open(attachmentUploadResponse.success[0].url, '_parent');
			setIsLoading(false);
		} catch (error) {
			Notification.sendNotification(error, AlertTypes.warn);
			setIsLoading(false);
		}
	};

	const renderAttachment =
		attachmentList?.length > 0 &&
		attachmentList.map((attachmentFile: any, index: number) => {
			const fileSize = attachmentSize(attachmentFile?.attachment?.fileSize);
			return (
				<>
					<div
						key={`${attachmentFile.attachment.blobkey}-${index}`}
						className="attachment-fileList-file"
					>
						<div className="attachment-fileList-file-thumbnail">
							<DescriptionIcon className="attachment-fileList-file-thumbnail-icon" />
						</div>
						<div className="attachment-fileList-file-description">
							<Tooltip title={attachmentFile.attachment.fileName}>
								<div className="attachment-fileList-file-description-fileName">
									{attachmentFile.attachment.fileName.length > 20
										? `${attachmentFile.attachment.fileName.slice(0, 18)}....${
												attachmentFile.attachment.fileName.split('.')[1]
										  }`
										: attachmentFile.attachment.fileName}
								</div>
							</Tooltip>
							<div className="attachment-fileList-file-description-fileSize">
								{fileSize} MB
							</div>
						</div>
						<div className="attachment-fileList-file-download">
							<GetAppIcon
								onClick={() => {
									handleDownloadAttachment(attachmentFile?.attachment);
								}}
								className="attachment-fileList-file-thumbnail-icon"
							/>
						</div>
					</div>
				</>
			);
		});
	return (
		<>
			{attachmentList?.length > 0 && (
				<div className="attachment">
					<div className="attachment-file-label">
						{attachmentList[0]?.formTemplateFieldDatum.caption
							? attachmentList[0]?.formTemplateFieldDatum.caption
							: 'Attachment'}
						:
					</div>
					<div className="attachment-fileList">{renderAttachment}</div>
				</div>
			)}
		</>
	);
};