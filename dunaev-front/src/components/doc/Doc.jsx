import {useEffect, useState} from "react";
import {getDoc} from "../../lib/api";
import {Alert, Container, Table} from "react-bootstrap";
import {formatDateFromSql} from "../../lib/toolsFormat";

const url = new URL(window.location.href);
const {doc_type_id, doc_id} = Object.fromEntries(url.searchParams.entries());

export const Doc = () => {

    const [error, setError] = useState(null);
    const [docData, setDocData] = useState(null);


    useEffect(() => {
        document.title = 'Документ';
        getDoc(doc_type_id, doc_id).then(({error, data}) => {
            if (error !== 0) {
                setError(1);
                return;
            }
            setError(0)
            setDocData(data);

        })
    }, []);

    if (error)
        return <Alert className={'mt-5'} variant={'danger'}>Ошибка при получении документа</Alert>
    if (error === 0 && docData) {
        const {doc_head, doc_name, doc_items} = docData;
        const {date, number, stores} = doc_head;
        console.log(doc_head)
        return (
            <Container className={'pt-5'}>
                <h3>{doc_name} №{number} от {formatDateFromSql(date)}</h3>
                <h5>{stores ? `на склад ${stores}`: ''}</h5>
                <Table striped>
                    <thead>
                    <tr>
                        <th></th>
                        <th>Наименование</th>
                        <th>Количество</th>
                        <th>Цена</th>
                        <th>Сумма</th>
                    </tr>
                    </thead>
                    <tbody>
                    {doc_items && doc_items.map(({line, item_name, sum, count}, index) => {
                        return (
                            <tr key={index}>
                                <td>{line}</td>
                                <td>{item_name}</td>
                                <td>{count}</td>
                                <td>{count !== 0 ? sum/count: ''}</td>
                                <td>{sum}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                </Table>
            </Container>
        )
    }
    return null;
}
