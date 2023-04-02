import React, { useState, useEffect } from 'react';
import axios from 'axios';

const dataAnalysisURL = "http://localhost:7005/data_analysis"

function TableComponent() {
  // const [data, setData] = useState([]);
  const [data_anal, setDataAnal] = useState([]);

  useEffect(() => {
    // Make a GET request to the backend to retrieve data
    axios.get(dataAnalysisURL)
      .then(response => {
        let data = response.data.query_res
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
                            var val = data[i]["present_freq"]/ data[i]["total_freq"]
                            temp_array.push(parseFloat(val.toFixed(2)))
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
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const daysOfWeek = ['Slots', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
            {row.map((item, index) => {
              if(item === "N/A")
              {
                return(<td key={index}><button >{`${item}`}</button></td>)
              }
              else if(item > 0.75)
              {
                return(<td key={index}><button style={{backgroundColor:"green"}}>{`${item}`}</button></td>)

              }
              else if(item > 0.25)
              {
                return(<td key={index}><button style={{backgroundColor:"yellow"}}>{`${item}`}</button></td>)

              }
              else if(item >= 0)
              {
                return(<td key={index}><button style={{backgroundColor:"red"}}>{`${item}`}</button></td>)
              }
              else
              {
                return(<td key={index}><button style={{backgroundColor:"#282828", color:"white"}}>{`${item}`}</button></td>)

              }
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableComponent;
