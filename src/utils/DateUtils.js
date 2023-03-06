'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';

class DateUtils {
    static formatDate(date, useDashSeparator = false){
        if ( !DateUtils.isDate(date) ){
            throw new IllegalArgumentException('Invalid date object.');
        }
        let formattedDate = ( '0' + ( date.getMonth() + 1 ) ).slice(-2);
        formattedDate += '/' + ( '0' + date.getDate() ).slice(-2);
        formattedDate += '/' + date.getFullYear();
        if ( useDashSeparator === true ){
            formattedDate = formattedDate.replaceAll('/', '-');
        }
        return formattedDate;
    }

    static formatDateInItalianFormat(date, useDashSeparator = false){
        if ( !DateUtils.isDate(date) ){
            throw new IllegalArgumentException('Invalid date object.');
        }
        let formattedDate = ( '0' + date.getDate() ).slice(-2);
        formattedDate += '/' + ( '0' + ( date.getMonth() + 1 ) ).slice(-2);
        formattedDate += '/' + date.getFullYear();
        if ( useDashSeparator === true ){
            formattedDate = formattedDate.replaceAll('/', '-');
        }
        return formattedDate;
    }

    static parseDateString(dateString){
        const [ day, month, year ] = dateString.split('/');
        let dateObject = new Date(year + '-' + month + '-' + day);
        if ( !DateUtils.isDate(dateObject) ){
            dateObject = null;
        }
        return dateObject;
    }

    static isDate(date){
        return date instanceof Date && !isNaN(date.getTime());
    }

    static getMonthShortName(date){
        if ( !DateUtils.isDate(date) ){
            throw new IllegalArgumentException('Invalid date object.');
        }
        return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][date.getMonth()];
    }
}

export default DateUtils;
