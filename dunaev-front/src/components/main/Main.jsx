import React, {useEffect, useState} from "react";
import {Container} from "react-bootstrap";


import {Login} from "../login/Login";
import {isLoggedIn} from "../../lib/api";

import {ReportMain} from "../reportMain/ReportMain";
import {Doc} from "../doc/Doc";

const url = new URL(window.location.href);


export const Main = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        isLoggedIn().then((r) => {
            setLoggedIn(r);
        });
    }, []);
    if (!loggedIn)
        return (
            <Container>
                <Login/>
            </Container>
        )
    else {
        if (url.pathname === '/')
            return (
                <Container>
                    <ReportMain/>
                </Container>
            )
        else if (url.pathname === '/get_doc')
            return (
                <Container>
                    <Doc/>
                </Container>
            )
        else
            return (
                <Container>
                    Адрес неверный
                </Container>
            )
    }


}
