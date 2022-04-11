const express = require('express')
const app = express()
const port = 4000;
const cors = require('cors')
const {json} = require("express");
const {Auth} = require("./Auth");
const {getReport, getDoc} = require("./CS_Api");

const allowList = ['http://localhost:3000'];
const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (allowList.indexOf(req.header('Origin')) !== -1) {
        corsOptions = {origin: true} // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = {origin: false} // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}
const responseSessionData = (session_data, res) => {
    if (!session_data) {
        res.status(403).json({
            error: 1,

        });
    } else
        res.json({
            error: 0,
            session_data
        });
}
app.options('*', cors());
app.use(json());

app.use((req, res, next) => {
    let token = null;
    if (req.headers['authorization'])
        [_, token] = req.headers['authorization'].split(" ");


    req.token = token;
    next();
});
app.post('/api/auth', cors(corsOptionsDelegate), (req, res) => {
    const {user_name, password} = req.body;
    if (!user_name || !password) {
        res.status(404).json({error: 1, description: 'Не достаточно данных'});
    }


    const session_data = Auth.authentication(user_name, password);
    responseSessionData(session_data, res);

});
app.post('/api/auth/logout', cors(corsOptionsDelegate), (req, res) => {
    if (req.token)
        Auth.logout(req.token);
    responseSessionData({token: req.token}, res);
});

app.get('/api/get-report', cors(corsOptionsDelegate), (req, res) => {
    if (!req.token)
        responseSessionData(null, res);
    const {date_from: dateFrom, date_to: dateTo} = req.query;
    getReport(dateFrom, dateTo).then(data => {
        res.json({
            error: 0,
            data
        })
    })
})
app.get('/api/get-doc', cors(corsOptionsDelegate), (req, res) => {
    if (!req.token)
        responseSessionData(null, res);
    const {doc_type_id, doc_id} = req.query;
    getDoc(doc_type_id, doc_id).then(data => {
        if (data)
            res.json({
                error: 0,
                data
            })
        else
            res.status(400).json({
                error: 1,
            });
    })
})

app.post('/api/auth/refresh', cors(corsOptionsDelegate), (req, res) => {
    const {token, refresh_token} = req.body;

    if (!token || !refresh_token) {
        res.status(404).json({error: 1, description: 'Не достаточно данных'});
    }
    const session_data = Auth.refreshToken(token, refresh_token);
    responseSessionData(session_data, res);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
