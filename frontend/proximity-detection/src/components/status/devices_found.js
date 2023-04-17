import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListItem from '../mac/list_item';

const getDeviceListURL = "http://localhost:7005/devices_found"


function DevicesFound() {
  const [list, setList] = useState([]);

  useEffect(() => {
    axios.get(getDeviceListURL)
      .then((response) => {
        console.log("Device list obtained: " + response.data.devices)
        setList(response.data.devices);
      })
      .catch((error) => {
        console.error('Error retrieving list:', error);
      });
  }, []);

  return (
    <div>
        THE FOLLOWING ARE THE IDENTITIES OF DEVICES THAT ARE IN RANGE:
        <br /><br />
      {list.map((item) => (
        <ListItem text={item}/> 
      ))}

    </div>
  );
}


export default DevicesFound;