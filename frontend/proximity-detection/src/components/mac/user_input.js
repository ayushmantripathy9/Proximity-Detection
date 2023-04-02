import React, { useState } from 'react';
import axios from 'axios';

const postDataURL = "http://localhost:7005/update_mac_list"

function UserInput(props) {
  const [inputValue, setInputValue] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if(inputValue !== "")
    {
        axios.post(postDataURL, { entered_id: inputValue })
        .then(response => {
            console.log('Data sent successfully! Response: ' + response );
            props.onSubmit(inputValue);
            setInputValue('');
        })
        .catch(error => {
            console.error('Error sending data:', error);
        });
    }
  }

  function handleInputChange(event) {
    setInputValue(event.target.value);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Enter the identity of the device that needs to be monitored:&nbsp; &nbsp;
          <input type="text" value={inputValue} onChange={handleInputChange} />
        </label>
        <button type="submit" style={{ backgroundColor: 'green' }}> &nbsp;Start Monitoring&nbsp;</button>
      </form>
    </div>
  );
}

export default UserInput;