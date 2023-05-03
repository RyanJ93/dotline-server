'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import AESStaticParameters from './AESStaticParameters.js';

/**
 * @typedef AESEncryptionParametersUDTProperties
 *
 * @property {number} key_length
 * @property {string} mode
 * @property {string} iv
 */

/**
 * @typedef AESEncryptionParametersProperties
 *
 * @property {number} keyLength
 * @property {string} mode
 * @property {string} iv
 */

class AESEncryptionParameters extends AESStaticParameters {
    /**
     * Generates an instance of this class based on the given properties obtained from an UDT object from the database.
     *
     * @param {AESEncryptionParametersUDTProperties} properties
     *
     * @returns {AESEncryptionParameters}
     *
     * @throws {IllegalArgumentException} If an invalid properties object is given.
     */
    static makeFromUDT(properties){
        if ( properties === null || typeof properties !== 'object' ){
            throw new IllegalArgumentException('Invalid properties object.');
        }
        properties.keyLength = properties.key_length;
        return new AESEncryptionParameters(properties);
    }

    /**
     * Generates an instance of this class based on the fields sent thought a given HTTP request.
     *
     * @param {Request} request
     * @param {string} [prefix=""]
     *
     * @returns {AESEncryptionParameters}
     *
     * @throws {IllegalArgumentException} If an invalid prefix is given.
     */
    static makeFromHTTPRequest(request, prefix = ''){
        if ( prefix === null || typeof prefix !== 'string' ){
            throw new IllegalArgumentException('Invalid prefix.');
        }
        return new AESEncryptionParameters({
            keyLength: parseInt(request.body[prefix + 'KeyLength']),
            mode: request.body[prefix + 'Mode'],
            iv: request.body[prefix + 'IV']
        });
    }

    /**
     * @type {string}
     */
    #iv;

    /**
     * The class constructor.
     *
     * @param {AESEncryptionParametersProperties} properties
     */
    constructor(properties){
        super(properties);

        this.#iv = properties.iv;
    }

    /**
     * Returns the IV used in AES encryption.
     *
     * @returns {string}
     */
    getIV(){
        return this.#iv;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {AESEncryptionParametersProperties}
     */
    toJSON(){
        const JSONObject = super.toJSON();
        JSONObject.iv = this.#iv;
        return JSONObject;
    }

    /**
     * Returns a database serializable representation of this class.
     *
     * @returns {AESEncryptionParametersUDTProperties}
     */
    toUDT(){
        const UDTObject = super.toUDT();
        UDTObject.iv = this.#iv;
        return UDTObject;
    }
}

export default AESEncryptionParameters;
