'use strict';

import AESEncryptionParameters from './AESEncryptionParameters.js';
import UserRecoveryParameters from './UserRecoveryParameters.js';

/**
 * @typedef UserCompositeRSAParametersProperties {UserRecoveryParametersProperties}
 *
 * @property {AESEncryptionParameters} recoveryRSAPrivateKeyEncryptionParameters
 * @property {AESEncryptionParameters} RSAPrivateKeyEncryptionParameters
 * @property {string} recoveryRSAPrivateKey
 * @property {string} RSAPrivateKey
 * @property {string} RSAPublicKey
 * @property {string} recoveryKey
 */

class UserCompositeRSAParameters extends UserRecoveryParameters {
    /**
     * Generates an instance of this class based on the fields sent thought a given HTTP request.
     *
     * @param {Request} request
     *
     * @returns {UserCompositeRSAParameters}
     *
     * @override
     */
    static makeFromHTTPRequest(request){
        const recoveryRSAPrivateKeyEncryptionParameters = AESEncryptionParameters.makeFromHTTPRequest(request, 'recoveryRSAPrivateKeyEncryptionParameters');
        const RSAPrivateKeyEncryptionParameters = AESEncryptionParameters.makeFromHTTPRequest(request, 'RSAPrivateKeyEncryptionParameters');
        return new UserCompositeRSAParameters({
            recoveryRSAPrivateKeyEncryptionParameters: recoveryRSAPrivateKeyEncryptionParameters,
            RSAPrivateKeyEncryptionParameters: RSAPrivateKeyEncryptionParameters,
            recoveryRSAPrivateKey: request.body.recoveryRSAPrivateKey,
            RSAPrivateKey: request.body.RSAPrivateKey,
            RSAPublicKey: request.body.RSAPublicKey,
            recoveryKey: request.body.recoveryKey
        });
    }

    /**
     * @type {AESEncryptionParameters}
     */
    #RSAPrivateKeyEncryptionParameters;

    /**
     * @type {string}
     */
    #RSAPrivateKey;

    /**
     * @type {string}
     */
    #RSAPublicKey;

    /**
     * The class constructor.
     *
     * @param {UserCompositeRSAParametersProperties} properties
     */
    constructor(properties){
        super(properties);

        this.#RSAPrivateKeyEncryptionParameters = properties.RSAPrivateKeyEncryptionParameters;
        this.#RSAPrivateKey = properties.RSAPrivateKey;
        this.#RSAPublicKey = properties.RSAPublicKey;
    }

    /**
     * Returns RSA private key's encryption parameters.
     *
     * @returns {AESEncryptionParameters}
     */
    getRSAPrivateKeyEncryptionParameters(){
        return this.#RSAPrivateKeyEncryptionParameters;
    }

    /**
     * Returns the RSA private key.
     *
     * @returns {string}
     */
    getRSAPrivateKey(){
        return this.#RSAPrivateKey;
    }

    /**
     * Returns the RSA public key.
     *
     * @returns {string}
     */
    getRSAPublicKey(){
        return this.#RSAPublicKey;
    }
}

export default UserCompositeRSAParameters;
