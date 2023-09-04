import React, { useState } from 'react'

interface PhaseItem {
  name: string,
  id: string,
  children: Array<PhaseItem>
}
const PHASE_LIST = [
  {
    name: 'Phase-1',
    id: 'p1',
    children: [
      {
        name: 'Phase-2',
        id: 'p2',
        children: []
      }
    ]
  },
  {
    name: 'Phase-3',
    id: 'p3',
    children: []
  }
] as Array<PhaseItem>

export const Phase = (props: any): React.ReactElement => {
  const [checkedPhaseItem, setCheckedPhaseItem] = useState([] as Array<string>)
  const { onCancel } = props

  const toggleCheckedPhaseItem = (phaseItem: PhaseItem) => {
    const id = phaseItem.id
    const index = checkedPhaseItem.indexOf(id)
    if (index === -1) {
      setCheckedPhaseItem([...checkedPhaseItem, id])
    } else {
      checkedPhaseItem.splice(index, 1)
      setCheckedPhaseItem([...checkedPhaseItem])
    }
  }


  const getPhaseList = (phaseList: Array<PhaseItem>) => {
    return phaseList.map((item: PhaseItem) => {
      return <div className="v2-header-phase-item">
        <div
          className="s-v-center s-pointer"
          onClick={() => toggleCheckedPhaseItem(item)}>
          <div
            className={`v2-header-phase-item-checkbox ${checkedPhaseItem.includes(item.id) ? 'selected' : ''
              }`}></div>
          <div className="row">{item.name}</div>
        </div>
        {item.children?.length ? getPhaseList(item.children) : <></>}
      </div>
    })
  }


  return <div className="v2-header-phase">
    <div className="v2-header-phase-header">
      Phases
    </div>
    <div className="v2-header-phase-label">
      Please select the current Project Phase
    </div>
    {getPhaseList(PHASE_LIST)}
    <div className="v2-header-phase-action s-v-center">
      <button className='v2-header-phase-action-save' >Ok</button>
      <button
        onClick={onCancel}
        className='v2-header-phase-action-cancel'>
        Cancel
      </button>
    </div>
  </div>
}
