'use strict';

import crypto from 'node:crypto';

class CryptoUtils {
    static generateRandomString(size = 32){
        return crypto.randomBytes(size / 2).toString('hex');
    }
}

export default CryptoUtils;
