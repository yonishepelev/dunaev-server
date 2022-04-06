const crypto = require('crypto');
const {Users} = require("../data/users");
const fs = require("fs");

const SALT = process.env.SALT;
const SESSIONS_FILE_DIR = './data/sessions/';
const createAuthSession = (user_name) => {

}
exports.Auth = function (user_name, password) {
    const shaSum = crypto.createHash('sha1');
    const saltedPassword = password + SALT;
    const currentHash = shaSum.update(saltedPassword).digest('hex');
    if (currentHash !== Users.get(user_name))
        return false;

    const id = crypto.randomBytes(20).toString('hex');
    const data = {
        timestamp: Date.now(),
        user_name
    }
    const file_name = SESSIONS_FILE_DIR + '/' + id;
    //console.log(fs.readdirSync( SESSIONS_FILE_DIR ));
    fs.writeFileSync(
        file_name,
        JSON.stringify(data), {flag: 'wx'}
    )
    return id;


}

