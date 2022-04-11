export const formatDateFromSql = (date)=>{
    return date.split('-').reverse().join(".");
}

const makeFormat = () => {
    const options = {style: 'currency', currency: 'RUB'};
    return new Intl.NumberFormat('ru-RU', options).format;
}
export const rubFormat = makeFormat();
