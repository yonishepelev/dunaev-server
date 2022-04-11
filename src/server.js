const express = require('express')
const app = express()
const port = 4000;
const sslPort = 4443;
const {json} = require("express");
const {Auth} = require("./Auth");
const {getReport, getDoc} = require("./CS_Api");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");


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

app.use(json());
app.use(express.static(path.resolve(__dirname, '../dunaev-front/build')));


app.use((req, res, next) => {
    let token = null;
    if (req.headers['authorization'])
        [_, token] = req.headers['authorization'].split(" ");


    req.token = token;
    next();
});
app.post('/api/auth', (req, res) => {
    const {user_name, password} = req.body;
    if (!user_name || !password) {
        res.status(404).json({error: 1, description: 'Не достаточно данных'});
    }


    const session_data = Auth.authentication(user_name, password);
    responseSessionData(session_data, res);

});
app.post('/api/auth/logout', (req, res) => {
    if (req.token)
        Auth.logout(req.token);
    responseSessionData({token: req.token}, res);
});

app.get('/api/get-report', (req, res) => {
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
app.get('/api/get-doc', (req, res) => {
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
const front_handler = (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dunaev-front/build', 'index.html'));
}
app.get('/', front_handler);
app.get('/get_doc', front_handler);

app.post('/api/auth/refresh', (req, res) => {
    const {token, refresh_token} = req.body;

    if (!token || !refresh_token) {
        res.status(404).json({error: 1, description: 'Не достаточно данных'});
    }
    const session_data = Auth.refreshToken(token, refresh_token);
    responseSessionData(session_data, res);
})

const privateKey = fs.readFileSync('ssl/__lovisnami_ru.key', 'utf8');
const certificate = fs.readFileSync('ssl/__lovisnami_ru.full.crt', 'utf8');

const credentials = {key: privateKey, cert: certificate};
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(port, () => {
    console.log('Dunaev app listen port ' + port);
})
httpsServer.listen(sslPort, () => {
    console.log('Dunaev app listen port ' + sslPort);
})

process.on('SIGTERM', () => {
    httpServer.close(() => {
        console.log('Http server closed.');
    });
    httpsServer.close(() => {
        console.log('Https server closed.');
    });
    console.info('SIGTERM signal received.');
})
