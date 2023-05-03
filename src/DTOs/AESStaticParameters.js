'use strict';

import UDTImplementation from './UDTImplementation.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';

/**
 * @typedef AESStaticParametersUDTProperties
 *
 * @property {number} key_length
 * @property {string} mode
 */

/**
 * @typedef AESStaticParametersProperties
 *
 * @property {number} keyLength
 * @property {string} mode
 */

class AESStaticParameters extends UDTImplementation {
    /**
     * Generates an instance of this class based on the given properties obtained from an UDT object from the database.
     *
     * @param {AESStaticParametersUDTProperties} properties
     *
     * @returns {AESStaticParameters}
     *
     * @throws {IllegalArgumentException} If an invalid properties object is given.
     */
    static makeFromUDT(properties){
        if ( properties === null || typeof properties !== 'object' ){
            throw new IllegalArgumentException('Invalid properties object.');
        }
        properties.keyLength = properties.key_length;
        return new AESStaticParameters(properties);
    }

    /**
     * Generates an instance of this class based on the fields sent thought a given HTTP request.
     *
     * @param {Request} request
     * @param {string} [prefix=""]
     *
     * @returns {AESStaticParameters}
     *
     * @throws {IllegalArgumentException} If an invalid prefix is given.
     */
    static makeFromHTTPRequest(request, prefix = ''){
        if ( prefix === null || typeof prefix !== 'string' ){
            throw new IllegalArgumentException('Invalid prefix.');
        }
        return new AESStaticParameters({
            keyLength: parseInt(request.body[prefix + 'KeyLength']),
            mode: request.body[prefix + 'Mode']
        });
    }

    /**
     * @type {number}
     *
     * @protected
     */
    _keyLength;

    /**
     * @type {string}
     *
     * @protected
     */
    _mode;

    /**
     * The class constructor.
     *
     * @param {AESStaticParametersProperties} properties
     */
    constructor(properties){
        super(properties);

        this._keyLength = properties.keyLength;
        this._mode = properties.mode;
    }

    /**
     * Returns the encryption key length.
     *
     * @returns {number}
     */
    getKeyLength(){
        return this._keyLength;
    }

    /**
     * Returns the AES mode.
     *
     * @returns {string}
     */
    getMode(){
        return this._mode;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {AESStaticParametersProperties}
     */
    toJSON(){
        return {
            keyLength: this._keyLength,
            mode: this._mode
        };
    }

    /**
     * Returns a database serializable representation of this class.
     *
     * @returns {AESStaticParametersUDTProperties}
     */
    toUDT(){
        return {
            key_length: this._keyLength,
            mode: this._mode
        };
    }
}

export default AESStaticParameters;
