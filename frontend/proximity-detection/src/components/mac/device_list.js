import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListItem from './list_item';

const getDeviceListURL = "http://localhost:7005/ble_mac"


function DeviceList() {
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
        THE FOLLOWING ARE THE IDENTITIES OF DEVICES BEING MONITORED:
        <br /><br />
      {list.map((item) => (
        <ListItem text={item}/> 
      ))}

    </div>
  );
}


export default DeviceList;