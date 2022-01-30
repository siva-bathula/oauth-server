const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const oAuth = require('./services/oauth');
const InvalidArgumentError = require('./errors/invalid-argument-error');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.post('/login', (req, res) => {
    oAuth.authenticate(req, res).then((success) => {
        console.log('Login Success: ' + success);
    }).catch((err) => {
        if(err instanceof InvalidArgumentError) {
            res.status(err.properties.code).send(err.properties.message);
        } else {
            res.status(500).send("Failed to login.");
            console.log(err);
        }
    })
});

app.post('/authorize', (req, res) => {
    oAuth.authorize(req, res).then((success) => {
        console.log('Authorize success: ' + success);
    }).catch((err) => {
        if(err instanceof InvalidArgumentError) {
            res.status(err.properties.code).send(err.properties.message);
        } else {
            res.status(500).send("Failed to authorize.");
            console.log(err);
        }
    })
});

const port = parseInt(process.env.PORT) || 32223;
app.listen(port, err => {
    if(err) return console.log("Error", err);
    console.log('Server is listening on', port);
});