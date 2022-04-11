import {Button, Form, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import AirDatepicker from "air-datepicker";


export const DatesSelection = ({
                                   dateFromDefault,
                                   dateToDefault,
                                   onSubmit
                               }) => {

    const [dateRange, setDateRange] = useState([
        dateFromDefault ?  dateFromDefault : new Date(),
        dateToDefault ? dateToDefault : new Date()
    ]);

    const onChangeDates = (newDate, index) => {
        setDateRange((s) => {
            s[index] = newDate;
            return s;
        })
    }
    useEffect(() => {

        new AirDatepicker('#dateFrom', {
            selectedDates: [dateFromDefault? dateFromDefault : new Date()],
            autoClose: true,
            onSelect: ({date}) => {
                if (date)
                    onChangeDates(date, 0);
                else
                    onChangeDates(null, 0);
            }

        });
        new AirDatepicker('#dateTo', {
            selectedDates: [dateToDefault? dateToDefault : new Date()],
            autoClose: true,
            onSelect: ({date}) => {
                if (date)
                    onChangeDates(date, 1);
                else
                    onChangeDates(null, 1);
            }
        });


    }, [dateFromDefault, dateToDefault])
    const onKeyDown = (event) => {
        event.preventDefault();
        return false;
    };
    return <>
        <Row>
            <Form.Group className={'col-2'}>
                <Form.Label>Начало периода</Form.Label>
                <Form.Control onKeyDown={onKeyDown} id={'dateFrom'} type="text"/>
            </Form.Group>
            <Form.Group className={'col-2'}>
                <Form.Label>Конец периода</Form.Label>
                <Form.Control onKeyDown={onKeyDown} id={'dateTo'} type="text"/>
            </Form.Group>
        </Row>

        <Button className={'mt-2'} onClick={() => {
            //console.log(dateRange)
            if (typeof onSubmit === 'function')
                onSubmit(dateRange)

        }}>Сформировать</Button>
    </>
}
