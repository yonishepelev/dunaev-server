const https = require('https')
const axios = require('axios');
const fs = require("fs");

const dataServer = 'https://corp.lovisnami.ru:39876'

const httpsAgent = new https.Agent({
    ca: fs.readFileSync("data/keys/cs_auth/root.pem"),
    cert: fs.readFileSync("data//keys/cs_auth/dunaev-server.crt"),
    key: fs.readFileSync("data/keys/cs_auth/dunaev-server.key")
});

console.log('test2');
const getReport = async (dateFrom, dateTo) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom) === false)
        return false;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo) === false)
        return false;
    const url = `${dataServer}/site2/public/api/dunaev/settlement?date_from=${dateFrom}&date_to=${dateTo}`;
    const options = {
        url,
        method: 'GET',
        httpsAgent
    }
    const {data} = await axios(options);
    return data.data;
};
const getDoc = async (doc_type_id, doc_id) => {

    if ([14, 17].includes(parseInt(doc_type_id)) === false)
        return false;

    const url = `${dataServer}/site2/public/api/dunaev/get_doc/doc_type_${doc_type_id}/doc_${doc_id}`;
    const options = {
        url,
        method: 'GET',
        httpsAgent
    }
    const {data} = await axios(options);
    return data.data;
}

exports.getReport = getReport;
exports.getDoc = getDoc;


