import React, { ReactElement, useEffect, useState } from "react";
import { Form, Attachment } from '../../../models/insights'
import { postApi } from "src/services/api";
import { CloudDownload } from "@material-ui/icons";
import './Attachments.scss'

function Attachments({ form }: { form: Form }): ReactElement {
  const [urls, setUrls] = useState([] as Array<string>)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const temp: any = [];
    setLoading(true)
    form.attachments.forEach((attachment: Attachment) => {
      if (attachment.fileType.includes('image')) {
        temp.push({
          key: attachment.blobKey,
          fileName: attachment.fileName,
          expiresIn: 100,
        })
      }
    })
    fetchImageUrl(temp)
  }, [])

  const fetchImageUrl = async (attachment: any) => {
    try {
      const response = await postApi("V1/S3/downloadLink", attachment);
      if (response.success) {
        const temp: Array<string> = []
        response.success.forEach((image: any) => {
          temp.push(image.url)
        })
        setUrls(temp)
      }
      setLoading(false)

    } catch (error) {
      setLoading(false)
    }
  }
  const downloadAttachment = (url: string) => {
    window.open(url, "_parent");
  }
  return (
    <div className="lessons-learned-attachments">
      <h5>Attachments</h5>
      {loading ? <div className="lessons-learned-attachments__loader"></div> :
          <div className="lessons-learned-attachments__container">
            {urls.map(url => {
              return (
                <div className="lessons-learned-attachments__cover">
                  <img src={url} ></img>
                  <div className="lessons-learned-attachments__mask">
                    <CloudDownload
                      onClick={() => downloadAttachment(url)}
                      className="lessons-learned-attachments__mask__icon"
                    />
                  </div>
                </div>
              )
            })}
          </div>
      }
    </div>
  )
}

export default Attachments
