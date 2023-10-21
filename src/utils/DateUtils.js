'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';

class DateUtils {
    /**
     * Formats a given date as a human-readable string.
     *
     * @param {Date} date
     * @param {boolean} [useDashSeparator=false]
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid date is given.
     */
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

    /**
     * Formats a given date as an Italian date string.
     *
     * @param {Date} date
     * @param {boolean} [useDashSeparator=false]
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid date is given.
     */
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

    /**
     * Parses a date as a string and convert it into a date object.
     *
     * @param {string} dateString
     *
     * @returns {Date}
     *
     * @throws {IllegalArgumentException} If an invalid date string is given.
     */
    static parseDateString(dateString){
        if ( dateString === '' || typeof dateString !== 'string' ){
            throw new IllegalArgumentException('Invalid date string.');
        }
        const [ day, month, year ] = dateString.split('/');
        let dateObject = new Date(year + '-' + month + '-' + day);
        if ( !DateUtils.isDate(dateObject) ){
            dateObject = null;
        }
        return dateObject;
    }

    /**
     * Checks if the given object is a valid date object or not.
     *
     * @param {any} date
     *
     * @returns {boolean}
     */
    static isDate(date){
        return date instanceof Date && !isNaN(date.getTime());
    }

    /**
     * Extracts month from the given date and then return its English short name.
     *
     * @param {Date} date
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid date string is given.
     */
    static getMonthShortName(date){
        if ( !DateUtils.isDate(date) ){
            throw new IllegalArgumentException('Invalid date object.');
        }
        return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][date.getMonth()];
    }
}

export default DateUtils;
