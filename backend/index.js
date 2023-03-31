require('dotenv').config()
const env = process.env

const express = require("express");
const mysql = require("mysql")
const app = express()

const body_parser = require('body-parser')
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json());

// const cjson = require('circular-json') // for debugging purposes

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

app.post('/current_status', (req, res) => {
    var req_datetime =  moment().format("YYYY-MM-DD HH:mm:ss")
    console.log("DATETIME: " + req_datetime)
    
    console.log("Received POST Request for current status. Payload: " + req.body.is_present)
    
    // const received_req = cjson.stringify(req)                // for debugging purposes
    // console.log("RECEIVED REQUEST: " + received_req) 
    
    // var valueOfDevice = req.headers['data'] == "1" ? 1 : 0   // alternate method

    var success = true

    db.query(

        "UPDATE user_detected SET is_present=? WHERE time_stamp='2001-01-01 00:00:00'",
        req.body.is_present, 

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
    
    if(success)
    {
        db.query(

            "INSERT INTO user_detected(time_stamp, is_present) VALUES(?,?)",
            [req_datetime, req.body.is_present],
            
            (err, result) => {
                if(err)
                {
                    success = false
                    console.log("Error in inserting Record.\nERROR: " + err)
                    res.send({
                        erorr: err,
                        message: "Values couldn't be inserted into the Database. Try Again."
                    })
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
})
