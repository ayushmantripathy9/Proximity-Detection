import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Status from './status';
import Mac from './mac';
import Analysis from './analysis';
import Home from './home';

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li> 
          <li>
            <Link to="/device_status">Device Status</Link>
          </li>
          <li>
            <Link to="/monitored_devices">Monitored Devices</Link>
          </li>
          <li>
            <Link to="/data_analysis">Data Analysis</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/device_status" element={<Status />} />
        <Route path="/monitored_devices" element={<Mac />} />
        <Route path="/data_analysis" element={<Analysis />} />
      </Routes>
    </Router>
  );
}

export default App;
