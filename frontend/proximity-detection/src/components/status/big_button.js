import React from "react";
function BigButton(props) {
    const buttonStyle = {
      fontSize: '24px',
      padding: '16px 32px',
      borderRadius: '8px',
      backgroundColor: props.color,
      color: 'white',
      border: 'none',
      cursor: 'pointer',
    };
  
    return (
      <button
        style={buttonStyle}
      >
        {props.color==='green' ? `DEVICE IN RANGE` : `DEVICE OUT OF RANGE`}
      </button>
    );
  }

  export default BigButton;