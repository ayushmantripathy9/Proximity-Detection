import React, { useState, useEffect } from 'react';
import axios from 'axios';

import BigButton from './big_button';

const geStatusURL = "http://localhost:7005/current_status"

function Status() {
    const [data, setData] = useState([]);
    useEffect(() => {
        axios.get(geStatusURL)
          .then(response => {
            console.log(response.data)
            setData(response.data);
          })
          .catch(error => {
            console.log(error);
          });
      }, []);

    return (
        <div>
        <h1>Welcome to my Device Status Page!</h1>
        The Current Status of the Device is {data.is_present ? `PRESENT` : `ABSENT`}
        <br /><br />
        {data.is_present ? <BigButton color='green'/> : <BigButton color='red'/>}
        
        </div>
    );
}

export default Status;
