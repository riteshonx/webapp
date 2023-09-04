import React from 'react'
import { AutoLinkCard, AutoLinkDetailCard } from 'src/version2.0_temp/components/autoLink'
import './AutoLink.scss'

export const AutoLink = ():React.ReactElement => {
  return <div className="v2-auto-link">
    <div className="v2-auto-link-recommendation">
      <h2>Suggested Links</h2>
      {
        new Array(5).fill(0).map((item, index) =>
          <AutoLinkCard selected={index === 1} />)
      }
    </div>
    <div className="v2-auto-link-suggested-link">
      <h2>Details</h2>
      <AutoLinkDetailCard />
    </div>
  </div>
}
