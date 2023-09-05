'use strict';

/**
 * @typedef UserRecoveryInitializationParametersProperties
 *
 * @property {AESEncryptionParameters} recoveryRSAPrivateKeyEncryptionParameters
 * @property {string} recoveryRSAPrivateKey
 */

class UserRecoveryInitializationParameters {
    /**
     * @type {AESEncryptionParameters}
     *
     * @protected
     */
    _recoveryRSAPrivateKeyEncryptionParameters;

    /**
     * @type {string}
     *
     * @protected
     */
    _recoveryRSAPrivateKey;

    /**
     * The class constructor.
     *
     * @param {UserRecoveryInitializationParametersProperties} properties
     */
    constructor(properties){
        this._recoveryRSAPrivateKeyEncryptionParameters = properties.recoveryRSAPrivateKeyEncryptionParameters;
        this._recoveryRSAPrivateKey = properties.recoveryRSAPrivateKey;
    }

    /**
     * Returns recovery RSA private key's encryption parameters.
     *
     * @returns {AESEncryptionParameters}
     */
    getRecoveryRSAPrivateKeyEncryptionParameters(){
        return this._recoveryRSAPrivateKeyEncryptionParameters;
    }

    /**
     * Returns the recovery RSA private key.
     *
     * @returns {string}
     */
    getRecoveryRSAPrivateKey(){
        return this._recoveryRSAPrivateKey;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {UserRecoveryInitializationParametersProperties}
     */
    toJSON(){
        return {
            recoveryRSAPrivateKeyEncryptionParameters: this._recoveryRSAPrivateKeyEncryptionParameters,
            recoveryRSAPrivateKey: this._recoveryRSAPrivateKey
        };
    }
}

export default UserRecoveryInitializationParameters;
