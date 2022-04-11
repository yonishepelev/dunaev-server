import {DatesSelection} from "../datesSelection/DatesSelection";
import React, {useEffect, useState} from "react";
import {Container, Navbar, Nav} from "react-bootstrap";
import {getData, logout} from "../../lib/api";
import {ReportTable} from "../reportTable/ReportTable";

export const ReportMain = () => {
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        document.title = 'Доступ к взаиморасчетам ТД Дунаев';
    }, []);
    const logOut = (e)=>{
        e.preventDefault();
        logout().then(()=>false);
        return false;

    }
    return <div>
        <Navbar bg="light">
            <Container>
                <Navbar.Brand>Просмотр взаиморасчетов ТД Дунаев</Navbar.Brand>
                <Nav.Link onClick={logOut} href="#link">Выйти</Nav.Link>
            </Container>
        </Navbar>
        <DatesSelection onSubmit={(dateRange)=>{
            getData(dateRange).then(({error, data})=>{
                if (error === 0)
                    setReportData(data);
            })
        } }/>
        <ReportTable data={reportData}/>
    </div>
}
