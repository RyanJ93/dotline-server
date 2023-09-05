'use strict';

import UserRecoveryInitializationParameters from './UserRecoveryInitializationParameters.js';
import AESEncryptionParameters from './AESEncryptionParameters.js';

/**
 * @typedef UserRecoveryParametersProperties {UserRecoveryInitializationParametersProperties}
 *
 * @property {AESEncryptionParameters} recoveryRSAPrivateKeyEncryptionParameters
 * @property {string} recoveryRSAPrivateKey
 * @property {string} recoveryKey
 */

class UserRecoveryParameters extends UserRecoveryInitializationParameters {
    /**
     * Generates an instance of this class based on the fields sent thought a given HTTP request.
     *
     * @param {Request} request
     *
     * @returns {UserRecoveryParameters}
     */
    static makeFromHTTPRequest(request){
        const recoveryRSAPrivateKeyEncryptionParameters = AESEncryptionParameters.makeFromHTTPRequest(request, 'recoveryRSAPrivateKeyEncryptionParameters');
        return new UserRecoveryParameters({
            recoveryRSAPrivateKeyEncryptionParameters: recoveryRSAPrivateKeyEncryptionParameters,
            recoveryRSAPrivateKey: request.body.recoveryRSAPrivateKey,
            recoveryKey: request.body.recoveryKey
        });
    }

    /**
     * @type {string}
     *
     * @protected
     */
    _recoveryKey;

    /**
     * The class constructor.
     *
     * @param {UserRecoveryParametersProperties} properties
     */
    constructor(properties){
        super(properties);

        this._recoveryKey = properties.recoveryKey;
    }

    /**
     * Returns the recovery key.
     *
     * @returns {string}
     */
    getRecoveryKey(){
        return this._recoveryKey;
    }
}

export default UserRecoveryParameters;
