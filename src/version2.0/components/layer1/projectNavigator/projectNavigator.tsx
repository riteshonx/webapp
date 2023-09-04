import React, { useEffect, useState } from 'react';
import NavigatorImage from 'src/version2.0/assets/images/navigator.png'
import './projectNavigator.scss'

export const ProjectNavigator = (props: any): React.ReactElement => {
  const [size, setSize] = useState(400)
  const [angle, setAngle] = useState(0)
  const [rotate, setRotate] = useState(0)
  const [elementList, setElementList] = useState([] as Array<any>)
  useEffect(() => {
    setSize(props.size || 400)
    const eleList = props.elementList || []
    setAngle(360 / (eleList.length || 1))
    setElementList(eleList)
    setRotate(props.rotate || 0)
  }, [props])
  return (
    <div className="v2-project-navigator"
      style={{ height: `${size}px`, width: `${size}px` }}
    >
      <img className='v2-project-navigator-bg' src={NavigatorImage} alt="NavigatorImage" />
      <div className="v2-project-navigator-cover">
        <div className="v2-project-navigator-container" style={{ transform: `rotate(${rotate}deg)` }}>
          {
            elementList.map((e, index) =>
              <div
                className='v2-project-navigator-element'
                key={index} style={{
                  top: (size / 2) * (1 - Math.cos(Math.PI * (angle * index) / 180)) + 'px',
                  left: (size / 2) * (1 - Math.sin(Math.PI * (angle * index) / 180)) + 'px',
                }} >
                <div style={{transform: `rotate(${-rotate}deg)`}} >{e}</div>
              </div>)
          }
        </div>
      </div>
    </div>
  );
};
