import React, { Component } from 'react';
// import PropTypes from 'prop-types';

// class Window extends Component {

//   ref = React.createRef();
//   close = () => {
//     if (this.props.onClose) {
//       this.props.onClose();
//     }
//   }

//   componentDidMount() {
//     const { resizable } = this.props;
//     let resizableVar = resizable === undefined ? true : resizable;
//     const $ = window["$"];
//     if (resizableVar) {
//       $(this.ref.current).resizable();
//     }
    
//     $(this.ref.current).draggable({
//       handle: '.ui-draggable-handle',
//       cursor: 'move',
//       containment: 'window'
//     });
//   }

//   render() {
//     const { className, style } = this.props;
//     return (
//       <div ref={this.ref} className={"window-dialog card ui-resizable ui-draggable " + (className ? className : "")} style={style}>
//         <div className="ui-draggable-handle card-header window-dialog-head">
//           {this.props.title}
//           <button type="button" className="close btn-close" data-dismiss="modal" aria-hidden="true" onClick={this.close}>×</button>
//         </div>
//         <div className="card-body overflow-auto" style={{padding: "5px"}}>
//           {this.props.children}
//         </div>
//         <div className="ui-resizable-e ui-resizable-handle"></div>
//         <div className="ui-resizable-s ui-resizable-handle"></div>
//       </div>
//     )
//   }
// }

// Window.propTypes = {
//   title: PropTypes.string.isRequired,
//   onClose: PropTypes.func
// }

// export default Window;
