import React, { useState, useEffect } from 'react';
import axios from 'axios';

const dataAnalysisURL = "http://localhost:7005/data_analysis"


function TableComponent() {
  const [data, setData] = useState([]);
  const [data_anal, setDataAnal] = useState([]);

  useEffect(() => {
    // Make a GET request to the backend to retrieve data
    axios.get(dataAnalysisURL)
      .then(response => {
        setData(response.data.query_res);
        console.log("RECEIVED DATA: " + response.data.query_res)
            let data_analysis = []
            let temp_array = []
            for (let hours = 0; hours <= 23; hours++) {
                for (let minutes = 0; minutes < 60; minutes += 15) {
                    let ts = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
                    temp_array = [ts]
                    for(let i = 0 ; i < data.length ; ++i)
                    {
                        if(data[i]["time_slot"] === ts)
                        {
                            if(data[i]["total_freq"] !== 0)
                            {
                                temp_array.push(data[i]["present_freq"]/ data[i]["total_freq"])
                                console.log("DATA FOUND: " + data[i]["present_freq"]/ data[i]["total_freq"])
                            }   

                            else
                            {
                                temp_array.push("N/A")
                                console.log("DATA FOUND: N/A")
                            }
                        }
                    }
                    data_analysis.push(temp_array)
                }
            }
            setDataAnal(data_analysis);
            // for(let i = 0 ; i  < data_anal.length ; ++i)
            // {
            //     console.log("Entry DA: " + data_anal[i])
            // }
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const daysOfWeek = ['Time Slots', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <table>
      <thead>
        <tr>
          {daysOfWeek.map(day => <th key={day}>{day}</th>)}
        </tr>
      </thead>
      <tbody>
        {data_anal.map((row, index) => (
          <tr key={index}>
            {row.map((item, index) => (
              <td key={index}><button>{item}</button></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableComponent;
