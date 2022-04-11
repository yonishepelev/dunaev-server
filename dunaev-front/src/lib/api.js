import Cookies from "universal-cookie";

const server = '';
const COOKIE_NAME = '2dk2dzf';
// noinspection JSValidateTypes
const cookies = new Cookies();
const getToken = async function () {
    if (await isLoggedIn()) {
        const session_data = cookies.get(COOKIE_NAME);
        if (!session_data)
            return false;
        const {token} = session_data;
        return token;
    }
}
const setAuthCookie = (session_data)=>{
    const {rt_valid_till} = session_data;
    const expires = new Date(rt_valid_till)
    cookies.set(COOKIE_NAME, JSON.stringify(session_data), {path: '/',
        expires, sameSite: 'strict' });
}

export const getData = async function ([dateFrom, dateTo]) {

    dateFrom = dateFrom.toLocaleDateString().split(".").reverse().join("-");
    dateTo = dateTo.toLocaleDateString().split(".").reverse().join("-");
    const token = await getToken();
    if (!token)
        window.location.reload();
    let url = server + '/api/get-report?'
    url += new URLSearchParams({
        date_from: dateFrom,
        date_to: dateTo
    })
    const resp = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'AccessToken ' + token
        },
    });
    return await resp.json();
}
export const getDoc = async function (doc_type_id, doc_id) {
    const token = await getToken();
    if (!token)
        window.location.reload();
    let url = server + '/api/get-doc?'
    url += new URLSearchParams({
        doc_type_id ,
        doc_id
    });
    const resp = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'AccessToken ' + token
        },
    });
    return await resp.json();
}

const refreshToken = async function (token, refresh_token) {
    const resp = await fetch(server + '/api/auth/refresh', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'AccessToken ' + token
        },
        body: JSON.stringify({token, refresh_token})

    });
    const data = await resp.json();
    return data;
}
export const isLoggedIn = async function () {
    const session_data = cookies.get(COOKIE_NAME);
    if (!session_data)
        return false;
    const {valid_till, rt_valid_till, token, refresh_token} = session_data;
    if (Date.now() < valid_till)
        return true;
    cookies.remove(COOKIE_NAME);
    if (Date.now() < rt_valid_till) {

        const data = await refreshToken(token, refresh_token);
        const {error, session_data} = data;
        if (error === 0 && session_data) {
            setAuthCookie(data['session_data']);
            return true;
        }
        return false;
    }
    return false;


}
export const auth = async function ([password, user_name]) {

    const resp = await fetch(server + '/api/auth', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({password, user_name})

    });
    const data = await resp.json();
    if (data && data.error === 0) {
        setAuthCookie(data['session_data']);
    }


    return data;

}
export const logout = async function () {
    const {token} = cookies.get(COOKIE_NAME);
    const resp = await fetch(server + '/api/auth/logout', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'AccessToken ' + token
        }
    });
    const data = await resp.json();
    if (data && data.error === 0) {
        cookies.remove(COOKIE_NAME);
        window.location.reload();
    }

}
