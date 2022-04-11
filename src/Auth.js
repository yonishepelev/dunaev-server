'use strict'
require('dotenv').config();
const crypto = require('crypto');
const {Users} = require("../data/users");
const fs = require("fs");

const SALT = process.env.SALT;


const TOKEN_VALID_TIME = 3 * 60 * 1000; //3 minute
const REFRESH_TOKEN_VALID_TIME = 7 * 24 * 60 * 60 * 1000; //7 days
const SESSIONS_FILE_DIR = './data/sessions/';
const createSessionFileName = (token)=> SESSIONS_FILE_DIR + '/' + token+'.json';
const createAuthSession = (data, token) => {
    const file_name = createSessionFileName(token)
    fs.writeFileSync(
        file_name,
        JSON.stringify(data), {flag: 'wx'}
    )
}
const deleteAuthSession = (token)=>{
    const file_name = createSessionFileName(token);
    if (fs.existsSync(file_name))
        fs.unlinkSync(file_name);

}
const createHash = () => {
    return crypto.randomBytes(20).toString('hex');
}
const getAuthSession = (token) => {
    const file_name = createSessionFileName(token)
    if (!fs.existsSync(file_name))
        return false;
    const data = fs.readFileSync(file_name, 'utf-8');
    return JSON.parse(data);
}
const createSessionData = (user_name)=>{
    const token = createHash()
    const refresh_token = createHash();
    const timestamp = Date.now();
    return {
        timestamp,
        valid_till: timestamp + TOKEN_VALID_TIME,
        user_name,
        refresh_token,
        rt_valid_till: timestamp + REFRESH_TOKEN_VALID_TIME,
        token
    }
}

class Auth {
    authentication(user_name, password) {
        const shaSum = crypto.createHash('sha1');
        const saltedPassword = password + SALT;

        const currentHash = shaSum.update(saltedPassword).digest('hex');
        if (currentHash !== Users.get(user_name))
            return false;
        const data = createSessionData(user_name);

        createAuthSession(data, data.token);

        return data;
    }

    refreshToken(token, refresh_token) {
        const data = getAuthSession(token);

        if (!data)
            return false;
        const {rt_valid_till, refresh_token: old_refresh_token, user_name} = data;

        if (old_refresh_token !== refresh_token || rt_valid_till < Date.now()) {
            deleteAuthSession(token);
            return false;
        }
        deleteAuthSession(token);

        const newData = createSessionData(user_name);
        newData['token'] = token;
        createAuthSession(newData, token);

        return newData;



    }
    logout(token){
        deleteAuthSession(token);
        return true;
    }

}

exports.Auth = new Auth();

