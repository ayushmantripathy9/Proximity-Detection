const express = require("express");
const mysql = require("mysql")

const app = express()
const port = 3000

app.get('/',(req, res) => {
    res.send('You have reached the backend of Proximity Detection app...\nThe following paths are active: \n1. current_status\n2. ble_mac\n3. data_analysis')
})

app.listen(port, () => {
    console.log("Test app is listening on port: ", port)
})


const db = mysql.createConnection({
    user: "root",    
    host: "localhost",
    password: "",
    database: "proximity"
})

app.get('/current_status', (req, res) => {
    db.query(
        "SELECT * FROM user_detected WHERE time_stamp='2001-01-01 00:00:00';",
        (err, result) => {
            if(err)
            {
                console.log("Request couldn't be granted. ERROR: " + err)
                res.send({
                    err: err,
                    message: "Request couldn't be granted."
                })
            }
            else
            {
                console.log("Request executed successfully. RESULT: time_stamp: " + result[0]['time_stamp'] + "value: " + result[0]['is_present'])
                res.status(200).send({
                    is_present: result[0]['is_present'],
                    message: "Request executed successfully."
                })
            }
        }
    )
})