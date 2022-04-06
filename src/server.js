const express = require('express')
const app = express()
const port = 4000;
const cors = require('cors')
const {json} = require("express");
const {Auth} = require("./Auth");

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
app.options('*', cors());
app.use(json());
app.post('/api/auth', cors(corsOptionsDelegate), (req, res) => {
    const {user_name, password} = req.body;
    if (!user_name || !password){
        res.status(404).json({error: 1, description: 'Не достаточно данных'});
    }


    const session_token = Auth(user_name , password);
    res.json({
        error: 0,
        session_token
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
