require('dotenv').config()
const env = process.env

const express = require("express");
const mysql = require("mysql")
const app = express()
const cors = require("cors");

const body_parser = require('body-parser')
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json());
app.use(
    cors({
        origin: ["http://localhost:3000"],
        method: ["GET", "POST"],
        credentials: true,
    })
)

const cjson = require('circular-json') // for debugging purposes

const port = env.PORT

var moment = require('moment');

app.get('/',(req, res) => {
    res.send('You have reached the backend of Proximity Detection app...\nThe following paths are active: \n1. current_status\n2. ble_mac\n3. data_analysis')
})

app.listen(port, () => {
    console.log("App is listening on port: ", port)
})


const db = mysql.createConnection({
    user: env.MYSQL_USER,    
    host: env.MYSQL_HOST,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DB
})

app.get('/current_status', (req, res) => {
    db.query(

        "SELECT * FROM user_detected WHERE time_stamp='2001-01-01 00:00:00';",

        (err, result) => {
            if(err)
            {
                console.log("Values couldn't be read from the Database.\nERROR: " + err)
                res.send({
                    error: err,
                    message: "Request couldn't be granted."
                })
            }
            else
            {
                console.log("Values obtained from the Database successfully.\nRESULT: time_stamp: " + result[0]['time_stamp'] + ", value: " + result[0]['is_present'])
                res.status(200).send({
                    is_present: result[0]['is_present'],
                    message: "Request executed successfully."
                })
            }
        }
    )
})

app.post('/update_mac_list', (req, res) => {
    console.log("Received device identity: "  + req.body.entered_id)
    db.query(
        "INSERT INTO ble_mac_addresses(mac_address) values(?);",
        req.body.entered_id,
        (err, result) => {
            if(err)
            {
                console.log("Error occurred in insertion into DB. ERROR: " + err)
                res.send({
                    message: "Error in inserting value into DB."
                })
            }
            else
            {
                console.log("Identity entered into DB successfully. RESULT: "+ result)
                res.status(200).send({
                    message: "Successfully updated the DB by inserting new value."
                })
            }
        }
    )
})

app.post('/current_status', (req, res) => {
    var req_datetime =  moment().format("YYYY-MM-DD HH:mm:ss")
    const date_found = new Date(req_datetime)
    var dayOfWeek = date_found.getDay()
    var currTime = moment().format("HH:mm:ss")

    console.log("DATETIME: " + req_datetime)
    console.log("DAY OF WEEK: " + dayOfWeek + ", TIME TODAY: " + currTime)


    console.log("BODY OF POST REQUEST: ", JSON.stringify(req.body))

    console.log("Received POST Request for current status.\nPAYLOAD -> is_present: " + req.body["is_present"] + ", n_devices_found: " + req.body["n_devices_found"])
    console.log("ARRAY OF DEVICES: " + req.body["devices_found"])
    
    // const received_req = cjson.stringify(req)                // for debugging purposes
    // console.log("RECEIVED REQUEST: " + received_req) 
    // res.status(200).send({})

    var success = true

    db.query(

        "UPDATE user_detected SET is_present=? WHERE time_stamp='2001-01-01 00:00:00'",
        req.body["is_present"], 

        (err, result) => {
            if(err)
            {
                success = false
                console.log("Error in updating the current value of is_present.\nERROR: " + err)
                res.send({
                    erorr: err,
                    message: "Values couldn't be updated in the Database. Try Again."
                })

            }
            else
            {
                console.log("Value of Current Status successfully updated in the Database. Request Successful.\nRESULT: " + result)
            }
        }
    )

    console.log("Success Or Failure : " + success)
    
    if(success)
    {
        var valueToAdd = req.body["is_present"] ? 1 : 0

        db.query(

            "UPDATE data_analysis SET present_freq = present_freq + ? , total_freq = total_freq + 1 WHERE week_day = ? AND ? >= time_slot AND ? < time_slot_end;",
            [valueToAdd, dayOfWeek, currTime, currTime],
            
            (err, result) => {
                if(err)
                {
                    success = false
                    console.log("Error in inserting Record.\nERROR: " + err)
                }
                else
                {
                    console.log("Value of Record successfully inserted in the Database. Request Successful.\nRESULT: " + result)
                }
            }
        )
    }

    if(success)
    {
        res.status(200).send({
            message: "All The Values successfully updated in the Database."
        })
    }
    else
    {
        res.send({
            message: "Values couldn't be inserted into the Database. Try Again."
        })
    }
})


app.get("/ble_mac", (req, res) => {
    db.query(

        "SELECT mac_address FROM ble_mac_addresses",

        (err, result) => {
            if(err)
            {
                console.log("Values couldn't be read from the Database.\nERROR: " + err)
                res.send({
                    error: err,
                    message: "Request couldn't be granted."
                })
            }
            else
            {
                console.log("Values obtained from the Database successfully.\nRESULT: Devices Under Observation: " + result)
                var devicesOfInterest = [];
                for(let i = 0 ; i < result.length ; ++i)
                {
                    devicesOfInterest.push(result[i].mac_address)
                    console.log(devicesOfInterest[i])
                }
                
                res.status(200).send({
                    devices: devicesOfInterest,
                    message: "Request executed successfully."
                })
            }
        }
    )
})

