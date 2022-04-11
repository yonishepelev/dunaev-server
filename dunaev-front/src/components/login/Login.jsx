import {Button, Container, Form} from "react-bootstrap";
import React, {useState} from "react";
import {auth} from "../../lib/api";



export const Login = () => {
    const [formData, setFormData] = useState({password: null, login: null})
    const fillData = (event) => {
        setFormData((e) => {
            e[event.target.id] = event.target.value;
            return e;
        })

    }

    return <Container className={'d-flex justify-content-center vh-100'}>
        <Form.Group className={'mt-5 col-3'}>
            <Form.Label>Логин</Form.Label>
            <Form.Control onChange={fillData} id={'login'} type="text"/>
            <Form.Label>Пароль</Form.Label>
            <Form.Control onChange={fillData} id={'password'} type="password"/>
            <Button className={'mt-3 '} onClick={async () => {
                const data = await auth(Object.values(formData));
                const {error} = data;
                if (error === 0)
                    window.location.reload();
            }}>Войти</Button>
        </Form.Group>
    </Container>
}
