'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';

class StringUtils {
    /**
     * Converts a given string from camel case to snake case.
     *
     * @param {string} string
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid string is given.
     */
    static camelToUnderscore(string){
        if ( typeof string !== 'string' ){
            throw new IllegalArgumentException('Invalid string.');
        }
        const result = string.replace(/([A-Z])/g, ' $1');
        return result.split(' ').join('_').toLowerCase();
    }

    /**
     * Checks if the given username is a valid one.
     *
     * @param {string} username
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid username string is given.
     */
    static isValidUsername(username){
        if ( typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        return username !== '' && /^[a-z0-9.\-_]{3,16}$/i.test(username);
    }
}

export default StringUtils;
