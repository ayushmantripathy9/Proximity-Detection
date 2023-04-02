import React from "react";
function ListItem(props) {
    const buttonStyle = {
      fontSize: '18px',
      padding: '6px 20px',
      borderRadius: '8px',
      backgroundColor: 'orange',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
    };
  
    return (
        <div>

            <button
                style={buttonStyle}
            >
                {props.text} 

            </button>
            <br /> <br/>
        </div>
       
    );
  }

  export default ListItem;