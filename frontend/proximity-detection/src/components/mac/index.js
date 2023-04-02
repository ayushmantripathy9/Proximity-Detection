import React, { useState } from 'react';
import UserInput from './user_input';
import DeviceList from './device_list';

function Mac() {
  const [data, setData] = useState([]);

  const handleChildSubmit = (newData) => {
    setData([...data, newData]);
  };


  return (
    <div>
      <h1>Welcome to my MAC Addresses Page!</h1>
      {<UserInput onSubmit={handleChildSubmit}/>}
      <br />

      {<DeviceList />}
    </div>
  );
}

export default Mac;
