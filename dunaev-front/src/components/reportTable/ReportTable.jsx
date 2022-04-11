import React, {Fragment} from 'react'
import {Button, Table} from "react-bootstrap";
import css from './main.module.css';
import {CreateXLSX} from "../../lib/createXLSX";
import {formatDateFromSql, rubFormat} from "../../lib/toolsFormat";



const saveFile = async (data) => {
    await CreateXLSX(data);
}
const ReportTableDoc = ({doc,  debtOnStart}) => {
    const {
        doc_type_name, date, number, rub_sum, stores,
        id, doc_type_id
    } = doc;
    const parsed_sum = parseFloat(rub_sum);
    debtOnStart += parsed_sum;
    const classClickable = [14, 17]
        .includes(doc_type_id) ? css.link : '';



    return (
        <Fragment >
            <tr className={css.documentRow}>
                <td>{formatDateFromSql(date)}</td>
                <td className={classClickable} onClick={() => {
                    if (!classClickable)
                        return false;
                    const url = new URL(
                        window.location.href + `get_doc?doc_type_id=${doc_type_id}&doc_id=${id}`
                    );
                    window.open(url.href, '_blank').focus();
                }}>{doc_type_name} №{number}
                    от {formatDateFromSql(date)}
                    &nbsp;{stores ? 'на склады ' + stores : ''}
                </td>
                <td></td>
                <td>{parsed_sum > 0 ? rubFormat(parsed_sum) : ''}</td>
                <td>{parsed_sum < 0 ? rubFormat(-1 * parsed_sum) : ''}</td>
                <td>{debtOnStart < 0 ? rubFormat(-1 * debtOnStart) : ''}</td>
                <td>{debtOnStart > 0 ? rubFormat(debtOnStart) : ''}</td>
            </tr>
        </Fragment>
    )
}
export const ReportTable = ({data}) => {
    if (data) {
        const {contractors, beginning, movements} = data;
        return (
            <div>
                <Table className={css.reportTable} id={'tableau'}>
                    <thead>
                    <tr>
                        <th colSpan={2} rowSpan={2}>Контрагент / Договор / Документ</th>
                        <th rowSpan={2}>Долг на начало</th>
                        <th rowSpan={2}>Увеличение долга</th>
                        <th rowSpan={2}>Уменьшение долга</th>
                        <th colSpan={2} className={css.headerCenter}>Долг на конец</th>
                    </tr>
                    <tr>
                        <th>Рыбачок должен</th>
                        <th>Рыбачку должны</th>

                    </tr>
                    </thead>
                    <tbody>
                    {contractors && contractors.map(({contractor_name, contractor_id, contracts}, index) => {

                        const beginningContractor = beginning.filter(({contractor_id: cur_contractor_id}) => {
                            return contractor_id === cur_contractor_id;
                        });
                        const movementContractor = movements.filter(({contractor_id: cur_contractor_id}) => {
                            return contractor_id === cur_contractor_id;
                        });
                        const debtOnStart = beginningContractor.reduce((acc, {rub_sum}) => {
                            return acc + parseFloat(rub_sum);
                        }, 0)
                        const totals = movementContractor.reduce((acc, {rub_sum}) => {
                            rub_sum = parseFloat(rub_sum);
                            if (rub_sum < 0)
                                acc[0] += (-1 * rub_sum);
                            else
                                acc[1] += rub_sum;
                            return acc;
                        }, [0, 0]);

                        const debtOnEnd = debtOnStart + totals[1] - totals[0];


                        return (
                            <React.Fragment key={index}>
                                <tr className={css.contractorName}>
                                    <td colSpan={2}>{contractor_name}</td>
                                    <td>{rubFormat(debtOnStart)}</td>
                                    <td>{rubFormat(totals[1])}</td>
                                    <td>{rubFormat(totals[0])}</td>
                                    <td>{debtOnEnd < 0 ? rubFormat(-1 * debtOnEnd) : ''}</td>
                                    <td>{debtOnEnd > 0 ? rubFormat(debtOnEnd) : ''}</td>
                                </tr>
                                {contracts && contracts.sort((a, b) => {
                                    if (a['contract_name'] > b['contract_name'])
                                        return 1;
                                    if (a['contract_name'] < b['contract_name'])
                                        return -1;
                                    return 0

                                }).map(({contract_id, contract_name}) => {
                                    const beginningContract = beginning.filter(({contract_id: cur_contract_id}) => {
                                        return contract_id === cur_contract_id;
                                    });
                                    const movementContract = movements.filter(({contract_id: cur_contract_id}) => {
                                        return contract_id === cur_contract_id;
                                    });
                                    let debtOnStart = beginningContract.reduce((acc, {rub_sum}) => {
                                        return acc + parseFloat(rub_sum);
                                    }, 0)
                                    const totals = movementContract.reduce((acc, {rub_sum}) => {
                                        rub_sum = parseFloat(rub_sum);
                                        if (rub_sum < 0)
                                            acc[0] += (-1 * rub_sum);
                                        else
                                            acc[1] += rub_sum;
                                        return acc;
                                    }, [0, 0]);
                                    if ([debtOnStart, ...totals].filter(e => e !== 0).length === 0)
                                        return null;
                                    const debtOnEnd = debtOnStart + totals[1] - totals[0];
                                    return (
                                        <Fragment key={contract_id}>
                                            <tr>
                                                <td colSpan={2}>{contract_name}</td>
                                                <td>{rubFormat(debtOnStart)}</td>
                                                <td>{rubFormat(totals[1])}</td>
                                                <td>{rubFormat(totals[0])}</td>
                                                <td>{debtOnEnd < 0 ? rubFormat(-1 * debtOnEnd) : ''}</td>
                                                <td>{debtOnEnd > 0 ? rubFormat(debtOnEnd) : ''}</td>
                                            </tr>
                                            {
                                                movementContract.length > 0 && movementContract.map((doc, index) => {
                                                    return <ReportTableDoc
                                                        key={index}
                                                        doc={doc}
                                                        debtOnStart={debtOnStart}
                                                    />
                                                })
                                            }
                                        </Fragment>
                                    )

                                })}
                            </React.Fragment>
                        )

                    })}
                    </tbody>

                </Table>

                <Button className={'mt-4'} onClick={() => {
                    saveFile(data).then((d) => {

                    });
                }}>Скачать отчёт</Button>
            </div>
        )
    } else
        return null;
}
