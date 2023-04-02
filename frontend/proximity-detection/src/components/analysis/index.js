import React from 'react';
import TableComponent from './table_component';

let containerStyle = {
  width: '100vw',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
}

function Analysis() {
  return (
    <div>
      <h2>Welcome to Data Analysis Page!</h2>
      <div style={containerStyle}>
        <TableComponent />
      </div>
    </div>
  );
}

export default Analysis;
