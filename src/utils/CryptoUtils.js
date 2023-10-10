'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import crypto from 'node:crypto';

class CryptoUtils {
    /**
     * Generates a pseudo-random token based on the given length.
     *
     * @param {number} [length=32]
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid length value is given.
     */
    static generateRandomString(length = 32){
        if ( length === null || isNaN(length) || length <= 0 ){
            throw new IllegalArgumentException('Invalid length value');
        }
        return crypto.randomBytes(length / 2).toString('hex');
    }
}

export default CryptoUtils;
