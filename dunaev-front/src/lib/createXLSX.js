import * as FileSaver from 'file-saver';
import * as ExcelJS from "exceljs";
import {formatDateFromSql} from "./toolsFormat";

export const CreateXLSX = async ({contractors, beginning, movements}) => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet2");

    worksheet.columns = [
        {header: 'Контрагент / Договор / Документ', key: 'main', width: 15},
        {header: '', key: 'main2', width: 65},
        {header: 'Долг на начало', key: 'debtStart', width: 30},
        {header: 'Увеличение долга', key: 'debtPlus', width: 30},
        {header: 'Уменьшение долга', key: 'debtMinus', width: 30},
        {header: 'Долг на конец', key: 'ourDebt', width: 30},
        {header: '', key: 'theirDebt', width: 30}
    ];
    worksheet.mergeCells('A1:B2');
    worksheet.mergeCells('C1:C2');
    worksheet.mergeCells('D1:D2');
    worksheet.mergeCells('E1:E2');
    worksheet.mergeCells('F1:G1');
    worksheet.getCell('F2').value = 'Мы должны';
    worksheet.getCell('G2').value = 'Нам должны';

    worksheet.getRows(1, 2).forEach((row) => {
        row.eachCell(function (cell) {
            cell.style.alignment = {vertical: 'middle', horizontal: 'center'};
            cell.font = {bold: true}
        })
    })
    worksheet.getRows(2, 1).forEach((row) => {
        row.eachCell(function (cell) {
            cell.border = {
                bottom: {style: 'double'}
            };
        })
    });

    contractors.forEach(({contractor_name, contractor_id, contracts}) => {
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
        worksheet.addRow({
            main: contractor_name,
            debtStart: debtOnStart,
            debtPlus: totals[1] ? totals[1] : '',
            debtMinus: totals[0] ? totals[0] : '',
            ourDebt: debtOnEnd < 0 ? -1 * debtOnEnd : '',
            theirDebt: debtOnEnd > 0 ? debtOnEnd : ''
        });
        const currentRow = worksheet.rowCount;
        worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
        worksheet.getRow(currentRow).height = 21;
        worksheet.getRow(currentRow).eachCell(function (cell) {

            cell.font = {
                size: 14
            }
            if (cell.col > 2) {
                cell.numFmt = '# ###.00'
            }
        });
        contracts.sort((a,b)=>{
            if (a['contract_name'] > b['contract_name'])
                return 1;
            if (a['contract_name'] < b['contract_name'])
                return -1;
            return 0

        }).forEach(({contract_id, contract_name}) => {
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
            worksheet.addRow({
                main: contract_name,
                debtStart: debtOnStart,
                debtPlus: totals[1] ? totals[1] : '',
                debtMinus: totals[0] ? totals[0] : '',
                ourDebt: debtOnEnd < 0 ? -1 * debtOnEnd : '',
                theirDebt: debtOnEnd > 0 ? debtOnEnd : ''
            });
            const currentRow = worksheet.rowCount;
            worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
            worksheet.getRow(currentRow).height = 21;
            worksheet.getRow(currentRow).eachCell(function (cell) {
                cell.font = {
                    size: 12
                }
                if (cell.col > 2) {
                    cell.numFmt = '# ###.00'
                }
            });
            movementContract.forEach(({doc_type_name, date, number, rub_sum, stores}) => {
                const parsed_sum = parseFloat(rub_sum);
                debtOnStart += parsed_sum;
                const dateArr = date.split('-');
                worksheet.addRow({
                    main: new Date(dateArr[0], parseInt(dateArr[1]) - 1, parseInt(dateArr[2])+1),
                    main2: `${doc_type_name} №${number} от ${formatDateFromSql(date)}` +
                        ` ${stores ? 'на склады ' + stores : ''}`,
                    debtPlus: parsed_sum > 0 ? parsed_sum : '',
                    debtMinus: parsed_sum < 0 ? -1 * parsed_sum : '',
                    ourDebt: debtOnStart < 0 ? -1 * debtOnStart : '',
                    theirDebt: debtOnStart > 0 ? debtOnStart : ''

                })
                const currentRow = worksheet.rowCount;
                worksheet.getRow(currentRow).eachCell(function (cell) {
                    cell.font = {
                        size: 10
                    }

                    if (cell.col > 2) {
                        cell.numFmt = '# ###.00'
                    }
                });

            })

        })

    })

    const buffer = await workbook.xlsx.writeBuffer();
    const data = new Blob([buffer], {type: fileType});
    FileSaver.saveAs(data, 'Взаиморасчеты' + fileExtension);
}

