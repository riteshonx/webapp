import { ReactElement } from "react"
import { useHistory } from "react-router-dom"
import RightArrowIcon from "../icons/RightArrowIcon"
import "./modularSubstationCard.scss"
import { ICDP } from '../../models';


function ModularSubstationCard({cdpObj}: {cdpObj: ICDP} ): ReactElement {
  const history = useHistory()
  const goToModularSubstation = () => {
    history.push(`/generator/modular-substation/${cdpObj.id}`)
  }
  return (
    <div className="modular-substation-card">
      <div className="modular-substation-card_title">
        {cdpObj.cdpTypeName || ''}
        <p>0 Configurations </p>
      </div>
      <div className="modular-substation-card_text">
        {cdpObj.cdpDescription || ''}
      </div>
      <div className="modular-substation-card_box" >
        <div className="modular-substation-card_box_left_icon" onClick={() => {
          goToModularSubstation()
        }} >
          <RightArrowIcon />
        </div>

        <div className="modular-substation-card_box_right_icon">
          {
            cdpObj.image ? <img src={cdpObj.image} ></img> : 'icon here'
          }
        </div>
      </div>
    </div>
  )

}

export default ModularSubstationCard
