 import React, { Component } from 'react'
// import Window from '../components/Window'
// import PropTypes from 'prop-types'
// import { connect } from 'react-redux'
// import { actions as properties } from '../redux/properties'
// import { withRouter } from "react-router-dom";

// const EntityTypes = {
//   kUndefined: 0, // An undefined type
//   kEntity: 1, // An entity type.
//   kInsert: 2, // An insert object.
//   kLight: 3 // A light object.
// }

// const OdTvGeometryDataType = {
//   kUndefinied: 0, // Undefined geometry.
//   kPolyline: 1, // A polyline.
//   kCircle: 2, // A circle.
//   kCircleWedge: 3, // A circle wedge.
//   kCircularArc: 4, // A circular arc.
//   kEllipse: 5, // An ellipse.
//   kEllipticArc: 6, // An elliptical arc.
//   kPolygon: 7, // A polygon.
//   kText: 8, // Text.
//   kShell: 9, // A shell.
//   kSphere: 10, // A sphere.
//   kCylinder: 11, // A cylinder.
//   kSubInsert: 12, // An insert sub-entity.
//   kSubEntity: 13, // A sub-entity.
//   kNurbs: 14, // A NURBS curve.
//   kRasterImage: 15, // A raster image.
//   kInfiniteLine: 16, // An infinite line.
//   kMesh: 17, // A mesh.
//   kPointCloud: 18, // A point cloud.
//   kGrid: 19, // A grid.
//   kColoredShape: 20, // A colored shape.
//   kBox: 21, // A box.
//   kBrep: 22 // A boundary representation object.
// }

// const TypeNameBinding = {
//   0: "Undefined", // Undefined geometry.
//   1: "Polyline", // A polyline.
//   2: "Circle", // A circle.
//   3: "CircleWedge", // A circle wedge.
//   4: "CircularArc", // A circular arc.
//   5: "Ellipse", // An ellipse.
//   6: "EllipticArc", // An elliptical arc.
//   7: "Polygon", // A polygon.
//   8: "Text", // Text.
//   9: "Shell", // A shell.
//   10: "Sphere", // A sphere.
//   11: "Cylinder", // A cylinder.
//   12: "SubInsert", // An insert sub-entity.
//   13: "kSubEntity", // A sub-entity.
//   14: "Nurbs", // A NURBS curve.
//   15: "RasterImage", // A raster image.
//   16: "InfiniteLine", // An infinite line.
//   17: "Mesh", // A mesh.
//   18: "PointCloud", // A point cloud.
//   19: "Grid", // A grid.
//   20: "ColoredShape", // A colored shape.
//   21: "Box", // A box.
//   22: "Brep" // A boundary representation object.
// }

// const iterators = {
//   "Model": { pointer: it => it.getModel() },
//   "Block": { pointer: it => it.getBlock().openObject() },
//   "Layers": { pointer: it => it.getLayer().openObject() },
//   "Materials": { pointer: it => it.getMaterial().openObject() },
//   "VisualStyles": { pointer: it => it.getVisualStyle().openObject() },
//   "TextStyles": { pointer: it => it.getTextStyle().openObject() },
//   "Devices": { pointer: it => it.getDevice() },
//   "RasterImages": { pointer: it => it.getRasterImage().openObject() },
//   "Linetype": { pointer: it => it.getLinetype().openObject() },
//   "GeometryData": {
//     pointer: it => {
//       const geomId = it.getGeometryData();
//       const type = geomId.getType();
//       if (type === OdTvGeometryDataType.kSubEntity) {
//         return geomId.openAsSubEntity();
//       } else {
//         return geomId
//       }
//     },
//     getName: pointer => {
//       if (pointer["getType"]) {
//         return TypeNameBinding[pointer.getType()]
//       } else if (pointer["getName"]) {
//         return `SubEntity ${pointer.getName()}`
//       }
//       return pointer.$$.ptrType.registeredClass.name;
//     }
//   },
//   "Entities": {
//     pointer: it => {
//       const entityId = it.getEntity();
//       if (entityId.getType() === EntityTypes.kEntity) {
//         return entityId.openObject();
//       } else if (entityId.getType() === EntityTypes.kInsert) {
//         return entityId.openObjectAsInsert();
//       } else {
//         return entityId.openObjectAsLight();
//       }
//     },
//     id: it => it.getEntity()
//   },
//   "CDATree": {
//     pointer: it => {
//       return it.getCDATreeStorage().getTree().getDatabaseNode();
//     },
//     getName: pointer => pointer.getNodeName(),
//     id: it => {
//       return null;
//     }
//   },
//   "children":{
//     pointer: it => {
//       return it.current()
//     },
//     getName: pointer => pointer.getNodeName(),
//     id: it=> it.current().getTvEntityId()
//   }

// }

// const ObjectExplorerContext = React.createContext('objectExplorer');

// class ObjectExplorer extends Component {

//   selectEntity = (id) => {
//     let file = this.props.file;
//     return Promise.resolve(file)
//     .then(file => file.getProperty(id))
//    // .then(result => dispatch({ type: TYPES.PROPERTIES_RESPONSE, payload: result }))
//     .catch(err => {
//     //  dispatch({ type: TYPES.PROPERTIES_ERROR, payload: err })
//     })
//   //  this.props.getProperties(this.props.file, id) // data
//   }

//   render() {

//     const viewer = this.props.viewer;

//     const CDA = true; // data;
//     return (
//       <Window className="object-explorer" title="Object Explorer" onClose={this.props.onClose}>
//         <ObjectExplorerContext.Provider value={this.selectEntity}>
//           {CDA?<CDATreeViewer viewer={viewer} visualizeJS={this.props.visualizeJS}/>: <OdNode pointer={viewer} visualizeJS={this.props.visualizeJS} viewer={viewer} />}
          
//         </ObjectExplorerContext.Provider>
//       </Window>
//     )
//   }
// }

// //export default ObjectExplorer;

// ObjectExplorer.propTypes = {
//   onClose: PropTypes.func
// }

// function CDATreeViewer(props) {
//   const viewer = props.viewer;
//   const itr = viewer.getCDATreeIterator();
//   return (<CDAStorage storage={itr.getCDATreeStorage()}  visualizeJS={props.visualizeJS}  viewer={viewer} />);
// }

// function CDAStorage (props) {

//   const { storage, viewer } = props;
//   const tree = storage.getTree();
//   const node = tree.getDatabaseNode();
//   node.enable = true;
//   node.parentEnabled = true;
//   const selectionSetObj = new props.visualizeJS.OdTvSelectionSet();
//   return (<CDANode node={node} viewer={viewer} visualizeJS={props.visualizeJS} selectionSetObj={selectionSetObj}  name={"CDA"}/>)
// }

// class CDANode extends Component {

//   static contextType = ObjectExplorerContext;
//   checked = true
//   listElement = [];
//  // selectionSetObj = null;
//   state = { show: false }

//   toggle = () => this.setState({ show: !this.state.show });

//   select = (node) => {
//     if (this.props.viewer && node.enable) {
//       this.props.viewer.setSelectedEntity(node.getTvEntityId(this.props.viewer.activeView));
      
//       if (this.context && node){
//         node.getUniqueSourceID && this.context(node.getUniqueSourceID());
//       }
//     } 
//   };

//   async setChecked(node) {
    
//     if(this.props.viewer && node.enable) {
//       node.enable =  false;
//       //node.parentEnabled = true;
      
//       document.getElementById(node.$$.ptr).src = "icons/hide.svg";

//       const childrens = node.getChildren();
//       await this.setSelectedHide(childrens, node);
//       this.props.viewer.setSelected(this.props.selectionSetObj);

//       this.props.viewer.hideSelectedObjects();

//     } else {
//       node.enable =  true;
//       const parent = node.getParents();


//       document.getElementById(node.$$.ptr).src = "icons/unisolate.svg ";

//       const childrens = node.getChildren();

//       this.props.viewer.unisolateSelectedObjects();
//       await this.setSelectedShow(childrens, node)
//       //let num = this.props.selectionSetObj.numItems();
//       this.props.viewer.setSelected(this.props.selectionSetObj);
//       this.props.viewer.hideSelectedObjects();

//     }
//   }

//   setSelectedHide(childrens, data) {
//     const length = childrens.length();
  
//     if(length > 0) {
//       for(let i = 0; i < length; i++) {
//       let node = childrens.get(i);
//       node.enable = data.enable ? true : false; 
//       node.parentEnabled = false; 
//       this.props.selectionSetObj.appendEntity(node.getTvEntityId(this.props.viewer.activeView));
//       // document.getElementById(node.$$.ptr).style.cursor = "not-allowed";
//       // document.getElementById(node.$$.ptr).src = "icons/hide.svg";
//       let nodeChild = node.getChildren();
//       if(nodeChild.length() > 0) {
//         this.setSelectedHide(nodeChild, node);
//       }
//       } 
//     }

//     if(length == 0) {
//       data.enable = data.enable ? true : false; 
  
//       this.props.selectionSetObj.appendEntity(data.getTvEntityId(this.props.viewer.activeView));
  
//      }
//   }

//   setSelectedShow(childrens, data) {
//     const length = childrens.length();
  
//    if(length > 0) {
//       for(let i = 0; i < length; i++) {
//       let node = childrens.get(i);
//       node.enable = data.enable ? true : false; 

//       this.props.selectionSetObj.removeEntity(node.getTvEntityId(this.props.viewer.activeView));

//       let nodeChild = node.getChildren();
//       if(nodeChild.length() > 0) {
//         this.setSelectedShow(nodeChild, node);
//       }
//       } 
//    }

//    if(length == 0) {
//     data.enable = data.enable ? true : false; 
//     this.props.selectionSetObj.removeEntity(data.getTvEntityId(this.props.viewer.activeView));

//    }
//   }

//   generateChildrens = (childrens, data) => {
//     const list = [];
//     const length = childrens.length();
//     for(let i = 0; i < length; i++) {
//       let node = childrens.get(i);
//       node.enable = !data.enable ? false : true; 
//       node.parentEnabled = data.parentEnabled && data.enable ?  true : false; 
//         list.push((
//           <li key={i} className="">
//             <CDANode node={node} viewer={this.props.viewer} selectionSetObj={this.props.selectionSetObj} visualizeJS={this.props.visualizeJS} />
//           </li>
         
//         ))
//       } 
    
//     return list;
//   }

//   generateAllChildrens = (childrens, data) => {
//     const list = [];
//     const length = childrens.length();
//     if(length > 0){
//     for(let i = 0; i < length; i++) {
//       let node = childrens.get(i);
//       node.enable = !data.enable ? false : true; 
//         list.push((
//           <li key={i} className="">
//             <CDANode node={node} viewer={this.props.viewer} selectionSetObj={this.props.selectionSetObj} visualizeJS={this.props.visualizeJS} />
//           </li>
         
//         ))
//         let nodeChild = node.getChildren();
//         if(nodeChild.length() > 0) {        
//           this.generateAllChildrens(nodeChild, node);
//         }
//       } 
//     }
    
//     return list;
//   }

//   render() {
//     const node = this.props.node;
//     const childrens = node.getChildren();
//     const childrensLen = childrens.length();
  
//     let name = this.props.name || node.getNodeName();
//     const show = this.state.show;
//     node.enable = node.enable ? true : false;
//    // node.parentEnabled = node.parentEnabled ? true : false;

//     if(name == "CDA") {
//     //  this.generateAllChildrens(childrens,node);
//     }
//     node.hasUI =  true;
//     if (name.length > 15) {
//       name =  name.substring(0, 15) + '...';
//     }

//     return (
//       <div  id={node.$$.ptr + node.$$.ptr}>
//         <div className="d-flex" style={{ position: "relative" }}>
//           { childrensLen > 0 ?
//               (<i onClick={this.toggle} className="material-icons objectExplorerList">{show ? "keyboard_arrow_down" : "keyboard_arrow_right"}</i>) : 
//               null
//           }
//           <span onClick={()=> this.select(node)} className="objectExplorerList">{name}</span> 
//              { name !== "CDA" ? <div style={{ float: "right" }} >
//                 {!node.enable ? 
//                   <img src="icons/hide.svg" className={ node.parentEnabled ? 'eyeIcons' : 'eyeIconsCursor'}
//                        onClick={() => this.setChecked(node)}
//                       id={node.$$.ptr}
//                       alt=""
//                       width="20" height="20" /> : 
                      
//                       <img src="icons/unisolate.svg" onClick={() => this.setChecked(node)}  className={ node.parentEnabled ? 'eyeIcons' : 'eyeIconsCursor'} id={node.$$.ptr} alt="" width="20" height="20" />} </div>  : null }
//         </div>
//         {show ? <ul>{this.generateChildrens(childrens, node)}</ul> : null}
//       </div>
//     )
//   }
// }

// class Iterator extends Component {
//   state = { count: 10, show: false };

//   static contextType = ObjectExplorerContext;

//   toggle = () => this.setState({ show: !this.state.show });
//   select = (id, pointer) => {

//     if (id && this.props.viewer) {
//       this.props.viewer.setSelectedEntity(id);

//       if (this.context && pointer){
//         pointer.getNativeDatabaseHandle && this.context(pointer.getNativeDatabaseHandle());
//         pointer.getUniqueSourceID && this.context(pointer.getUniqueSourceID());
        
//       }
//     }
//   };
//   result = [];

//   render() {
//     const type = this.props.type;
//     const itr = this.props.itr;


//     const show = this.state.show;
//     if (show) {
//       for (let i = 0; !itr.done() && i < 100; itr.step(), i++) {
//         const handler = iterators[type];
//         const pointer = handler ? handler.pointer(itr) : null;
//         let name = (pointer && pointer.getName) ? pointer.getName() : null;
//         if (!name && handler.getName) {
//           name = handler.getName(pointer)
//         }
//         if (!name) {
//           name = pointer.$$.ptrType.registeredClass.name;
//         }
//         // eslint-disable-next-line
//         const id = handler.id && handler.id(itr) || null;

//         if (name !== "$M_View_0_WCS_MODEL" && name !== "$FOR_EFFECT") {
//           this.result.push((<li key={pointer.$$.ptr}>
//             <OdNode pointer={pointer}
//               viewer={this.props.viewer}
//               onClick={() => this.select(id, pointer)}>{name}</OdNode>
//           </li>))
//         }
//       }
//     }

//     return (
//       <>
//         <div style={{ cursor: 'pointer', verticalAlign: "middle" }}>
//           <i onClick={this.toggle} className="material-icons">
//             {show ? "keyboard_arrow_down" : "keyboard_arrow_right"}
//           </i>
//           {type}
//         </div>
//         {show ? <ul>{this.result}</ul> : null}
//       </>
//     )
//   }
// }

// class CDAChildrenIterator {
//   constructor(pointer) {
//     this.pointer = pointer;
//     this.index = 0;
//   }
//   done(){
//     return !(this.index < this.pointer.length());
//   }
//   step(){
//     this.index++;
//   }
//   current() {
//     return this.done() ? null : this.pointer.get(this.index)
//   }
// }

// class OdNode extends Component {

//   state = { show: false }
//   toggle = () => this.setState({ show: !this.state.show });

//   render() {
//     const pointer = this.props.pointer || null;
//     const showCDA = this.props.showCDA || false; // data
//     let name = this.props.children || null; // data
    
//     let list = null;
//     if (pointer) {
//       if (pointer.getChildren) {
//         const children = pointer.getChildren();
//         list = [(
//             <li key={0}>
//               <Iterator itr={new CDAChildrenIterator(children)} type={"children"} viewer={this.props.viewer} />
//             </li>
//           )];

//       } else {
//         list = Object.keys(pointer.__proto__);
//         if(!showCDA) {
//           list = list.filter(key => key !== "getCDATreeIterator");
//         }
//         list = list.filter(key => /get\w+Iterator/ig.test(key));
//         list = list.map((funcName, index) => {
//           const regex = /get(\w+)Iterator/ig;
//           const match = regex.exec(funcName);
//           const name = match ? match[1] : null;
//           return (
//             <li key={index}>
//               <Iterator itr={pointer[funcName]()} type={name} viewer={this.props.viewer} />
//             </li>
//           );
//         });
//       }
//     }
//     const show = this.state.show;

//     return (
//       <div style={{ cursor: "pointer" }}>
//         <div className="d-flex">
//           {(list && list.length && name && name.length !== 0) ?
//             (<i onClick={this.toggle} className="material-icons">
//               {show ? "keyboard_arrow_down" : "keyboard_arrow_right"}</i>) :
//             null}
//           <span onClick={this.props.onClick}>{name}</span>
//         </div>
//         {(show || !name) ? <ul>{list}</ul> : null}
//       </div>
//     )
//   }
// }

// export default ObjectExplorer;
// // (
// //   state => state.objectTree,
// //   dispatch => ({
// //     getProperties: (file, entity) => dispatch(properties.getProperties(file, entity))
// //   })
// // )(withRouter(ObjectExplorer));

